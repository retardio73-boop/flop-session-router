# FLOP Session Router

Deterministic off-chain miner selection, preflight, failover and auditable decision routing for FLOP compute-session tooling.

> **Alpha community project. Not an official FLOP Labs product.**

This is an independent community tool. It is **not** the official FLOP router, a validator, miner, settlement protocol, blockchain replacement, endorsement, or proof that live FLOP settlement is available. It currently supports local routing simulation and integration development. No fake miners, sessions, balances, or settlement results are presented as live network data.

## What works today

- Typed candidate/request/evaluation/decision/outcome models.
- Hard compatibility gates before ranking.
- Deterministic, explainable scoring and stable ID tie-breaking.
- SSRF-aware bounded endpoint preflight.
- SQLite migrations and durable decisions, FailedAck observations, attempts, session outcomes, preflight observations and circuit state.
- Bounded failover and `CLOSED`/`OPEN` recovery state.
- Stored-evaluation replay with configuration and snapshot hashes; full algorithmic recomputation is a known alpha limitation.
- Memory-only development signer and typed external signer boundary. Router core never owns production keys.
- Local HTTP API and non-interactive CLI.

FLOP compute-channel mechanics are reported as live internally, but no authoritative public FLOP runtime/API/SDK integration is available and configured for this Router. The adapter therefore fails closed with `PUBLIC_RUNTIME_UNAVAILABLE`. The Yellow Paper remains a target specification for this public adapter boundary.

## Install and run

```powershell
npm ci
npm run check
npm run build
npm test
node dist/src/cli.js route --request examples/request.json --candidates examples/candidates.json --db demo.db
node dist/src/cli.js replay DECISION_ID --db demo.db
node dist/src/cli.js inspect DECISION_ID --db demo.db
node dist/src/cli.js serve --candidates examples/candidates.json --host 127.0.0.1 --port 8788
```

The fixture contains three candidates: one hard-rejected, one eligible fallback, and one deterministic winner. The route command stores the decision in `demo.db`; use the returned decision ID with `replay` or `inspect`.

No command prompts for a passphrase or login. `serve` binds to loopback by default; expose it only behind your own authenticated gateway.

## Routing invariants

Eligibility precedes score. Missing observations are unknown/neutral, never perfect. An advertised `maxLatencyMs` is a hard constraint: missing latency data or an observation above the limit rejects the candidate. Scores are rounded to six decimal places and ties resolve by miner ID. Preflight has a deadline, bounded response size, no redirects, DNS/private-address rejection by default, and bounded candidate concurrency. Completion order never affects ranking.

`replay` verifies the persisted configuration hash and deterministically replays the stored eligibility/score evaluation. It never mutates history; mismatch returns `DECISION_REPLAY_DIVERGENCE`. **Alpha limitation:** it does not yet re-run the current scoring implementation from raw telemetry, so this is stored-evaluation replay rather than full algorithmic recomputation.

## Signers

The normal signing path is typed and domain-separated: parse, validate, canonicalize, re-encode, apply policy, then call `Signer`. `EphemeralSigner` is memory-only and test-only. `ExternalSigner` keeps custody outside Router and fails closed on timeout, redirects, oversized bodies, unsafe endpoints, invalid schemas or a mismatched payload hash. Private/local signer endpoints require explicit opt-in. `SecretInjectedSigner` is explicit opt-in, memory-only, and accepts PKCS#8 DER from a deployment secret provider; the CLI does not expose it.

## Extension boundary

Implement `MinerCandidateProvider` to supply public or private candidate intelligence without changing Router core. Capabilities, telemetry, prices and FailedAck observations may carry evidence provenance and coverage. Router consumes those facts; it does not own global reputation, productive keys, TCLK, treasury, wallet intelligence, strategy or monitoring.

## API

`GET /healthz`, `GET /readyz`, `POST /v1/route`, `GET /v1/decisions/:id`, `GET /v1/miners`, `GET /v1/miners/:id`, and `GET /metrics`. Miner views are snapshots from the configured provider; they are not a global FLOP miner registry. See `openapi.json`.

## Compatibility

`protocol-compat.json` pins released and upstream sources. FLOP Yellow Paper `0.5.0-draft` is `TARGET_SPEC`; its internal implementation matrix is distinct from this repository's `PUBLIC_RUNTIME_UNAVAILABLE` adapter state. TCLK is not reimplemented here.

## Security

See `SECURITY.md`. The current SSRF checks cover loopback, private, link-local, reserved and IPv4-mapped IPv6 addresses, but remain defense-in-depth rather than complete DNS-rebinding protection. Never route funded production traffic through fixture providers or ephemeral signers.

## Maturity

Release `v0.1.1-alpha` is an early public release intended for simulation, policy development, endpoint preflight, failure handling, route auditing, and local integrations. An authoritative public FLOP runtime adapter and value-settlement integration are unavailable here; this does not imply that FLOP's internal protocol mechanics do not exist.
