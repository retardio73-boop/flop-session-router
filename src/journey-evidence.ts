import { sha256 } from "./canonical.js";
import type { RouteDecision, SessionOutcome } from "./types.js";

export interface DiscoveryEvidenceEnvelope {
  schema: string;
  generatedAt: string;
  digest: string;
  providers: unknown[];
}

export interface RouterJourneyEvidence {
  schema: "flop.router-journey-evidence.v1";
  discovery: { schema: string; digest: string; generatedAt: string };
  quote: { status: "PRESERVED" | "ABSENT"; selectedMinerId?: string; price?: unknown; openingOffer?: unknown };
  route: {
    status: RouteDecision["status"];
    selectedMinerId?: string;
    ranking: string[];
    configHash: string;
    snapshotHash: string;
    replayStatus: "REPLAY_MATCH" | "DECISION_REPLAY_DIVERGENCE" | "NOT_CHECKED";
  };
  execution?: SessionOutcome;
  evidenceDigest: string;
}
export function buildRouterJourneyEvidence(
  decision: RouteDecision,
  discovery: DiscoveryEvidenceEnvelope,
  replayStatus: "REPLAY_MATCH" | "DECISION_REPLAY_DIVERGENCE" | "NOT_CHECKED" = "NOT_CHECKED",
  execution?: SessionOutcome,
): RouterJourneyEvidence {
  if (!discovery.schema || !discovery.digest || !Array.isArray(discovery.providers)) {
    throw new Error("INVALID_DISCOVERY_EVIDENCE");
  }
  const candidate = decision.snapshot.candidates.find((item) => item.id === decision.selectedMinerId);
  const quote = candidate?.price || candidate?.openingOffer
    ? { status: "PRESERVED" as const, selectedMinerId: candidate.id, price: candidate.price, openingOffer: candidate.openingOffer }
    : { status: "ABSENT" as const };
  const body = {
    schema: "flop.router-journey-evidence.v1" as const,
    discovery: { schema: discovery.schema, digest: discovery.digest, generatedAt: discovery.generatedAt },
    quote,
    route: {
      status: decision.status,
      selectedMinerId: decision.selectedMinerId,
      ranking: decision.ranking,
      configHash: decision.configHash,
      snapshotHash: decision.snapshotHash,
      replayStatus,
    },
    execution,
  };
  return { ...body, evidenceDigest: sha256(body) };
}
