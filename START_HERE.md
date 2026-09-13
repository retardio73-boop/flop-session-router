# Start here — FLOP Session Router

Get a deterministic routing decision locally before integrating any live runtime.

## 60-second demo

```bash
git clone https://github.com/retardio73-boop/flop-session-router.git
cd flop-session-router
npm ci
npm run quickstart
```

The demo uses repository fixtures only. It should produce a stored route decision with:

- one hard-rejected candidate;
- one eligible fallback;
- one deterministic winner;
- an auditable ranking and decision ID.

No DID key, wallet, token, passphrase, browser login, or live FLOP runtime is required.

## Integrate your candidate source

The Router is deliberately small at the provider boundary:

```ts
import type { MinerCandidateProvider, RouteRequest } from "@flop-tools/session-router";

export class MyProvider implements MinerCandidateProvider {
  name = "my-provider";

  async candidates(request: RouteRequest) {
    // Fetch or derive candidates from your own trusted source.
    // Preserve provenance on capabilities, telemetry and prices.
    return [];
  }
}
```

A useful provider does not need to reproduce Router policy. It supplies candidate facts and provenance; the Router owns deterministic eligibility, scoring, preflight, failover and persistence.

See `examples/provider-template.ts` and `docs/builder-integration.md`.

## Good collaboration targets

- Technocore/DID tools: supply signed identity/reachability evidence as provenance.
- TCLK tools: provide contract/session evidence without turning TCLK into a reputation oracle.
- Miner/inference tools: expose capabilities, endpoints, telemetry and quote semantics.
- Conformance tooling: verify the evidence boundary independently.

## What counts as adoption

A star is not adoption. We count a downstream integration when another tool supplies candidates through the provider boundary, uses the CLI/API in CI or a local service, or consumes stored decisions/replay evidence in a reproducible workflow.
