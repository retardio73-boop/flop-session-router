import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GpuSnapshot {
  available: boolean;
  utilizationPct?: number;
  memoryUsedMiB?: number;
  memoryTotalMiB?: number;
  temperatureC?: number;
  powerW?: number;
  observedAt: string;
  reason?: string;
}

export interface ResourceSnapshot {
  gpu: GpuSnapshot;
  pauseProcesses: string[];
}

export interface ResourcePolicy {
  pauseGpuUtilizationPct: number;
  maxVramUsedMiB: number;
  maxTemperatureC: number;
  pollMs: number;
  waitTimeoutMs: number;
}
export const DEFAULT_RESOURCE_POLICY: ResourcePolicy = {
  pauseGpuUtilizationPct: 70,
  maxVramUsedMiB: 9216,
  maxTemperatureC: 82,
  pollMs: 2000,
  waitTimeoutMs: 30000
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class WindowsGpuResourceGuard {
  constructor(
    private readonly policy: ResourcePolicy = DEFAULT_RESOURCE_POLICY,
    private readonly pauseProcessNames: string[] = []
  ) {}

  async snapshot(): Promise<ResourceSnapshot> {
    const gpu = await this.readGpu();
    const pauseProcesses = await this.findPauseProcesses();
    return { gpu, pauseProcesses };
  }
  private async readGpu(): Promise<GpuSnapshot> {
    try {
      const { stdout } = await execFileAsync(process.platform === "win32" ? "C:\\Windows\\System32\\nvidia-smi.exe" : "nvidia-smi", [
        "--query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw",
        "--format=csv,noheader,nounits"
      ], { windowsHide: true, timeout: 3000 });
      const line = stdout.trim().split(/\r?\n/)[0];
      if (!line) throw new Error("NO_GPU_ROW");
      const [util, used, total, temp, power] = line.split(",").map((v) => v.trim());
      return {
        available: true,
        utilizationPct: Number(util),
        memoryUsedMiB: Number(used),
        memoryTotalMiB: Number(total),
        temperatureC: Number(temp),
        powerW: Number(power),
        observedAt: new Date().toISOString()
      };
    } catch (error) {
      return { available: false, observedAt: new Date().toISOString(), reason: String(error) };
    }
  }
  private async findPauseProcesses(): Promise<string[]> {
    if (process.platform !== "win32") return [];
    try {
      const { stdout } = await execFileAsync("tasklist", ["/FO", "CSV", "/NH"], { windowsHide: true, timeout: 3000 });
      const names = stdout.split(/\r?\n/)
        .map((line) => line.match(/^"([^"]+)"/)?.[1]?.toLowerCase())
        .filter(Boolean) as string[];
      return this.pauseProcessNames.filter((name) => names.includes(name.toLowerCase()));
    } catch {
      return [];
    }
  }

  shouldPause(snapshot: ResourceSnapshot): string | undefined {
    const gpu = snapshot.gpu;
    if (snapshot.pauseProcesses.length > 0) return `PAUSE_PROCESS:${snapshot.pauseProcesses.join(",")}`;
    if (!gpu.available) return undefined;
    if ((gpu.utilizationPct ?? 0) >= this.policy.pauseGpuUtilizationPct) return `GPU_BUSY:${gpu.utilizationPct}`;
    if ((gpu.memoryUsedMiB ?? 0) >= this.policy.maxVramUsedMiB) return `VRAM_LIMIT:${gpu.memoryUsedMiB}`;
    if ((gpu.temperatureC ?? 0) >= this.policy.maxTemperatureC) return `GPU_HOT:${gpu.temperatureC}`;
    return undefined;
  }
  async waitUntilAvailable(): Promise<ResourceSnapshot> {
    const started = Date.now();
    while (true) {
      const snapshot = await this.snapshot();
      const reason = this.shouldPause(snapshot);
      if (!reason) return snapshot;
      if (Date.now() - started >= this.policy.waitTimeoutMs) {
        throw new Error(`RESOURCE_GUARD_TIMEOUT:${reason}`);
      }
      await sleep(this.policy.pollMs);
    }
  }
}
