import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { MinerCandidate, PreflightResult, RouterConfig } from "./types.js";

function privateIp(ip:string):boolean {
  const normalized=ip.toLowerCase().split("%")[0]!;
  const mapped=normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if(mapped)return privateIp(mapped);
  if(isIP(normalized)===4){const [a,b]=normalized.split(".").map(Number);return a===0||a===10||a===127||a!>=224||(a===100&&b!>=64&&b!<=127)||(a===169&&b===254)||(a===172&&b!>=16&&b!<=31)||(a===192&&(b===0||b===168))||(a===198&&(b===18||b===19))||(a===198&&b===51)||(a===203&&b===0);}
  return normalized==="::"||normalized==="::1"||/^f[cd]/.test(normalized)||/^fe[89ab]/.test(normalized)||/^ff/.test(normalized)||/^2001:db8/.test(normalized);
}
export async function validateEndpoint(raw:string, allowPrivate=false):Promise<URL>{
  const u=new URL(raw); if(u.protocol!=="https:" && !(allowPrivate && u.protocol==="http:")) throw new Error("UNSAFE_ENDPOINT_SCHEME");
  if(u.username||u.password||u.hash) throw new Error("ENDPOINT_CREDENTIALS_OR_FRAGMENT");
  const addresses=await lookup(u.hostname,{all:true}); if(!allowPrivate && addresses.some(x=>privateIp(x.address)||isIP(x.address)===0)) throw new Error("PRIVATE_ENDPOINT_BLOCKED"); return u;
}
export async function preflight(candidate:MinerCandidate, config:RouterConfig, fetcher:typeof fetch=fetch):Promise<PreflightResult>{
  const checkedAt=new Date().toISOString(); if(!candidate.endpoint) return {minerId:candidate.id,status:"FAIL",checkedAt,reason:"ENDPOINT_UNAVAILABLE"};
  const start=performance.now(); try { const url=await validateEndpoint(candidate.endpoint.url,config.allowPrivateEndpoints); const c=new AbortController(); const timer=setTimeout(()=>c.abort(),config.preflightTimeoutMs); try { const r=await fetcher(url,{method:"HEAD",signal:c.signal,redirect:"error"}); const length=Number(r.headers.get("content-length")??"0"); if(length>config.preflightMaxBytes) throw new Error("PREFLIGHT_RESPONSE_TOO_LARGE"); if(!r.ok) throw new Error(`HTTP_${r.status}`); return {minerId:candidate.id,status:"PASS",latencyMs:Math.round(performance.now()-start),checkedAt}; } finally {clearTimeout(timer);} }
  catch(e){return {minerId:candidate.id,status:"FAIL",latencyMs:Math.round(performance.now()-start),checkedAt,reason:e instanceof Error?e.message:"PREFLIGHT_FAILED"};}
}

export async function preflightMany(candidates:MinerCandidate[],config:RouterConfig,fetcher:typeof fetch=fetch):Promise<PreflightResult[]>{
  const results=new Array<PreflightResult>(candidates.length);let next=0;
  const count=Math.max(1,Math.min(Math.floor(config.preflightConcurrency)||1,candidates.length||1));
  await Promise.all(Array.from({length:count},async()=>{for(;;){const index=next++;if(index>=candidates.length)return;results[index]=await preflight(candidates[index]!,config,fetcher);}}));
  return results;
}
