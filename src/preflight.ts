import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { MinerCandidate, PreflightResult, RouterConfig } from "./types.js";

function privateIp(ip:string):boolean { return /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|fc|fd|fe80)/i.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip); }
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
