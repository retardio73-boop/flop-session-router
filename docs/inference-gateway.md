# Local inference gateway

The Router now includes an experimental inference-serving boundary that can route real LLM requests independently of FLOP settlement.

## Zero-cost local path

The tested local worker is Ollama on `127.0.0.1:11434`. `OllamaWorker` uses Ollama's native streaming API; `OpenAICompatibleWorker` is available for compatible remote or local servers.

The gateway currently provides:
- model compatibility filtering;
- worker health checks;
- bounded failover across compatible workers;
- active-request-aware ranking;
- TTFT, end-to-end latency and estimated tokens/sec EWMA metrics;
- fail-closed behavior when no compatible worker exists or all workers fail.

This layer does not claim FLOP settlement, GPU scheduling, exact tokenizer accounting or distributed model parallelism.
