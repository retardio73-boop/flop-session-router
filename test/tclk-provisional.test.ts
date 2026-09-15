import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptSessionOfferBoundary,
  competingAcceptGuard,
  requireRoomCapacityPreflight,
  RoomCapacityPreflightCache,
} from "../src/tclk-provisional.js";

test("competing accept guard releases local reservation after observed winner", () => {
  const decision = competingAcceptGuard({
    ownContractId: "contract-b",
    observedWinnerContractId: "contract-a",
  });
  assert.equal(decision.action, "RELEASE_LOCAL_RESERVATION");
  assert.equal(decision.statementReuse, "UNRESOLVED_DO_NOT_REUSE");
  assert.equal(decision.classification, "PROVISIONAL_PR");
});

test("competing accept guard does not invent a winner", () => {
  assert.equal(
    competingAcceptGuard({ ownContractId: "contract-a" }).action,
    "CONTINUE",
  );
});

test("room-capacity preflight fails closed unless explicitly available", () => {
  assert.doesNotThrow(() => requireRoomCapacityPreflight({ status: "AVAILABLE" }));
  assert.throws(
    () => requireRoomCapacityPreflight({ status: "UNKNOWN", reason: "probe unavailable" }),
    /TCLK_ROOM_CAPACITY_UNKNOWN/,
  );
  assert.throws(
    () => requireRoomCapacityPreflight({ status: "UNAVAILABLE", reason: "daily budget exhausted" }),
    /TCLK_ROOM_CAPACITY_UNAVAILABLE/,
  );
});


test("SessionOffer adapter preserves opening metadata and stays non-comparable", () => {
  const adapted = adaptSessionOfferBoundary({
    kind: "SessionOffer", version: 1, miner: "miner-a",
    minEscrow: { amount: "5", asset: "TEST", unit: "base" }, capacityHint: 3,
  });
  assert.equal(adapted.priceComparability, "NOT_COMPARABLE_YET");
  assert.equal(adapted.reason, "CANONICAL_CROSS_PROVIDER_QUOTE_UNDEFINED");
  assert.equal(adapted.openingOffer.minEscrow?.amount, "5");
  assert.equal(adapted.openingOffer.capacityHint, 3);
});

test("room-capacity cache avoids repeated probes and fails unknown closed", async () => {
  let calls = 0; let now = 1000;
  const cache = new RoomCapacityPreflightCache(async () => { calls++; return { status: "AVAILABLE" }; }, 30_000, () => now);
  assert.equal((await cache.check("technocore")).source, "PROBE");
  assert.equal((await cache.check("technocore")).source, "CACHE");
  assert.equal(calls, 1);
  now += 30_001;
  assert.equal((await cache.check("technocore")).source, "PROBE");
  assert.equal(calls, 2);
  const failing = new RoomCapacityPreflightCache(async () => { throw new Error("capacity endpoint unavailable"); });
  const result = await failing.check("technocore");
  assert.equal(result.status, "UNKNOWN");
  assert.throws(() => requireRoomCapacityPreflight(result), /TCLK_ROOM_CAPACITY_UNKNOWN/);
});
