import test from "node:test";
import assert from "node:assert/strict";
import { buildRouterJourneyEvidence, StaticCandidateProvider, SessionRouter, RouterRepository } from "../src/index.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("router emits deterministic journey evidence from preserved discovery", async () => {
  const dir = mkdtempSync(join(tmpdir(), "router-journey-"));
  const repo = new RouterRepository(join(dir, "r.db"));
  try {
    const candidate = {
      id: "miner-a", identity: {}, enabled: true,
      capabilities: [{ modelId: "m", assurance: "SOFT" as const }],
      price: { amount: "10", asset: "USD", unit: "tokens", comparisonProfile: "provider-native-v1" },
    };
    const clock = () => new Date("2026-09-16T00:00:00Z");
    const router = new SessionRouter(new StaticCandidateProvider([candidate]), repo, undefined, clock);
    const decision = await router.route({ requestId: "journey-1", constraints: { modelId: "m" } });
    const replay = router.replay(decision.decisionId);
    const evidence = buildRouterJourneyEvidence(decision, {
      schema: "flop.inference-market.discovery-evidence.v1",
      generatedAt: "2026-09-16T00:00:00Z",
      digest: "abc",
      providers: [{ id: "source-a" }],
    }, replay.status);
    assert.equal(evidence.schema, "flop.router-journey-evidence.v1");
    assert.equal(evidence.quote.status, "PRESERVED");
    assert.equal(evidence.route.selectedMinerId, "miner-a");
    assert.equal(evidence.route.replayStatus, "REPLAY_MATCH");
    assert.match(evidence.evidenceDigest, /^sha256:[0-9a-f]{64}$/);
  } finally {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("invalid discovery evidence fails closed", () => {
  assert.throws(() => buildRouterJourneyEvidence({} as never, { schema: "", generatedAt: "", digest: "", providers: [] }), /INVALID_DISCOVERY_EVIDENCE/);
});
