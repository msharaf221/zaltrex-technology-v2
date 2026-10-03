import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function configuredRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const parsed = new URL(url);
    // Only send the private REST token to the expected HTTPS provider.
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname.endsWith(".upstash.io") ||
      parsed.username ||
      parsed.password
    )
      return null;
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const redis = configuredRedis();
const perMinute = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(8, "1 m"),
      prefix: "zaltrex:ai:minute",
      analytics: false,
      timeout: 2000,
    })
  : null;
const dailyVisitor = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(60, "1 d"),
      prefix: "zaltrex:ai:visitor-day",
      analytics: false,
      timeout: 2000,
    })
  : null;
const dailyGlobal = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(500, "1 d"),
      prefix: "zaltrex:ai:global-day",
      analytics: false,
      timeout: 2000,
    })
  : null;

type Bucket = {
  minute: number;
  minuteCount: number;
  day: number;
  dayCount: number;
};
const devState = globalThis as typeof globalThis & {
  __zaltrexDevAIBucket?: Bucket;
};

export async function limitChat(
  request: Request,
): Promise<{ allowed: boolean; configured: boolean; retryAfter: number }> {
  const salt = process.env.AI_RATE_LIMIT_SALT;
  if (process.env.NODE_ENV === "production" && (!salt || salt.length < 32))
    return { allowed: false, configured: false, retryAfter: 60 };
  // Default is one shared bucket. Trust forwarded headers ONLY if your own hosting proxy overwrites them.
  const rawId =
    process.env.AI_TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "anonymous"
      : "anonymous";
  const identifier = createHash("sha256")
    .update(`${salt || "zaltrex"}:${rawId}`)
    .digest("hex");

  if (perMinute && dailyVisitor && dailyGlobal) {
    try {
      const results = await Promise.all([
        perMinute.limit(identifier),
        dailyVisitor.limit(identifier),
        dailyGlobal.limit("all"),
      ]);
      // Upstash's default timeout response is success:true. Explicitly reject it to fail CLOSED.
      if (results.some((result) => result.reason === "timeout"))
        return { allowed: false, configured: false, retryAfter: 30 };
      const failed = results.find((result) => !result.success);
      return {
        allowed: !failed,
        configured: true,
        retryAfter: failed
          ? Math.max(1, Math.ceil((failed.reset - Date.now()) / 1000))
          : 0,
      };
    } catch {
      // A Redis outage must never expose an unlimited paid API.
      return { allowed: false, configured: false, retryAfter: 30 };
    }
  }
  if (process.env.NODE_ENV === "production")
    return { allowed: false, configured: false, retryAfter: 60 };

  // Development-only shared memory bucket. Resets on restart; not a production quota.
  const minute = Math.floor(Date.now() / 60000);
  const day = Math.floor(Date.now() / 86400000);
  const bucket = devState.__zaltrexDevAIBucket ?? {
    minute,
    minuteCount: 0,
    day,
    dayCount: 0,
  };
  if (bucket.minute !== minute) {
    bucket.minute = minute;
    bucket.minuteCount = 0;
  }
  if (bucket.day !== day) {
    bucket.day = day;
    bucket.dayCount = 0;
  }
  devState.__zaltrexDevAIBucket = bucket;
  if (bucket.minuteCount >= 12 || bucket.dayCount >= 100)
    return {
      allowed: false,
      configured: true,
      retryAfter: bucket.dayCount >= 100 ? 3600 : 60,
    };
  bucket.minuteCount++;
  bucket.dayCount++;
  return { allowed: true, configured: true, retryAfter: 0 };
}
