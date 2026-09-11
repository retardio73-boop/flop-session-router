import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_CONFIG,
  RouterRepository,
  SessionRouter,
  StaticCandidateProvider,
  type MinerCandidate,
  type RouteRequest,
} from "../src/index.js";

const now = "2026-09-10T00:00:00.000Z";

function candidate(id: string, amount: string, unit: string): MinerCandidate {
  return {
    id,
    identity: { did: `did:test:${id}` },
    enabled: true,
    capabilities: [
      {
        modelId: "model",
        modelHash: "model-hash",
        precisions: ["fp16"],
        decodePolicies: ["greedy"],
        assurance: "SOFT",
        observedAt: now,
      },
    ],
    telemetry: { successEwma: 0.9, latencyMsEwma: 100, availability: 0.9, observedAt: now },
    price: { amount, asset: "FLOP", unit },
  };
}

test("unlike quote units fail closed instead of being numerically ranked", async () => {
  const dir = mkdtempSync(join(tmpdir(), "router-quote-gap-"));
  const repo = new RouterRepository(join(dir, "router.db"));
  try {
    const router = new SessionRouter(
      new StaticCandidateProvider([
        candidate("cheap-looking-per-token", "1", "per-token"),
        candidate("comparable-session", "50", "reserved-session"),
        candidate("too-expensive-session", "150", "reserved-session"),
      ]),
      repo,
      DEFAULT_CONFIG,
      () => new Date(now),
    );

    const request: RouteRequest = {
      requestId: "quote-contract-gap",
      constraints: {
        modelId: "model",
        modelHash: "model-hash",
        precision: "fp16",
        decodePolicy: "greedy",
        maximumPrice: { amount: "100", asset: "FLOP", unit: "reserved-session" },
      },
    };

    const decision = await router.route(request);
    assert.equal(decision.selectedMinerId, "comparable-session");

    const unlike = decision.snapshot.evaluations.find(
      (entry) => entry.minerId === "cheap-looking-per-token",
    );
    assert.equal(unlike?.eligible, false);
    assert.deepEqual(unlike?.rejectionReasons, ["INSUFFICIENT_CAPABILITY_DATA"]);

    const expensive = decision.snapshot.evaluations.find(
      (entry) => entry.minerId === "too-expensive-session",
    );
    assert.equal(expensive?.eligible, false);
    assert.deepEqual(expensive?.rejectionReasons, ["PRICE_EXCEEDS_MAXIMUM"]);
  } finally {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
