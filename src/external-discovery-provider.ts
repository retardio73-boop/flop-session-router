import type { MinerCandidate, RouteRequest } from "./types.js";
import type { MinerCandidateProvider } from "./providers.js";

export interface DiscoverySource {
  load(request: RouteRequest): Promise<Array<Record<string, unknown>>>;
}

export interface DiscoveryBinding {
  sourceId: string;
  candidate: MinerCandidate;
}

export class ExplicitDiscoveryCandidateProvider implements MinerCandidateProvider {
  readonly name = "explicit-discovery";

  constructor(
    private readonly source: DiscoverySource,
    private readonly bindings: DiscoveryBinding[],
  ) {}

  async candidates(request: RouteRequest): Promise<MinerCandidate[]> {
    const rows = await this.source.load(request);
    const available = new Set(rows.map((row) => String(row.id ?? "")));
    return this.bindings
      .filter((binding) => available.has(binding.sourceId))
      .map((binding) => structuredClone(binding.candidate));
  }
}
