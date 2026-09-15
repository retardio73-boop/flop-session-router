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

export type SessionOfferBoundary = {
  openingOffer: import("./types.js").OpeningOfferMetadata;
  priceComparability: "NOT_COMPARABLE_YET";
  reason: "CANONICAL_CROSS_PROVIDER_QUOTE_UNDEFINED";
};

export function adaptSessionOfferBoundary(
  offer: import("./types.js").OpeningOfferMetadata,
): SessionOfferBoundary {
  if (offer.kind !== "SessionOffer" || (offer.version !== 1 && offer.version !== 2)) {
    throw new Error("UNSUPPORTED_SESSION_OFFER_BOUNDARY");
  }
  return {
    openingOffer: structuredClone(offer),
    priceComparability: "NOT_COMPARABLE_YET",
    reason: "CANONICAL_CROSS_PROVIDER_QUOTE_UNDEFINED",
  };
}

export class RoomCapacityPreflightCache {
  private readonly entries = new Map<string, { expiresAt: number; result: RoomCapacityPreflight }>();
  constructor(
    private readonly probe: (scope: string) => Promise<RoomCapacityPreflight>,
    private readonly ttlMs = 30_000,
    private readonly now: () => number = () => Date.now(),
  ) {}

  async check(scope: string): Promise<RoomCapacityPreflight & { source: "CACHE" | "PROBE" }> {
    const cached = this.entries.get(scope);
    if (cached && cached.expiresAt > this.now()) return { ...cached.result, source: "CACHE" };
    let result: RoomCapacityPreflight;
    try {
      result = await this.probe(scope);
    } catch (error) {
      result = { status: "UNKNOWN", reason: error instanceof Error ? error.message : "probe failed" };
    }
    this.entries.set(scope, { expiresAt: this.now() + Math.max(0, this.ttlMs), result });
    return { ...result, source: "PROBE" };
  }

  invalidate(scope?: string): void {
    if (scope === undefined) this.entries.clear(); else this.entries.delete(scope);
  }
}
