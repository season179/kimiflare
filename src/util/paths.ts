import { resolve, isAbsolute } from "node:path";
import { homedir } from "node:os";

export function resolvePath(cwd: string, input: string): string {
  if (input.startsWith("~/") || input === "~") {
    return resolve(homedir(), input === "~" ? "." : input.slice(2));
  }
  return isAbsolute(input) ? input : resolve(cwd, input);
}

export function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n) + `\n... [truncated, ${s.length - n} chars omitted]`;
}
