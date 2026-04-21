import TurndownService from "turndown";
import type { ToolSpec } from "./registry.js";
import { truncate } from "../util/paths.js";

interface Args {
  url: string;
}

const MAX_BYTES = 1 * 1024 * 1024;
const MAX_OUTPUT = 100_000;
const TIMEOUT_MS = 20_000;

export const webFetchTool: ToolSpec<Args> = {
  name: "web_fetch",
  description:
    "Fetch a URL over HTTPS and return its content. HTML pages are converted to markdown. Output is capped at ~100KB.",
  parameters: {
    type: "object",
    properties: {
      url: { type: "string", description: "Full URL, http(s)." },
    },
    required: ["url"],
    additionalProperties: false,
  },
  needsPermission: false,
  render: (args) => ({ title: `GET ${args.url}` }),
  async run(args) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(args.url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "kimi-code/0.1 (+https://github.com/sinameraji/kimi-code)" },
      });
      const ct = res.headers.get("content-type") ?? "";
      const body = await res.text();
      const bounded = body.length > MAX_BYTES ? body.slice(0, MAX_BYTES) : body;
      if (ct.toLowerCase().includes("html")) {
        const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
        return truncate(`# ${args.url}\n\n${td.turndown(bounded)}`, MAX_OUTPUT);
      }
      return truncate(`# ${args.url}\n\n${bounded}`, MAX_OUTPUT);
    } finally {
      clearTimeout(timer);
    }
  },
};
