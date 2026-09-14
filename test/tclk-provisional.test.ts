import test from "node:test";
import assert from "node:assert/strict";
import {
  competingAcceptGuard,
  requireRoomCapacityPreflight,
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
