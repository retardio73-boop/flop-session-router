import type { MinerCandidate, RouteRequest } from "./types.js";
export interface MinerCandidateProvider { name: string; candidates(request: RouteRequest): Promise<MinerCandidate[]>; snapshot?(): Promise<MinerCandidate[]>; }
export class StaticCandidateProvider implements MinerCandidateProvider { name="static"; constructor(private readonly values: MinerCandidate[]){} async candidates(){ return structuredClone(this.values); } async snapshot(){return structuredClone(this.values);} }
export class FlopRuntimeAdapter implements MinerCandidateProvider { name="flop-public-runtime"; async candidates():Promise<MinerCandidate[]>{ throw new Error("PUBLIC_RUNTIME_UNAVAILABLE"); } }
