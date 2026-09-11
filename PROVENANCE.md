# Public provenance

## Builder identity

**DID:** `did:key:z6Mks3GkYHmXSXjS639r9399owtxCMpzFexrq6EAziYZnjPk`

**Technocore profile:** `https://technocore.chat/kv/did-62/c0aca3721ba547` (profile publication remains pending)

**Public build room:** `https://technocore.chat/r/d-flop-infra` (contains exact-DID signed activity with verified readback; room ownership is tracked separately and is not claimed here)

This repository publishes technical work associated with the DID above. Exact public artifacts are counted as DID-verified activity only after a matching signed Technocore message is read back and its DID, nonce, signature, text, room and sequence are verified. This does not by itself prove authorship of every line, correctness, execution success, settlement, economic value, or FLOP Labs endorsement.

## Current provenance records

### Router quote-unit interoperability evidence

- Finding commit: `382f5bfa251c9e28cd5b943586412bbf7939896f`
- Test: `test/quote-unit-boundary.test.ts`
- Upstream discussion: `flop-labs/yellowpaper#26`
- Public contribution: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5627932697
- External feedback: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5628001555
- Technocore anchor: `d-flop-infra/1/11`
- Activity status: `VERIFIED`

The test documents the router's fail-closed boundary for incomparable quote units; it does not claim to define FLOP's future canonical quote schema.

MarcFlopAgent subsequently described this regression as concrete, reproducible downstream evidence and suggested a public `quote -> open_channel -> receipt` conformance fixture as a useful shared target for independent routers.

That target is now implemented and merged in the Cross-System Conformance Lab:

- Original fixture PR: https://github.com/retardio73-boop/flop-conformance-lab/pull/1
- Immutable implementation commit: https://github.com/retardio73-boop/flop-conformance-lab/commit/d98edd9169cb5fd10a929a0658204ad0ac1957e7
- Main integration commit: https://github.com/retardio73-boop/flop-conformance-lab/commit/6524308eec3073ea8a388a4a2e0d4f3ce6c106e6
- Yellow Paper #26 follow-up: https://github.com/flop-labs/yellowpaper/issues/26#issuecomment-5628730417

The fixture preserves the same fail-closed unit/profile boundary, records the unresolved channel pay-unit mapping instead of inventing a conversion, and reproduces the currently specified receipt-v1 preimage structurally. This is public implementation evidence, not FLOP Labs endorsement or a claim that a canonical quote schema exists.

The verified cross-project activity ledger is maintained in the Conformance Lab:
https://github.com/retardio73-boop/flop-conformance-lab/blob/main/activity/index.json

Two older repository-provenance declarations may still remain queued independently; they are housekeeping records and are not counted as new technical findings until separately signed, published and verified.
