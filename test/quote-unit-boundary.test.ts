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

function candidate(id: string, amount: string, unit: string, comparisonProfile?: string): MinerCandidate {
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
    price: { amount, asset: "FLOP", unit, comparisonProfile },
  };
}

function request(profile?: string): RouteRequest {
  return {
    requestId: "quote-contract-gap",
    constraints: {
      modelId: "model",
      modelHash: "model-hash",
      precision: "fp16",
      decodePolicy: "greedy",
      maximumPrice: { amount: "100", asset: "FLOP", unit: "reserved-session", comparisonProfile: profile },
    },
  };
}

test("unlike quote units and profiles fail closed instead of being numerically ranked", async () => {
  const dir = mkdtempSync(join(tmpdir(), "router-quote-gap-"));
  const repo = new RouterRepository(join(dir, "router.db"));
  try {
    const router = new SessionRouter(
      new StaticCandidateProvider([
        candidate("cheap-looking-per-token", "1", "per-token", "profile-a"),
        candidate("same-unit-wrong-profile", "1", "reserved-session", "profile-b"),
        candidate("missing-profile", "1", "reserved-session"),
        candidate("comparable-session", "50", "reserved-session", "profile-a"),
        candidate("too-expensive-session", "150", "reserved-session", "profile-a"),
      ]),
      repo,
      DEFAULT_CONFIG,
      () => new Date(now),
    );

    const decision = await router.route(request("profile-a"));
    assert.equal(decision.selectedMinerId, "comparable-session");

    for (const id of ["cheap-looking-per-token", "same-unit-wrong-profile", "missing-profile"]) {
      const entry = decision.snapshot.evaluations.find((item) => item.minerId === id);
      assert.equal(entry?.eligible, false);
      assert.deepEqual(entry?.rejectionReasons, ["INSUFFICIENT_COMPARABLE_PRICE_DATA"]);
    }

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

test("maximumPrice without an explicit comparison profile fails closed", async () => {
  const dir = mkdtempSync(join(tmpdir(), "router-quote-profile-gap-"));
  const repo = new RouterRepository(join(dir, "router.db"));
  try {
    const router = new SessionRouter(
      new StaticCandidateProvider([candidate("quoted", "1", "reserved-session", "profile-a")]),
      repo,
      DEFAULT_CONFIG,
      () => new Date(now),
    );
    const decision = await router.route(request());
    assert.equal(decision.status, "NO_ELIGIBLE_MINER");
    assert.deepEqual(decision.snapshot.evaluations[0]?.rejectionReasons, ["INSUFFICIENT_COMPARABLE_PRICE_DATA"]);
  } finally {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("SessionOffer minEscrow and capacityHint are preserved as opening metadata, not price", async () => {
  const dir = mkdtempSync(join(tmpdir(), "router-session-offer-"));
  const repo = new RouterRepository(join(dir, "router.db"));
  try {
    const offerOnly: MinerCandidate = {
      ...candidate("offer-only", "1", "reserved-session", "profile-a"),
      price: undefined,
      openingOffer: {
        kind: "SessionOffer",
        version: 1,
        miner: "miner-1",
        modelHash: "model-hash",
        precision: "fp16",
        minEscrow: { amount: "1", asset: "FLOP", unit: "reserved-session" },
        capacityHint: 999,
      },
    };
    const router = new SessionRouter(new StaticCandidateProvider([offerOnly]), repo, DEFAULT_CONFIG, () => new Date(now));
    const decision = await router.route(request("profile-a"));
    assert.equal(decision.status, "NO_ELIGIBLE_MINER");
    assert.deepEqual(decision.snapshot.evaluations[0]?.rejectionReasons, ["INSUFFICIENT_COMPARABLE_PRICE_DATA"]);
    assert.equal(decision.snapshot.candidates[0]?.openingOffer?.minEscrow?.amount, "1");
    assert.equal(decision.snapshot.candidates[0]?.openingOffer?.capacityHint, 999);
  } finally {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
