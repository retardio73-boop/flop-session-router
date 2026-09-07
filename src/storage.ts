import { DatabaseSync } from "node:sqlite";
import type { FailedAckObservation, RouteDecision, SessionAttempt } from "./types.js";

export class RouterRepository {
  private db: DatabaseSync;
  constructor(path = "router.db") { this.db = new DatabaseSync(path); this.migrate(); }
  private migrate() { this.db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY); CREATE TABLE IF NOT EXISTS decisions(id TEXT PRIMARY KEY, body TEXT NOT NULL, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS failed_acks(id TEXT PRIMARY KEY, miner_id TEXT NOT NULL, body TEXT NOT NULL, observed_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS circuit(miner_id TEXT PRIMARY KEY, failures INTEGER NOT NULL, state TEXT NOT NULL, opened_at TEXT); CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY, decision_id TEXT NOT NULL, body TEXT NOT NULL); INSERT OR IGNORE INTO schema_migrations(version) VALUES(1);`); }
  saveDecision(d: RouteDecision) { this.db.prepare("INSERT INTO decisions VALUES(?,?,?)").run(d.decisionId, JSON.stringify(d), d.snapshot.capturedAt); }
  decision(id: string): RouteDecision | undefined { const r=this.db.prepare("SELECT body FROM decisions WHERE id=?").get(id) as {body:string}|undefined; return r ? JSON.parse(r.body) : undefined; }
  decisions(): RouteDecision[] { return (this.db.prepare("SELECT body FROM decisions ORDER BY created_at DESC").all() as {body:string}[]).map(x=>JSON.parse(x.body)); }
  saveFailedAck(o: FailedAckObservation) { this.db.prepare("INSERT OR IGNORE INTO failed_acks VALUES(?,?,?,?)").run(o.id,o.minerId,JSON.stringify(o),o.observedAt); }
  failedAcks(minerId: string): FailedAckObservation[] { return (this.db.prepare("SELECT body FROM failed_acks WHERE miner_id=?").all(minerId) as {body:string}[]).map(x=>JSON.parse(x.body)); }
  circuit(minerId: string): {failures:number;state:string;openedAt?:string} { const r=this.db.prepare("SELECT failures,state,opened_at openedAt FROM circuit WHERE miner_id=?").get(minerId) as any; return r ?? {failures:0,state:"CLOSED"}; }
  setCircuit(minerId:string, failures:number,state:string,openedAt?:string) { this.db.prepare("INSERT INTO circuit VALUES(?,?,?,?) ON CONFLICT(miner_id) DO UPDATE SET failures=excluded.failures,state=excluded.state,opened_at=excluded.opened_at").run(minerId,failures,state,openedAt??null); }
  saveAttempt(a: SessionAttempt) { this.db.prepare("INSERT INTO attempts VALUES(?,?,?)").run(a.id,a.decisionId,JSON.stringify(a)); }
  close() { this.db.close(); }
}
