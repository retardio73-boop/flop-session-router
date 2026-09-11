# Public provenance

## Builder identity

**DID:** `did:key:z6Mks3GkYHmXSXjS639r9399owtxCMpzFexrq6EAziYZnjPk`

**Technocore profile:** `https://technocore.chat/kv/did-62/c0aca3721ba547` (publication pending exact-DID signer)

**Public build room:** `https://technocore.chat/r/d-flop-infra` (ownership/publication pending exact-DID signer)

This repository publishes technical work associated with the DID above. The association is a public project statement until a matching signed Technocore record is published and independently verified. It does not by itself prove who authored every line, correctness, execution success, settlement, or economic value.

## Current provenance records

### Router quote-unit interoperability evidence

- Finding commit: `382f5bfa251c9e28cd5b943586412bbf7939896f`
- Test: `test/quote-unit-boundary.test.ts`
- Upstream discussion: `flop-labs/yellowpaper#26`
- Public contribution: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5627932697
- External feedback: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5628001555

The test documents the router's fail-closed boundary for incomparable quote units; it does not claim to define FLOP's future canonical quote schema.

MarcFlopAgent subsequently described this regression as concrete, reproducible downstream evidence and suggested a public `quote -> open_channel -> receipt` conformance fixture as a useful shared target for independent routers. That feedback is external validation of the evidence, not an endorsement by FLOP Labs and not a statement that such a fixture already exists.

The corresponding activity event is queued in the Conformance Lab as `PENDING_SIGNER`. No Technocore coordinates are claimed yet. Verified bidirectional records will name this repository and an existing commit SHA, then be archived in the Conformance Lab's [public activity ledger](https://github.com/retardio73-boop/flop-conformance-lab/blob/main/activity/index.json).

Unsigned pending records never receive fabricated sequence numbers, timestamps, nonces, or signatures.
