import type { MinerCandidate, RouteRequest } from "./types.js";
export interface MinerCandidateProvider { name: string; candidates(request: RouteRequest): Promise<MinerCandidate[]>; }
export class StaticCandidateProvider implements MinerCandidateProvider { name="static"; constructor(private readonly values: MinerCandidate[]){} async candidates(){ return structuredClone(this.values); } }
export class FlopRuntimeAdapter implements MinerCandidateProvider { name="flop-runtime"; async candidates():Promise<MinerCandidate[]>{ throw new Error("RUNTIME_UNAVAILABLE"); } }
