import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { SafeInferenceRuntime } from "./inference-runtime.js";
import type { InferenceRequest } from "./inference-gateway.js";

const MAX_BODY = 128 * 1024;
const send = (res: ServerResponse, status: number, value: unknown) => {
  const body = JSON.stringify(value);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(body) });
  res.end(body);
};

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("INVALID_BODY");
  return parsed as Record<string, unknown>;
}
export function createInferenceServer(runtime: SafeInferenceRuntime, models: string[]) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET" && url.pathname === "/healthz") return send(res, 200, { status: "ok" });
      if (req.method === "GET" && url.pathname === "/v1/models") {
        return send(res, 200, { object: "list", data: models.map((id) => ({ id, object: "model", owned_by: "local" })) });
      }
      if (req.method === "GET" && url.pathname === "/metrics") {
        return send(res, 200, { runtime: runtime.metrics(), workers: runtime.gatewayMetrics() });
      }
      if (req.method === "GET" && url.pathname === "/resource") {
        return send(res, 200, await runtime.resourceSnapshot());
      }
      if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
        const body = await readBody(req);
        if (body.stream === true) return send(res, 400, { error: "STREAMING_NOT_YET_SUPPORTED" });
        const request: InferenceRequest = {
          model: String(body.model ?? ""),
          messages: Array.isArray(body.messages) ? body.messages as InferenceRequest["messages"] : [],
          temperature: typeof body.temperature === "number" ? body.temperature : undefined,
          maxTokens: typeof body.max_tokens === "number" ? body.max_tokens : undefined
        };
        if (!request.model || request.messages.length === 0) return send(res, 400, { error: "INVALID_INFERENCE_REQUEST" });
        const result = await runtime.generate(request);
        return send(res, 200, {
          id: `chatcmpl-${Date.now()}`, object: "chat.completion", model: request.model,
          choices: [{ index: 0, message: { role: "assistant", content: result.text }, finish_reason: "stop" }],
          usage: { completion_tokens_estimate: result.outputTokensEstimate },
          x_flop: { worker_id: result.workerId, ttft_ms: result.ttftMs, latency_ms: result.latencyMs, tokens_per_second: result.tokensPerSecond }
        });
      }
      return send(res, 404, { error: "not found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      const status = message === "PAYLOAD_TOO_LARGE" ? 413 : message.startsWith("RESOURCE_GUARD_TIMEOUT") ? 503 : 400;
      return send(res, status, { error: message });
    }
  });
}
