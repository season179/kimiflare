# kimiflare

A terminal coding agent powered by **[Kimi-K2.6](https://developers.cloudflare.com/workers-ai/models/kimi-k2.6/)** on Cloudflare Workers AI. It's Claude Code, but the model is Moonshot's 1T-parameter open-source Kimi running directly on your Cloudflare account — no middleman, no AI Gateway, no OpenAI SDK. You bring the token, your traffic goes straight to Cloudflare.

```
$ kimiflare
kimiflare · /help for commands · ctrl-c to exit

› what files are here?
  ✓ glob(*)
    /Users/you/proj/package.json
    /Users/you/proj/src/index.ts
    ...

› add a /health endpoint to server.ts
  ✓ read(src/server.ts)
  ◐ edit src/server.ts
    ─── permission requested ──────────────────
    @@ -42,6 +42,10 @@
       app.get('/', …)
    +  app.get('/health', (_, res) => res.json({ ok: true }))
    ─────────────────────────────────────────────
    [Allow once] [Allow for session] [Deny]
```

## Why

- **262k context.** Read entire modules without pagination.
- **Native tool use.** File I/O, shell, globs, grep, web fetch — all wired up, with per-call approval for anything mutating.
- **Streaming reasoning + content.** The model's chain-of-thought streams separately; toggle with `/reasoning` or `Ctrl-R`.
- **Pay your own way.** Your Cloudflare account, your credits, your rate limits. `$0.95 / M input`, `$0.16 / M cached input`, `$4.00 / M output`. The bottom status line shows live cost.

## Install

```sh
git clone https://github.com/sinameraji/kimiflare
cd kimiflare
npm install
npm run build
npm link          # or: ln -s "$PWD/bin/kimiflare.mjs" ~/.local/bin/kimiflare
```

Published npm package coming soon.

## Configure

Get credentials from Cloudflare:

1. https://dash.cloudflare.com → your account → copy **Account ID**.
2. https://dash.cloudflare.com/profile/api-tokens → **Create Token** → Custom token with **Account › Workers AI › Read** on your account → **Create** → copy.

Then either export them each shell:

```sh
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...
```

or save them once (`chmod 600` automatically):

```sh
mkdir -p ~/.config/kimiflare
cat > ~/.config/kimiflare/config.json <<'EOF'
{
  "accountId": "YOUR_ACCOUNT_ID",
  "apiToken":  "YOUR_API_TOKEN",
  "model":     "@cf/moonshotai/kimi-k2.6"
}
EOF
chmod 600 ~/.config/kimiflare/config.json
```

## Usage

```sh
kimiflare                             # interactive TUI
kimiflare -p "summarize PLAN.md"      # one-shot, streams answer to stdout
kimiflare -p "..." --dangerously-allow-all   # auto-approve mutating tools (for scripts)
kimiflare --model @cf/moonshotai/kimi-k2.6   # override model
kimiflare --reasoning                 # (print mode) stream chain-of-thought to stderr
```

Interactive slash commands:

| Command       | Effect                                           |
|---------------|--------------------------------------------------|
| `/clear`      | Reset the conversation (keeps system prompt)    |
| `/reasoning`  | Toggle chain-of-thought display                 |
| `/cost`       | Show token usage so far                          |
| `/model`      | Show current model                               |
| `/help`       | List commands                                    |
| `/exit`       | Quit                                             |

Keys: `Ctrl-R` toggles reasoning, `Ctrl-C` interrupts an in-flight turn (press again to exit).

## Tools

All tool calls show inline; mutating ones require per-call approval the first time, with an option to allow for the rest of the session.

| Tool        | Permission | What it does |
|-------------|------------|--------------|
| `read`      | auto       | Read a text file (≤ 2MB) with optional line range. |
| `write`     | prompt     | Create or overwrite a file. Shows a unified diff before you approve. |
| `edit`      | prompt     | Replace an exact substring. Fails unless `old_string` is unique (or `replace_all=true`). |
| `bash`      | prompt     | Run a shell command via `bash -lc`. Session-allow is keyed by the first token of the command. |
| `glob`      | auto       | Match files by pattern (`**/*.ts`), sorted by mtime. |
| `grep`      | auto       | Regex search. Uses `rg` if installed; falls back to a JS walk. |
| `web_fetch` | auto       | Fetch a URL, convert HTML → markdown (≤ 100KB). |

## How it works

```
           ┌───────────────────────────────────────────────────────────┐
           │ kimiflare (Node + Ink TUI)                                │
 user ─▶   │                                                           │
           │   user msg ─▶ agent loop ─▶ runKimi() ──[POST SSE]──▶     │
           │                       ▲                                   │
           │                       │                                   │
           │      tool result ◀──tool executor──◀ tool_calls           │
           │           (permission modal for write / edit / bash)      │
           └───────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                                       api.cloudflare.com/client/v4
                                       /accounts/{ID}/ai/run/
                                       @cf/moonshotai/kimi-k2.6
```

No AI Gateway, no proxy, no OpenAI SDK. Direct `fetch` to Workers AI, OpenAI-compatible `messages` + `tools` payload, SSE stream with reasoning + content + tool-call deltas accumulated by index.

## Status

Early. Transport + tools + agent loop + print mode are verified end-to-end; interactive TUI renders cleanly under a pty and awaits real-terminal shakedown. See `PLAN.md` for milestone log and deferred items (first-run wizard, npm publish, session resume).

## License

TBD.
