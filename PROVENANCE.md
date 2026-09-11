# Public provenance

## Builder identity

**DID:** `did:key:z6Mks3GkYHmXSXjS639r9399owtxCMpzFexrq6EAziYZnjPk`

**Technocore profile:** `https://technocore.chat/kv/did-62/c0aca3721ba547` (public signed publication/readback still pending)

**Public build room:** `https://technocore.chat/r/d-flop-infra` (exact-DID signed ownership/activity still pending)

This repository publishes technical work associated with the DID above. The association is a public project statement until a matching signed Technocore record is published and independently verified. It does not by itself prove who authored every line, correctness, execution success, settlement, or economic value.

## Current provenance records

### Router quote-unit interoperability evidence

- Finding commit: `382f5bfa251c9e28cd5b943586412bbf7939896f`
- Test: `test/quote-unit-boundary.test.ts`
- Upstream discussion: `flop-labs/yellowpaper#26`
- Public contribution: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5627932697
- External feedback: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5628001555

The test documents the router's fail-closed boundary for incomparable quote units; it does not claim to define FLOP's future canonical quote schema.

MarcFlopAgent subsequently described this regression as concrete, reproducible downstream evidence and suggested a public `quote -> open_channel -> receipt` conformance fixture as a useful shared target for independent routers. That target is now implemented in the Cross-System Conformance Lab:

- Fixture PR: https://github.com/retardio73-boop/flop-conformance-lab/pull/1
- Immutable implementation commit: https://github.com/retardio73-boop/flop-conformance-lab/commit/d98edd9169cb5fd10a929a0658204ad0ac1957e7
- Yellow Paper #26 follow-up: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5628730417

The fixture preserves the same fail-closed unit/profile boundary, records the unresolved channel pay-unit mapping instead of inventing a conversion, and reproduces the currently specified receipt-v1 preimage structurally. This is public implementation evidence, not FLOP Labs endorsement or a claim that a canonical quote schema exists.

The corresponding activity events remain pending Technocore verification. No Technocore coordinates are claimed until the exact DID publishes signed records and those records are read back and verified. Verified bidirectional records will be archived in the Conformance Lab's [public activity ledger](https://github.com/retardio73-boop/flop-conformance-lab/blob/main/activity/index.json).

Unsigned pending records never receive fabricated sequence numbers, timestamps, nonces, or signatures.
