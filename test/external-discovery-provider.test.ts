import test from "node:test";
import assert from "node:assert/strict";
import { ExplicitDiscoveryCandidateProvider } from "../src/external-discovery-provider.js";
import type { MinerCandidate, RouteRequest } from "../src/types.js";

const candidate: MinerCandidate = {
  id: "miner-a",
  identity: { did: "did:test:a" },
  enabled: true,
  capabilities: [{ modelId: "m1", assurance: "SOFT" }],
};
const request: RouteRequest = { requestId: "r1", constraints: { modelId: "m1" } };

test("explicit binding produces only bound candidates", async () => {
  const source = { load: async () => [{ id: "source-a" }, { id: "unbound" }] };
  const provider = new ExplicitDiscoveryCandidateProvider(source, [{ sourceId: "source-a", candidate }]);
  assert.deepEqual(await provider.candidates(request), [candidate]);
});

test("unbound rows cannot invent a candidate", async () => {
  const source = { load: async () => [{ id: "source-a" }] };
  const provider = new ExplicitDiscoveryCandidateProvider(source, []);
  assert.deepEqual(await provider.candidates(request), []);
});
