# Changelog

## 0.1.3-alpha - 2026-09-17

- Add an experimental single-machine local inference gateway independent of FLOP settlement.
- Add Ollama and OpenAI-compatible worker boundaries with model-aware routing, health checks and bounded failover.
- Add queueing, conservative single-GPU concurrency, TTFT/latency/decode-rate metrics and NVIDIA resource snapshots.
- Add configurable GPU/VRAM/temperature admission guards, idle model release and BelowNormal/headless Windows helpers.
- Add OpenAI-style local endpoints, manual benchmark tooling and inference-runtime tests.
- Document the current boundary: no vLLM/SGLang, continuous batching, scheduler-owned KV cache/PagedAttention, exact tokenizer accounting, multi-GPU serving or production authentication yet.

## 0.1.2-alpha - 2026-09-11

- Add a regression proving that numerically smaller quotes in incompatible units are rejected instead of ranked against a requested session-price unit.
- Preserve explicit fail-closed behavior until FLOP exposes a canonical/versioned quote-discovery contract or stable SDK boundary.
- Keep routing scope narrow: candidate compatibility, preflight, deterministic ranking, failover, persistence and auditable decisions; no speculative market-normalization layer is introduced.

## 0.1.1-alpha - 2026-09-08

- Clarify that internal FLOP protocol mechanics and this public adapter's availability are distinct.
- Accept provenance and coverage metadata on candidate facts without owning global reputation.
- Rename the fail-closed adapter result to `PUBLIC_RUNTIME_UNAVAILABLE`.

## 0.1.0-alpha - 2026-09-08

- Initial standalone Router with deterministic eligibility/ranking, bounded preflight, failover, circuit state, SQLite persistence, stored-evaluation replay, hardened signer interfaces, CLI and provider-scoped API.
