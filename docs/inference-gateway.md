# Local inference gateway

The Router includes an experimental inference-serving boundary that routes real local LLM requests independently of FLOP settlement.

## Zero-cost local path

The tested worker is Ollama on `127.0.0.1:11434`. `OllamaWorker` uses native streaming; `OpenAICompatibleWorker` supports compatible local or remote servers.

Current capabilities:
- model compatibility filtering and worker health checks;
- bounded failover and active-request-aware ranking;
- TTFT, end-to-end latency and decode-rate EWMA metrics;
- queueing with a conservative default of one concurrent GPU request;
- NVIDIA utilization, VRAM, temperature and power snapshots;
- admission pause when GPU/VRAM/temperature thresholds are exceeded;
- optional process-name pause list for gaming or other GPU-sensitive workloads;
- OpenAI-style `POST /v1/chat/completions`, `GET /v1/models`, `/metrics`, `/resource`;
- Ollama idle model release (`keep_alive`, default `2m`);
- BelowNormal priority for the gateway and Ollama on Windows.

## Conservative defaults

`FLOP_MAX_CONCURRENT=1`, `FLOP_GPU_PAUSE_PCT=70`, `FLOP_GPU_MAX_VRAM_MIB=9216`, `FLOP_GPU_MAX_TEMP_C=82`, and `FLOP_OLLAMA_KEEP_ALIVE=2m` protect the desktop from becoming a permanently saturated inference host. Set `FLOP_PAUSE_PROCESSES` to a comma-separated process list to block new inference while selected games or applications are running.

Run interactively with `npm run inference:serve`. On Windows, `tools/start-inference-hidden.vbs` starts it without a visible console; `tools/stop-inference.ps1` stops the PID written by the gateway. The service binds to loopback by default.

`node tools/benchmark-inference.js` sends a small concurrent benchmark through the gateway. Keep load tests manual; they intentionally exercise the GPU.

## Current boundary

This is a single-machine serving layer, not distributed model parallelism. Client-side SSE streaming is not yet exposed by the gateway API, token counts are estimated at the gateway boundary, and the local backend is Ollama rather than vLLM/SGLang. vLLM is a later step because this Windows host currently has no Linux WSL distribution, Docker runtime, or CUDA toolkit installed.
