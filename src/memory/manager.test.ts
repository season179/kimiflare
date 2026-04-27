import { describe, it } from "node:test";
import assert from "node:assert";
import { deterministicTopicKey, pickTopicKey } from "./manager.js";

describe("deterministicTopicKey", () => {
  it("lowercases and snake_cases a simple phrase", () => {
    assert.strictEqual(deterministicTopicKey("Project uses tsup"), "project_uses_tsup");
  });

  it("strips non-alphanumeric characters", () => {
    assert.strictEqual(
      deterministicTopicKey("User prefers single-quotes & semicolons!"),
      "user_prefers_singlequotes_semicolons"
    );
  });

  it("collapses multiple spaces into a single underscore", () => {
    assert.strictEqual(deterministicTopicKey("  lots   of    spaces  "), "lots_of_spaces");
  });

  it("truncates to 60 characters", () => {
    const long = "a".repeat(100);
    const result = deterministicTopicKey(long);
    assert.strictEqual(result.length, 60);
  });

  it("returns empty string for empty input", () => {
    assert.strictEqual(deterministicTopicKey(""), "");
  });

  it("returns empty string for input with only special chars", () => {
    assert.strictEqual(deterministicTopicKey("!!!@@@###"), "");
  });
});

describe("pickTopicKey", () => {
  it("returns a new key when no existing keys match", () => {
    const result = pickTopicKey("new topic here", ["old_topic"]);
    assert.strictEqual(result, "new_topic_here");
  });

  it("reuses an existing key when it is a substring of the new key", () => {
    const result = pickTopicKey("project uses tsup for bundling", ["project_uses_tsup"]);
    assert.strictEqual(result, "project_uses_tsup");
  });

  it("reuses an existing key when the new key is a substring of it", () => {
    const result = pickTopicKey("project uses", ["project_uses_tsup"]);
    assert.strictEqual(result, "project_uses_tsup");
  });

  it("returns null for empty content", () => {
    const result = pickTopicKey("", ["existing"]);
    assert.strictEqual(result, null);
  });

  it("picks the first matching existing key", () => {
    const result = pickTopicKey("project uses tsup", ["project", "project_uses_tsup"]);
    assert.strictEqual(result, "project");
  });
});
