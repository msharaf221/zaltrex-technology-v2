import assert from "node:assert/strict";

// Node 22: run with --conditions=react-server --experimental-strip-types.
// No Google requests, real Redis connections, or secret values are used by these tests.
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
const originalEnv = { ...process.env };
let requests = 0;
let hanging = false;
let checks = 0;
let clock = Date.UTC(2026, 9, 3, 12, 0, 0);
function passed(name) {
  checks++;
  console.log(`✓ ${name}`);
}
try {
  globalThis.fetch = async () => {
    requests++;
    if (hanging) return new Promise(() => {});
    throw new Error("Unexpected network request in a local security test");
  };
  Date.now = () => clock;
  process.env.NODE_ENV = "development";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.AI_RATE_LIMIT_SALT;
  process.env.AI_TRUST_PROXY = "false";
  delete globalThis.__zaltrexDevAIBucket;
  const url = new URL("../src/lib/ai/rate-limit.ts", import.meta.url);
  const { limitChat } = await import(`${url.href}?memory-tests`);
  const request = new Request("https://zaltrex.test/api/chat");
  for (let index = 0; index < 12; index++)
    assert.deepEqual(await limitChat(request), {
      allowed: true,
      configured: true,
      retryAfter: 0,
    });
  passed("Development permits the first twelve requests in a minute");
  const denied = await limitChat(request);
  assert.equal(denied.allowed, false);
  assert.ok(denied.retryAfter > 0);
  passed("Thirteenth development request is rate limited");
  assert.equal(
    (
      await limitChat(
        new Request(request.url, {
          headers: { "x-forwarded-for": "198.51.100.2" },
        }),
      )
    ).allowed,
    false,
  );
  passed("Forged forwarded IP does not evade the default shared quota");
  clock += 60000;
  assert.equal((await limitChat(request)).allowed, true);
  passed("A new minute restores the development minute allowance");
  delete globalThis.__zaltrexDevAIBucket;
  for (let index = 0; index < 100; index++) {
    clock += 60000;
    assert.equal((await limitChat(request)).allowed, true);
  }
  clock += 60000;
  assert.equal((await limitChat(request)).allowed, false);
  passed("Development daily quota blocks the one hundred and first request");
  clock += 86400000;
  assert.equal((await limitChat(request)).allowed, true);
  passed("A new day resets the development daily allowance");
  process.env.NODE_ENV = "production";
  process.env.AI_RATE_LIMIT_SALT =
    "security-test-only-not-a-secret-32-characters";
  assert.deepEqual(await limitChat(request), {
    allowed: false,
    configured: false,
    retryAfter: 60,
  });
  passed("Production without durable Redis fails closed");
  process.env.UPSTASH_REDIS_REST_URL = "https://fixture.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fixture-only-not-a-real-token";
  delete process.env.AI_RATE_LIMIT_SALT;
  const noSalt = await import(`${url.href}?production-missing-salt`);
  const before = requests;
  assert.deepEqual(await noSalt.limitChat(request), {
    allowed: false,
    configured: false,
    retryAfter: 60,
  });
  assert.equal(requests, before);
  passed("Production requires a private salt before any Redis/API operation");
  process.env.AI_RATE_LIMIT_SALT =
    "security-test-only-not-a-secret-32-characters";
  hanging = true;
  Date.now = originalNow;
  const timedOut = await noSalt.limitChat(request);
  assert.deepEqual(timedOut, {
    allowed: false,
    configured: false,
    retryAfter: 30,
  });
  assert.ok(requests > before);
  passed("Upstash SDK success:true timeout responses are explicitly denied");
  console.log(
    `\n${checks} local AI guard checks passed. No provider requests were made.`,
  );
} finally {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
  delete globalThis.__zaltrexDevAIBucket;
  for (const name of Object.keys(process.env))
    if (!(name in originalEnv)) delete process.env[name];
  Object.assign(process.env, originalEnv);
}
