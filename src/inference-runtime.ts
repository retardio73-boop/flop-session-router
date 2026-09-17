import type { GatewayResult, InferenceGateway, InferenceRequest } from "./inference-gateway.js";
import type { ResourceSnapshot } from "./inference-resource.js";

export interface InferenceResourceGuard {
  waitUntilAvailable(): Promise<ResourceSnapshot>;
  snapshot(): Promise<ResourceSnapshot>;
}

export interface RuntimeMetrics {
  active: number;
  queued: number;
  completed: number;
  failed: number;
  lastResource?: ResourceSnapshot;
}

export class SafeInferenceRuntime {
  private active = 0;
  private queued = 0;
  private completed = 0;
  private failed = 0;
  private waiters: Array<() => void> = [];
  private lastResource?: ResourceSnapshot;

  constructor(
    private readonly gateway: InferenceGateway,
    private readonly guard: InferenceResourceGuard,
    private readonly maxConcurrent = 1
  ) {}
  metrics(): RuntimeMetrics {
    return {
      active: this.active,
      queued: this.queued,
      completed: this.completed,
      failed: this.failed,
      lastResource: this.lastResource
    };
  }

  private async acquire(): Promise<void> {
    if (this.active < this.maxConcurrent) {
      this.active += 1;
      return;
    }
    this.queued += 1;
    await new Promise<void>((resolve) => this.waiters.push(resolve));
    this.queued -= 1;
    this.active += 1;
  }

  private release(): void {
    this.active = Math.max(0, this.active - 1);
    this.waiters.shift()?.();
  }
  async generate(request: InferenceRequest): Promise<GatewayResult> {
    await this.acquire();
    try {
      this.lastResource = await this.guard.waitUntilAvailable();
      const result = await this.gateway.generate(request);
      this.completed += 1;
      return result;
    } catch (error) {
      this.failed += 1;
      throw error;
    } finally {
      this.release();
    }
  }

  async resourceSnapshot(): Promise<ResourceSnapshot> {
    this.lastResource = await this.guard.snapshot();
    return this.lastResource;
  }

  gatewayMetrics() {
    return this.gateway.metrics();
  }
}
