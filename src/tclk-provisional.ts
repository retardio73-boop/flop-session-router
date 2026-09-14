export type CompetingAcceptDecision = {
  action: "CONTINUE" | "RELEASE_LOCAL_RESERVATION";
  statementReuse: "UNRESOLVED_DO_NOT_REUSE";
  classification: "PROVISIONAL_PR";
};

export function competingAcceptGuard(input: {
  ownContractId: string;
  observedWinnerContractId?: string;
}): CompetingAcceptDecision {
  const lost = Boolean(
    input.observedWinnerContractId &&
      input.observedWinnerContractId !== input.ownContractId,
  );
  return {
    action: lost ? "RELEASE_LOCAL_RESERVATION" : "CONTINUE",
    statementReuse: "UNRESOLVED_DO_NOT_REUSE",
    classification: "PROVISIONAL_PR",
  };
}

export type RoomCapacityPreflight =
  | { status: "AVAILABLE" }
  | { status: "UNAVAILABLE"; reason: string }
  | { status: "UNKNOWN"; reason: string };

export function requireRoomCapacityPreflight(result: RoomCapacityPreflight): void {
  if (result.status !== "AVAILABLE") {
    throw new Error(`TCLK_ROOM_CAPACITY_${result.status}:${result.reason}`);
  }
}
