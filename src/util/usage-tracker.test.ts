import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fetchGatewayUsageSnapshot, getCostReport, recordUsage } from "../usage-tracker.js";

describe("AI Gateway usage enrichment", () => {
  let originalFetch: typeof globalThis.fetch;
  let originalXdgDataHome: string | undefined;
  let lastRequest: Request | null = null;

  before(() => {
    originalFetch = globalThis.fetch;
    originalXdgDataHome = process.env.XDG_DATA_HOME;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      lastRequest = new Request(input, init);
      return Response.json({
        result: [
          {
            id: "log_123",
            cached: true,
            duration: 42,
            model: "@cf/test/model",
            provider: "workers-ai",
            status_code: 200,
            tokens_in: 10,
            tokens_out: 2,
            cost: 0.00001,
          },
        ],
      });
    };
  });

  after(() => {
    globalThis.fetch = originalFetch;
    if (originalXdgDataHome === undefined) delete process.env.XDG_DATA_HOME;
    else process.env.XDG_DATA_HOME = originalXdgDataHome;
  });

  it("fetches a gateway log by cf-aig-log-id", async () => {
    const snapshot = await fetchGatewayUsageSnapshot({
      accountId: "acct",
      apiToken: "token",
      gatewayId: "gateway",
      meta: { logId: "log_123", cacheStatus: "HIT", eventId: "evt_123" },
    });

    assert.ok(lastRequest);
    assert.strictEqual(
      lastRequest!.url,
      "https://api.cloudflare.com/client/v4/accounts/acct/ai-gateway/gateways/gateway/logs",
    );
    assert.strictEqual(lastRequest!.headers.get("Authorization"), "Bearer token");
    assert.deepStrictEqual(snapshot, {
      logId: "log_123",
      eventId: "evt_123",
      cacheStatus: "HIT",
      cached: true,
      duration: 42,
      statusCode: 200,
      model: "@cf/test/model",
      provider: "workers-ai",
      tokensIn: 10,
      tokensOut: 2,
      cost: 0.00001,
    });
  });

  it("records local usage with gateway metadata as best-effort enrichment", async () => {
    const dir = await mkdtemp(join(tmpdir(), "kimiflare-usage-"));
    process.env.XDG_DATA_HOME = dir;
    try {
      await recordUsage(
        "session_1",
        {
          prompt_tokens: 10,
          completion_tokens: 2,
          total_tokens: 12,
          prompt_tokens_details: { cached_tokens: 0 },
        },
        {
          accountId: "acct",
          apiToken: "token",
          gatewayId: "gateway",
          meta: { logId: "log_123", cacheStatus: "HIT" },
        },
      );

      const report = await getCostReport("session_1");
      assert.strictEqual(report.session.promptTokens, 10);
      assert.strictEqual(report.session.completionTokens, 2);
      assert.strictEqual(report.session.gatewayRequests, 1);
      assert.strictEqual(report.session.gatewayCachedRequests, 1);
      assert.strictEqual(report.session.gatewayCost, 0.00001);
      assert.strictEqual(report.session.cost, 0.00001);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
