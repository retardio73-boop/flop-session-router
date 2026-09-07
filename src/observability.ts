const sensitive = /authorization|credential|password|passphrase|private|secret|token/i;
export function redact(value: unknown, key = ""): unknown {
  if (sensitive.test(key)) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redact(v, k)]));
  return value;
}
export type LogSink = (record: Record<string, unknown>) => void;
export class RouterLogger { constructor(private sink: LogSink = () => {}) {} event(event: string, details: Record<string, unknown> = {}) { this.sink({ timestamp: new Date().toISOString(), level: "INFO", event, component: "router", details: redact(details) }); } }
