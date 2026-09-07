# FLOP Session Router

Deterministic off-chain miner selection, preflight, failover and decision replay for FLOP compute sessions.

This is an independent community tool. It is **not** the official FLOP router, a validator, miner, settlement protocol, blockchain replacement, or proof that live FLOP settlement is available.

## What works

- Typed candidate/request/evaluation/decision/outcome models.
- Hard compatibility gates before ranking.
- Deterministic, explainable scoring and stable ID tie-breaking.
- SSRF-aware bounded endpoint preflight.
- SQLite migrations and durable decisions, FailedAck observations, attempts and circuit state.
- Bounded failover and `CLOSED`/`OPEN` recovery state.
- Byte-reproducible decision replay with configuration and snapshot hashes.
- Memory-only development signer and typed external signer boundary. Router core never owns production keys.
- Local HTTP API and non-interactive CLI.

The FLOP runtime adapter currently fails closed with `RUNTIME_UNAVAILABLE`. The Yellow Paper is a target specification and its implementation-status matrix is authoritative about what is live.

## Install and run

```powershell
npm ci
npm run check
npm run build
node dist/src/cli.js route --request examples/request.json --candidates examples/candidates.json --db demo.db
node dist/src/cli.js replay DECISION_ID --db demo.db
node dist/src/cli.js serve --candidates examples/candidates.json --host 127.0.0.1 --port 8788
```

No command prompts for a passphrase or login. `serve` binds to loopback in examples; expose it only behind your own authenticated gateway.

## Routing invariants

Eligibility precedes score. Missing observations are unknown/neutral, never perfect. Scores are rounded to six decimal places and ties resolve by miner ID. Preflight has a deadline, bounded response size, no redirects, DNS/private-address rejection by default, and bounded candidate concurrency at the integration boundary.

`replay` uses the stored candidate snapshot and score breakdown. It never mutates the historical decision; mismatch returns `DECISION_REPLAY_DIVERGENCE`.

## Signers

The normal signing path is typed and domain-separated: parse, validate, canonicalize, re-encode, apply policy, then call `Signer`. `EphemeralSigner` is memory-only and test-only. `ExternalSigner` keeps custody outside Router. `SecretInjectedSigner` is explicit opt-in, memory-only, and accepts PKCS#8 DER from a deployment secret provider; the CLI does not expose it.

## Extension boundary

Implement `MinerCandidateProvider` to supply public or private candidate intelligence without changing Router core. Private reputation, treasury, wallet intelligence, strategy and monitoring feeds do not belong in this repository.

## API

`GET /healthz`, `GET /readyz`, `POST /v1/route`, `GET /v1/decisions/:id`, `GET /v1/miners`, and `GET /metrics`. See `openapi.json`.

## Compatibility

`protocol-compat.json` pins released and upstream sources. FLOP Yellow Paper `0.5.0-draft` is `TARGET_SPEC`, not evidence of a usable public runtime. TCLK is not reimplemented here.

## Security

See `SECURITY.md`. Never route funded production traffic through fixture providers or ephemeral signers.
