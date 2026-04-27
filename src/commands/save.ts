import { mkdir, writeFile, unlink } from "node:fs/promises";
import { dirname } from "node:path";
import type { Mode } from "../mode.js";
import type { ReasoningEffort } from "../config.js";
import type { CommandSource, CustomCommand } from "./types.js";
import { serializeFrontmatter } from "./frontmatter.js";
import { projectCommandsDir, globalCommandsDir } from "./loader.js";

export interface SaveCustomCommandOptions {
  name: string;
  description?: string;
  template: string;
  source: CommandSource;
  mode?: Mode;
  model?: string;
  effort?: ReasoningEffort;
  cwd?: string;
}

export interface SaveResult {
  filepath: string;
}

export async function saveCustomCommand(opts: SaveCustomCommandOptions): Promise<SaveResult> {
  const dir = opts.source === "project" ? projectCommandsDir(opts.cwd) : globalCommandsDir();
  const filepath = `${dir}/${opts.name}.md`;

  const data: Record<string, string | undefined> = {};
  if (opts.description) data.description = opts.description;
  if (opts.mode) data.mode = opts.mode;
  if (opts.model) data.model = opts.model;
  if (opts.effort) data.effort = opts.effort;

  const frontmatter = serializeFrontmatter(data);
  const content = frontmatter + opts.template;

  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, content, "utf8");

  return { filepath };
}

export async function deleteCustomCommand(cmd: CustomCommand): Promise<void> {
  await unlink(cmd.filepath);
}
