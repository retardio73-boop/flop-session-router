# v0.1.0-alpha

First public alpha of FLOP Session Router, a community-built and unofficial tool for deterministic off-chain candidate routing, endpoint preflight, bounded failover and auditable decisions.

## Included

- Hard compatibility, assurance, freshness, price and latency gates before scoring.
- Deterministic scoring and miner-ID tie breaking.
- Bounded concurrent preflight, bounded retries and persistent circuit state.
- Persistent decisions, attempts, outcomes, FailedAck and preflight observations.
- Hardened external-signer boundary and provider-scoped HTTP API.
- Offline three-candidate fixture and clean-package smoke test.

## Alpha limitations

- The official FLOP runtime integration is unavailable and fails closed.
- No live sessions or value settlement are claimed.
- Replay validates stored evaluations and hashes; it does not recompute raw telemetry with the current algorithm.
- Endpoint checks are defense-in-depth and do not provide complete DNS-rebinding protection without deployment egress controls.
- npm publication is pending verified ownership of the `@flop-tools` scope.

Tarball SHA-256 is published in the attached `SHA256SUMS` file.
