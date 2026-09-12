# v0.1.2-alpha

Focused interoperability release for FLOP Session Router.

## Included

- Hard compatibility, assurance, freshness, price and latency gates before scoring.
- Deterministic scoring and miner-ID tie breaking.
- Bounded concurrent preflight, bounded retries and persistent circuit state.
- Persistent decisions, attempts, outcomes, FailedAck and preflight observations.
- Hardened external-signer boundary and provider-scoped HTTP API.
- Regression coverage for incompatible quote units: a cheaper-looking `per-token` quote is rejected rather than numerically compared against a `reserved-session` maximum.

## Why this matters

The Router now has a concrete downstream test for the quote-contract ambiguity discussed in FLOP Yellow Paper issue #26. It preserves each published unit/profile boundary and fails closed rather than inventing a local conversion between unlike pricing semantics.

## Alpha limitations

- The authoritative public FLOP runtime integration remains unavailable and fails closed as `PUBLIC_RUNTIME_UNAVAILABLE`.
- No canonical/versioned pre-session quote/discovery contract is claimed by this release.
- No live sessions or value settlement are claimed.
- Replay validates stored evaluations and hashes; it does not recompute raw telemetry with the current algorithm.
- Endpoint checks remain defense-in-depth and do not provide complete DNS-rebinding protection without deployment egress controls.

Artifacts and SHA-256 checksums should be generated from the exact tagged commit at release time; no checksum is predeclared here before packaging.
