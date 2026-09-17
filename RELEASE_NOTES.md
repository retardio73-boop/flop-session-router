# v0.1.3-alpha

Experimental local inference-infrastructure release for FLOP Session Router.

## Included

- Local inference gateway for real LLM requests, independent of FLOP settlement.
- Ollama worker plus an OpenAI-compatible worker boundary.
- Model-aware routing, worker health checks and bounded failover.
- Queueing with conservative single-GPU concurrency by default.
- TTFT, end-to-end latency and decode-rate EWMA metrics.
- NVIDIA GPU utilization, VRAM, temperature and power snapshots.
- Admission pause on configurable GPU, VRAM or temperature thresholds.
- OpenAI-style `POST /v1/chat/completions`, `GET /v1/models`, `/metrics` and `/resource` endpoints.
- Windows BelowNormal priority, headless start/stop helpers and Ollama idle model release.
- Manual concurrent benchmark tooling and inference-specific runtime tests.

## Reproducible local smoke

```powershell
npm ci
npm run check
npm run inference:smoke
npm run inference:serve
```

With Ollama available on `127.0.0.1:11434`, the smoke path routes an actual local request through the gateway and reports TTFT, total latency and decode-rate metrics.

## Alpha limitations

- Single-machine serving only; no multi-GPU or distributed model parallelism.
- Local backend is Ollama; vLLM and SGLang are not integrated yet.
- No continuous batching or scheduler-owned KV cache / PagedAttention implementation.
- Gateway token counts are estimates rather than tokenizer-exact accounting.
- Client-facing SSE streaming is not yet exposed by the gateway API.
- No production authentication layer; loopback binding is the safe default.
- GPU admission controls are resource protections, not security boundaries.
- FLOP settlement/runtime integration remains separate and still fails closed when unavailable.

Release artifacts and SHA-256 checksums are generated from the exact tagged commit.
