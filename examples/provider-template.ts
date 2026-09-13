import type {
  MinerCandidate,
  MinerCandidateProvider,
  RouteRequest,
} from "../src/index.js";

export class ExampleBuilderProvider implements MinerCandidateProvider {
  name = "example-builder-provider";

  async candidates(_request: RouteRequest): Promise<MinerCandidate[]> {
    return [
      {
        id: "builder-miner-1",
        identity: { did: "did:key:replace-with-public-did" },
        endpoint: { url: "https://example.invalid/inference", protocol: "https" },
        enabled: true,
        capabilities: [
          {
            modelId: "example-model",
            assurance: "UNKNOWN",
            provenance: {
              source: "builder-fixture",
              verificationState: "ASSERTED",
              coverage: "PARTIAL",
            },
          },
        ],
      },
    ];
  }
}
