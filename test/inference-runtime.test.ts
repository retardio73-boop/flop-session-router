import test from "node:test";
import assert from "node:assert/strict";
import { InferenceGateway, type InferenceRequest, type InferenceWorker, type WorkerHealth } from "../src/inference-gateway.js";
import { SafeInferenceRuntime, type InferenceResourceGuard } from "../src/inference-runtime.js";
import { WindowsGpuResourceGuard, DEFAULT_RESOURCE_POLICY, type ResourceSnapshot } from "../src/inference-resource.js";

class SlowWorker implements InferenceWorker {
  active = 0;
  maxSeen = 0;
  constructor(public id: string, public models: string[]) {}
  async health(): Promise<WorkerHealth> { return { ok: true, latencyMs: 1, checkedAt: new Date().toISOString() }; }
  async *stream(_request: InferenceRequest) {
    this.active += 1;
    this.maxSeen = Math.max(this.maxSeen, this.active);
    await new Promise((resolve) => setTimeout(resolve, 20));
    yield { text: "ok", done: false };
    this.active -= 1;
    yield { text: "", done: true };
  }
}

const clearSnapshot: ResourceSnapshot = {
  gpu: { available: true, utilizationPct: 5, memoryUsedMiB: 1000, memoryTotalMiB: 12288, temperatureC: 40, observedAt: new Date().toISOString() },
  pauseProcesses: []
};
class ClearGuard implements InferenceResourceGuard {
  async waitUntilAvailable() { return clearSnapshot; }
  async snapshot() { return clearSnapshot; }
}

test("safe runtime serializes inference when maxConcurrent is one", async () => {
  const worker = new SlowWorker("local", ["tiny"]);
  const runtime = new SafeInferenceRuntime(new InferenceGateway([worker]), new ClearGuard(), 1);
  const req: InferenceRequest = { model: "tiny", messages: [{ role: "user", content: "hi" }] };
  await Promise.all([runtime.generate(req), runtime.generate(req), runtime.generate(req)]);
  assert.equal(worker.maxSeen, 1);
  assert.equal(runtime.metrics().completed, 3);
  assert.equal(runtime.metrics().failed, 0);
});

test("resource policy pauses on gpu pressure and remains clear when idle", () => {
  const guard = new WindowsGpuResourceGuard(DEFAULT_RESOURCE_POLICY, []);
  assert.equal(guard.shouldPause(clearSnapshot), undefined);
  const busy: ResourceSnapshot = { ...clearSnapshot, gpu: { ...clearSnapshot.gpu, utilizationPct: 95 } };
  assert.match(guard.shouldPause(busy) ?? "", /GPU_BUSY/);
});
