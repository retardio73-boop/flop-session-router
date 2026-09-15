import type { MinerCandidate, RouteRequest } from "./types.js";
import type { MinerCandidateProvider } from "./providers.js";

export interface InferenceMarketBinding {
  sourceId: string;
  candidate: MinerCandidate;
}

export interface InferenceMarketSource {
  load(request: RouteRequest): Promise<Record<string, unknown>[]>;
}

export class InferenceMarketCandidateProvider implements MinerCandidateProvider {
  readonly name = "inference-market";
  constructor(private readonly source: InferenceMarketSource, private readonly bindings: InferenceMarketBinding[]) {}

  async candidates(request: RouteRequest): Promise<MinerCandidate[]> {
    const rows = await this.source.load(request);
    const available = new Set(rows.map((row) => String(row.id ?? "")));
    return this.bindings
      .filter((binding) => available.has(binding.sourceId))
      .map((binding) => structuredClone(binding.candidate));
  }
}
