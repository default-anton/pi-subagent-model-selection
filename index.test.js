import assert from "node:assert/strict";
import test from "node:test";

import { getSmallModelFromProvider } from "./index.js";

function makeRegistry(models, options = {}) {
  return {
    getAvailable() {
      return models;
    },
    getAuthSource() {
      return options.authSource ?? "none";
    },
    isUsingOAuth() {
      return options.usingOAuth ?? false;
    },
  };
}

test("oauth mode prefers openai-codex/gpt-5.3-codex-spark with high thinking", () => {
  const models = [
    { provider: "openai-codex", id: "gpt-5.3-codex-spark" },
    { provider: "google-antigravity", id: "gemini-3-flash" },
  ];

  const selected = getSmallModelFromProvider(
    makeRegistry(models, { authSource: "oauth", usingOAuth: true }),
    { provider: "openai-codex", id: "gpt-5.3-codex" },
  );

  assert.ok(selected);
  assert.equal(selected.model.provider, "openai-codex");
  assert.equal(selected.model.id, "gpt-5.3-codex-spark");
  assert.equal(selected.thinkingLevel, "high");
  assert.equal(selected.authMode, "oauth");
  assert.equal(selected.authSource, "oauth");
});

test("oauth mode falls back to google-antigravity/gemini-3-flash when codex spark is unavailable", () => {
  const models = [
    { provider: "google-antigravity", id: "gemini-3-flash" },
    { provider: "google-vertex", id: "gemini-3-flash-preview" },
  ];

  const selected = getSmallModelFromProvider(
    makeRegistry(models, { authSource: "oauth", usingOAuth: true }),
    { provider: "openai-codex", id: "gpt-5.3-codex" },
  );

  assert.ok(selected);
  assert.equal(selected.model.provider, "google-antigravity");
  assert.equal(selected.model.id, "gemini-3-flash");
  assert.equal(selected.thinkingLevel, "low");
});

test("api-key mode prefers google-vertex gemini-3-flash family", () => {
  const models = [
    { provider: "google-vertex", id: "gemini-3-flash-preview" },
    { provider: "google", id: "gemini-3-flash-preview" },
  ];

  const selected = getSmallModelFromProvider(
    makeRegistry(models, { authSource: "api_key" }),
    { provider: "openai", id: "gpt-5.1-codex" },
  );

  assert.ok(selected);
  assert.equal(selected.model.provider, "google-vertex");
  assert.equal(selected.model.id, "gemini-3-flash-preview");
  assert.equal(selected.authMode, "api-key");
  assert.equal(selected.authSource, "api_key");
});

test("api-key mode falls back to google gemini when vertex missing", () => {
  const models = [{ provider: "google", id: "gemini-3-flash-preview" }];

  const selected = getSmallModelFromProvider(
    makeRegistry(models, { authSource: "env" }),
    { provider: "anthropic", id: "claude-opus-4-6" },
  );

  assert.ok(selected);
  assert.equal(selected.model.provider, "google");
  assert.equal(selected.model.id, "gemini-3-flash-preview");
  assert.equal(selected.authMode, "api-key");
  assert.equal(selected.authSource, "env");
});

test("fallback prefers current provider haiku 4.5", () => {
  const models = [{ provider: "anthropic", id: "claude-haiku-4-5" }];

  const selected = getSmallModelFromProvider(
    makeRegistry(models, { authSource: "api_key" }),
    { provider: "anthropic", id: "claude-opus-4-6" },
  );

  assert.ok(selected);
  assert.equal(selected.model.provider, "anthropic");
  assert.equal(selected.model.id, "claude-haiku-4-5");
  assert.equal(selected.thinkingLevel, "low");
});

test("fallback uses current model with low thinking", () => {
  const models = [{ provider: "openai", id: "gpt-5.1-codex" }];

  const selected = getSmallModelFromProvider(
    makeRegistry(models, { authSource: "runtime" }),
    { provider: "openai", id: "gpt-5.1-codex" },
  );

  assert.ok(selected);
  assert.equal(selected.model.provider, "openai");
  assert.equal(selected.model.id, "gpt-5.1-codex");
  assert.equal(selected.thinkingLevel, "low");
});

test("when current model is missing, defaults to api-key policy with explicit reason", () => {
  const models = [{ provider: "google", id: "gemini-3-flash-preview" }];

  const selected = getSmallModelFromProvider(makeRegistry(models, { authSource: "oauth" }), undefined);

  assert.ok(selected);
  assert.equal(selected.authMode, "api-key");
  assert.equal(selected.authSource, "none");
  assert.match(selected.reason, /no current model/i);
});

test("falls back to isUsingOAuth on older model registries", () => {
  const models = [
    { provider: "google-antigravity", id: "gemini-3-flash" },
    { provider: "openai", id: "gpt-5.1-codex" },
  ];

  const legacyRegistry = {
    getAvailable() {
      return models;
    },
    isUsingOAuth() {
      return true;
    },
  };

  const selected = getSmallModelFromProvider(legacyRegistry, { provider: "openai", id: "gpt-5.1-codex" });

  assert.ok(selected);
  assert.equal(selected.authMode, "oauth");
  assert.equal(selected.authSource, "oauth");
  assert.equal(selected.model.provider, "google-antigravity");
});
