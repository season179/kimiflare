import { exec } from "node:child_process";
import { open, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve as resolvePathJoin, basename as pathBasename } from "node:path";
import { promisify } from "node:util";
import { isPathOutside } from "../util/paths.js";
import type { CustomCommand, RenderResult } from "./types.js";

const execAsync = promisify(exec);
const ARG_TOKEN_RE = /(?:"[^"]*"|'[^']*'|[^\s"']+)/g;
const POSITIONAL_RE = /\$(\d+)/g;
const HAS_POSITIONAL = /\$\d+/;
const SHELL_RE = /!`([^`]+)`/g;
const FILE_RE = /(?<![\w`])@(\.?[^\s`,]+?)([.,;:!?)\]}]*)(?=[\s`,]|$)/g;
const DEFAULT_MAX_FILE_BYTES = 100 * 1024;
const DEFAULT_SHELL_TIMEOUT_MS = 5000;

const SECRET_PATTERNS = [
  /^\.env$/,
  /^\.env\./,
  /^\.npmrc$/,
  /^\.netrc$/,
  /^\.docker\/config\.json$/,
  /^\.aws\//,
  /^\.ssh\//,
  /^id_rsa$/,
  /^id_ed25519$/,
  /^id_ecdsa$/,
  /^id_dsa$/,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
];

export function tokenizeArgs(s: string): string[] {
  return [...s.matchAll(ARG_TOKEN_RE)].map((match) => {
    const token = match[0];
    if (
      token.length >= 2 &&
      ((token.startsWith('"') && token.endsWith('"')) ||
        (token.startsWith("'") && token.endsWith("'")))
    ) {
      return token.slice(1, -1);
    }
    return token;
  });
}

export async function renderCommand(
  cmd: CustomCommand,
  rawInput: string,
  opts: { cwd?: string; shellTimeoutMs?: number; maxFileBytes?: number } = {},
): Promise<RenderResult> {
  const warnings: string[] = [];
  const cwd = opts.cwd ?? process.cwd();
  const maxFileBytes = opts.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  const argsString = stripCommandName(rawInput);
  const args = tokenizeArgs(argsString);
  const originalTemplate = cmd.template;
  const hadArguments = originalTemplate.includes("$ARGUMENTS");
  const hadPositionals = HAS_POSITIONAL.test(originalTemplate);

  // Phase 1: shell and file substitutions on the original template only
  let prompt = await replaceShell(originalTemplate, warnings, cmd, opts.shellTimeoutMs ?? DEFAULT_SHELL_TIMEOUT_MS);
  prompt = await replaceFiles(prompt, warnings, cmd, cwd, maxFileBytes);

  // Phase 2: positional and ARGUMENTS substitutions (user input cannot inject shell/file refs)
  prompt = replacePositionals(prompt, args);
  prompt = prompt.replaceAll("$ARGUMENTS", argsString);

  if (!hadArguments && !hadPositionals && argsString !== "") {
    prompt += `\n\n${argsString}`;
  }

  if (prompt.trim() === "") {
    warnings.push("rendered prompt is empty");
  }

  return { prompt, warnings };
}

function stripCommandName(rawInput: string): string {
  if (!rawInput.startsWith("/")) {
    return rawInput;
  }
  return rawInput.replace(/^\/\S+\s*/, "");
}

function replacePositionals(template: string, args: string[]): string {
  const indexes = [...template.matchAll(POSITIONAL_RE)].map((match) =>
    Number(match[1]),
  );
  const highest = indexes.length === 0 ? -1 : Math.max(...indexes);

  return template.replace(POSITIONAL_RE, (_match, n: string) => {
    const index = Number(n);
    if (index <= 0) {
      return "";
    }
    if (index === highest) {
      return args.slice(index - 1).join(" ");
    }
    return args[index - 1] ?? "";
  });
}

async function replaceShell(
  prompt: string,
  warnings: string[],
  cmd: CustomCommand,
  shellTimeoutMs: number,
): Promise<string> {
  if (!cmd.shell) {
    return prompt.replace(SHELL_RE, (_match, command) => {
      warnings.push(`ignored shell command: \`${command}\``);
      return "";
    });
  }

  const matches = [...prompt.matchAll(SHELL_RE)];
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const command = match[1] ?? "";
      try {
        const { stdout } = await execAsync(command, {
          timeout: shellTimeoutMs,
          maxBuffer: 1024 * 1024,
        });
        return String(stdout).trimEnd();
      } catch (error) {
        warnings.push(`shell command failed: \`${command}\` — ${message(error)}`);
        return "";
      }
    }),
  );

  let index = 0;
  return prompt.replace(SHELL_RE, () => replacements[index++] ?? "");
}

async function replaceFiles(
  prompt: string,
  warnings: string[],
  cmd: CustomCommand,
  cwd: string,
  maxFileBytes: number,
): Promise<string> {
  const matches = [...prompt.matchAll(FILE_RE)];
  if (matches.length === 0) return prompt;

  if (!cmd.files) {
    return prompt.replace(FILE_RE, (_match, rawPath, trailing: string = "") => {
      warnings.push(`ignored file inclusion: @${rawPath}`);
      return "" + trailing;
    });
  }

  const realCwd = await realpath(cwd).catch(() => cwd);
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const rawPath = match[1] ?? "";
      const base = pathBasename(rawPath);
      if (SECRET_PATTERNS.some((re) => re.test(base))) {
        warnings.push(`file inclusion blocked: @${rawPath} — secret file pattern`);
        return "";
      }
      if (isAbsolute(rawPath) || rawPath.startsWith("~")) {
        warnings.push(`file inclusion skipped: @${rawPath} — outside workspace`);
        return "";
      }
      const resolved = resolvePathJoin(cwd, rawPath);
      if (isPathOutside(relative(cwd, resolved))) {
        warnings.push(`file inclusion skipped: @${rawPath} — outside workspace`);
        return "";
      }
      let real: string;
      try {
        real = await realpath(resolved);
      } catch (error) {
        warnings.push(`file inclusion failed: @${rawPath} — ${message(error)}`);
        return "";
      }
      if (isPathOutside(relative(realCwd, real))) {
        warnings.push(`file inclusion skipped: @${rawPath} — symlink escapes workspace`);
        return "";
      }
      try {
        const handle = await open(real, "r");
        try {
          const stats = await handle.stat();
          if (stats.size > maxFileBytes) {
            warnings.push(
              `file inclusion skipped: @${rawPath} — exceeds ${maxFileBytes} bytes`,
            );
            return "";
          }
          return await handle.readFile("utf8");
        } finally {
          await handle.close();
        }
      } catch (error) {
        warnings.push(`file inclusion failed: @${rawPath} — ${message(error)}`);
        return "";
      }
    }),
  );

  let index = 0;
  return prompt.replace(FILE_RE, (_match, _path, trailing: string = "") => {
    const replacement = replacements[index++] ?? "";
    return replacement + trailing;
  });
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
