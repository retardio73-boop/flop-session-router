import test from "node:test";
import assert from "node:assert/strict";
import { InferenceGateway, type InferenceRequest, type InferenceWorker, type WorkerHealth } from "../src/inference-gateway.js";

class FakeWorker implements InferenceWorker {
  constructor(public id: string, public models: string[], private readonly chunks: string[], private readonly healthy = true) {}
  async health(): Promise<WorkerHealth> { return { ok: this.healthy, latencyMs: 1, checkedAt: new Date().toISOString(), reason: this.healthy ? undefined : "down" }; }
  async *stream(_request: InferenceRequest) { for (const text of this.chunks) yield { text, done: false }; yield { text: "", done: true }; }
}

test("routes to a compatible worker and records metrics", async () => {
  const gateway = new InferenceGateway([new FakeWorker("local-a", ["tiny"], ["hel", "lo"])]);
  const result = await gateway.generate({ model: "tiny", messages: [{ role: "user", content: "hi" }] });
  const metrics = gateway.metrics()["local-a"]!;
  assert.equal(result.workerId, "local-a");
  assert.equal(result.text, "hello");
  assert.equal(metrics.requests, 1);
  assert.ok(metrics.ttftMsEwma !== undefined);
});
test("fails over when the first compatible worker is unhealthy", async () => {
  const gateway = new InferenceGateway([
    new FakeWorker("a", ["tiny"], ["bad"], false),
    new FakeWorker("b", ["tiny"], ["ok"])
  ]);
  const result = await gateway.generate({ model: "tiny", messages: [{ role: "user", content: "hi" }] });
  assert.equal(result.workerId, "b");
  assert.equal(result.text, "ok");
  assert.equal(gateway.metrics().a!.failures, 1);
});

test("fails closed when no worker serves the model", async () => {
  const gateway = new InferenceGateway([new FakeWorker("a", ["other"], ["x"])]);
  await assert.rejects(
    gateway.generate({ model: "tiny", messages: [{ role: "user", content: "hi" }] }),
    /NO_INFERENCE_WORKER_FOR_MODEL/
  );
});
