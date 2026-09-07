#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { StaticCandidateProvider,FlopRuntimeAdapter } from "./providers.js";
import { RouterRepository } from "./storage.js";
import { SessionRouter } from "./router.js";
import { createRouterServer } from "./server.js";
import { preflight } from "./preflight.js";
import { DEFAULT_CONFIG } from "./types.js";
const args=process.argv.slice(2),command=args[0],value=(flag:string)=>{const i=args.indexOf(flag);return i>=0?args[i+1]:undefined;};
const db=value("--db")??"router.db";const repo=new RouterRepository(db);
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const output=(v:unknown)=>process.stdout.write(JSON.stringify(v,null,2)+"\n");
async function main(){
 if(command==="route"){const request=json(value("--request")??"");const candidates=value("--candidates")?json(value("--candidates")!):[];return output(await new SessionRouter(new StaticCandidateProvider(candidates),repo).route(request));}
 if(command==="inspect"){const d=repo.decision(args[1]??"");if(!d)throw new Error("DECISION_NOT_FOUND");return output(d);}
 if(command==="replay")return output(new SessionRouter(new StaticCandidateProvider([]),repo).replay(args[1]??""));
 if(command==="preflight"){const candidates=json(value("--candidates")??"");return output(await Promise.all(candidates.map((candidate:any)=>preflight(candidate,DEFAULT_CONFIG))));}
 if(command==="doctor")return output({node:process.version,stdinRequired:false,database:db,runtimeAdapter:"RUNTIME_UNAVAILABLE",signer:"SIGNER_UNAVAILABLE",status:"READY_FOR_LOCAL_USE"});
 if(command==="serve"){const fixtures=value("--candidates");const provider=fixtures?new StaticCandidateProvider(json(fixtures)):new FlopRuntimeAdapter();const server=createRouterServer(new SessionRouter(provider,repo),repo);const host=value("--host")??"127.0.0.1",port=Number(value("--port")??8788);server.listen(port,host,()=>output({listening:`http://${host}:${port}`,runtime:fixtures?"FIXTURE_ONLY":"RUNTIME_UNAVAILABLE"}));return;}
 throw new Error("usage: flop-router <serve|route|inspect|replay|doctor>");
}
main().catch(e=>{process.stderr.write(JSON.stringify({error:e instanceof Error?e.message:"failed"})+"\n");process.exitCode=1;});
