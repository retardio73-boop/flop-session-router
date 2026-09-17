# Builder integration

The Router is designed to compose with other FLOP/Technocore tools without absorbing their responsibilities.

## Integration contract

A builder integration should provide `MinerCandidate[]` with as much provenance as it can justify. The Router then applies its own deterministic eligibility, score, preflight, failover and persistence rules.

Do not convert missing evidence into perfect telemetry or hard assurance.

## Technocore / DID builders

Useful exchange:

- DID and mailbox identity as candidate identity metadata;
- signed reachability observations as provenance;
- explicit observation timestamps and coverage;
- no private keys, passphrases or signer custody transferred to Router.

## TCLK builders

Useful exchange:

- contract/session references and signed evidence refs;
- explicit asset/unit semantics for quotes;
- no claim that a valid transcript proves value settlement;
- no local reinterpretation of TCLK normative state.

## Inference/miner builders

Useful exchange:

- model ID/hash;
- supported precisions/decode policies;
- endpoint/protocol;
- bounded latency/success observations;
- price amount + asset + unit;
- evidence provenance.

## Conformance Lab

Use the independent Conformance Lab to verify exported evidence rather than coupling conformance policy into Router core.

`buildRouterJourneyEvidence()` exports a versioned `flop.router-journey-evidence.v1` envelope containing the discovery digest, preserved quote metadata, deterministic ranking, config/snapshot hashes, replay status, and optional execution outcome. It intentionally does not claim that discovery evidence is a canonical FLOP quote or that a route decision proves settlement.

A high-value collaboration is a small public adapter plus a deterministic fixture and CI test. It should be possible for either project to reproduce the boundary without access to secrets or a funded runtime.

## Upstream contribution rule

When a real mismatch is found, reduce it to the smallest reproducible boundary and send that evidence to the project that owns the behavior. Avoid generic promotion, duplicated issues, or claims of adoption before the downstream maintainer independently runs or merges the integration.
