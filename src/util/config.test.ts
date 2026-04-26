import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../config.js";

const ENV_KEYS = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CF_ACCOUNT_ID",
  "CF_API_TOKEN",
  "KIMIFLARE_AI_GATEWAY_ID",
  "KIMIFLARE_AI_GATEWAY_CACHE_TTL",
  "KIMIFLARE_AI_GATEWAY_SKIP_CACHE",
  "KIMIFLARE_AI_GATEWAY_COLLECT_LOG_PAYLOAD",
  "KIMIFLARE_AI_GATEWAY_METADATA",
  "XDG_CONFIG_HOME",
] as const;

async function withCleanEnv(fn: () => Promise<void>): Promise<void> {
  const previous = new Map<string, string | undefined>();
  for (const key of ENV_KEYS) previous.set(key, process.env[key]);
  for (const key of ENV_KEYS) delete process.env[key];
  try {
    await fn();
  } finally {
    for (const key of ENV_KEYS) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

describe("loadConfig AI Gateway fields", () => {
  it("loads AI Gateway settings from env credentials", async () => {
    await withCleanEnv(async () => {
      process.env.CLOUDFLARE_ACCOUNT_ID = "acct";
      process.env.CLOUDFLARE_API_TOKEN = "token";
      process.env.KIMIFLARE_AI_GATEWAY_ID = "gateway";
      process.env.KIMIFLARE_AI_GATEWAY_CACHE_TTL = "3600";
      process.env.KIMIFLARE_AI_GATEWAY_SKIP_CACHE = "false";
      process.env.KIMIFLARE_AI_GATEWAY_COLLECT_LOG_PAYLOAD = "false";
      process.env.KIMIFLARE_AI_GATEWAY_METADATA = '{"team":"cli","test":true}';

      const cfg = await loadConfig();
      assert.ok(cfg);
      assert.strictEqual(cfg.aiGatewayId, "gateway");
      assert.strictEqual(cfg.aiGatewayCacheTtl, 3600);
      assert.strictEqual(cfg.aiGatewaySkipCache, false);
      assert.strictEqual(cfg.aiGatewayCollectLogPayload, false);
      assert.deepStrictEqual(cfg.aiGatewayMetadata, { team: "cli", test: true });
    });
  });

  it("loads AI Gateway settings from config file", async () => {
    await withCleanEnv(async () => {
      const dir = await mkdtemp(join(tmpdir(), "kimiflare-config-"));
      process.env.XDG_CONFIG_HOME = dir;
      const configDir = join(dir, "kimiflare");
      await mkdir(configDir, { recursive: true });
      await writeFile(
        join(configDir, "config.json"),
        JSON.stringify({
          accountId: "acct",
          apiToken: "token",
          model: "@cf/test/model",
          aiGatewayId: "gateway",
          aiGatewayCacheTtl: 120,
          aiGatewaySkipCache: true,
          aiGatewayCollectLogPayload: false,
          aiGatewayMetadata: { team: "cli" },
        }),
      );

      try {
        const cfg = await loadConfig();
        assert.ok(cfg);
        assert.strictEqual(cfg.aiGatewayId, "gateway");
        assert.strictEqual(cfg.aiGatewayCacheTtl, 120);
        assert.strictEqual(cfg.aiGatewaySkipCache, true);
        assert.strictEqual(cfg.aiGatewayCollectLogPayload, false);
        assert.deepStrictEqual(cfg.aiGatewayMetadata, { team: "cli" });
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  });
});
