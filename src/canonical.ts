import { createHash } from "node:crypto";

export function canonical(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") { if (!Number.isSafeInteger(value) && !Number.isFinite(value)) throw new Error("NON_CANONICAL_NUMBER"); return JSON.stringify(value); }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).filter(([,v]) => v !== undefined).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  throw new Error("NON_CANONICAL_VALUE");
}
export const sha256 = (value: unknown): string => `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
export const round = (n: number): number => Math.round(n * 1_000_000) / 1_000_000;
