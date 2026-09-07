export type AssuranceTier = "SOFT" | "HARD" | "UNKNOWN";
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type OutcomeState = "selected" | "attempted" | "acknowledged" | "active" | "completed" | "failed" | "timed_out" | "cancelled" | "runtime_unavailable";

export interface ModelCapability { modelId: string; modelHash?: string; precisions?: string[]; decodePolicies?: string[]; assurance: AssuranceTier; observedAt?: string; }
export interface MinerEndpoint { url: string; protocol: string; }
export interface MinerCandidate { id: string; identity: { account?: string; did?: string }; endpoint?: MinerEndpoint; capabilities: ModelCapability[]; enabled: boolean; telemetry?: { successEwma?: number; latencyMsEwma?: number; availability?: number; observedAt?: string }; price?: { amount: string; asset: string; unit: string }; }
export interface RouteConstraints { modelId: string; modelHash?: string; precision?: string; decodePolicy?: string; minimumAssurance?: AssuranceTier; maxLatencyMs?: number; maximumPrice?: { amount: string; asset: string; unit: string }; capabilityMaxAgeMs?: number; }
export interface RouteRequest { requestId: string; constraints: RouteConstraints; preflight?: boolean; maxAttempts?: number; }
export interface PreflightResult { minerId: string; status: "PASS" | "FAIL" | "SKIPPED"; latencyMs?: number; checkedAt: string; reason?: string; }
export interface ScoreBreakdown { success: number; latency: number; freshness: number; preflight: number; assurance: number; availability: number; failedAckPenalty: number; circuitPenalty: number; total: number; }
export interface CandidateEvaluation { minerId: string; eligible: boolean; rejectionReasons: string[]; score?: ScoreBreakdown; preflight: PreflightResult; }
export interface RouterConfig { weights: Omit<ScoreBreakdown, "total">; circuitFailureThreshold: number; circuitCooldownMs: number; failedAckHalfLifeMs: number; preflightTimeoutMs: number; preflightConcurrency: number; preflightMaxBytes: number; allowPrivateEndpoints: boolean; }
export interface RouterSnapshot { request: RouteRequest; candidates: MinerCandidate[]; evaluations: CandidateEvaluation[]; config: RouterConfig; routerVersion: string; capturedAt: string; }
export interface RouteDecision { decisionId: string; selectedMinerId?: string; status: "SELECTED" | "NO_ELIGIBLE_MINER" | "RUNTIME_UNAVAILABLE"; ranking: string[]; snapshot: RouterSnapshot; configHash: string; snapshotHash: string; }
export interface FailedAckObservation { id: string; minerId: string; source: string; observedAt: string; channelRef?: string; block?: string; confidence?: string; finality?: string; }
export interface SessionAttempt { id: string; decisionId: string; minerId: string; attempt: number; startedAt: string; completedAt?: string; outcome: OutcomeState; retryable?: boolean; reason?: string; }
export interface SessionOutcome { decisionId: string; status: OutcomeState; attempts: SessionAttempt[]; selectedMinerId?: string; }

export const DEFAULT_CONFIG: RouterConfig = {
  weights: { success: .30, latency: .18, freshness: .12, preflight: .18, assurance: .10, availability: .12, failedAckPenalty: .20, circuitPenalty: 1 },
  circuitFailureThreshold: 3, circuitCooldownMs: 60_000, failedAckHalfLifeMs: 86_400_000,
  preflightTimeoutMs: 2_000, preflightConcurrency: 4, preflightMaxBytes: 64 * 1024, allowPrivateEndpoints: false
};
