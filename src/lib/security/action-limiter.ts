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

// Action limiters with strict sliding windows
const contactLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "zaltrex:action:contact",
      analytics: false,
      timeout: 2000,
    })
  : null;

const signinLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "5 m"),
      prefix: "zaltrex:action:signin",
      analytics: false,
      timeout: 2000,
    })
  : null;

const requestLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(6, "10 m"),
      prefix: "zaltrex:action:request",
      analytics: false,
      timeout: 2000,
    })
  : null;

type ActionType = "contact" | "signin" | "request";

type DevActionEntry = {
  timestamps: number[];
};

const devActionBuckets = new Map<string, DevActionEntry>();

function cleanDevBuckets(windowMs: number) {
  const now = Date.now();
  for (const [key, entry] of devActionBuckets.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      devActionBuckets.delete(key);
    }
  }
}

export async function limitServerAction(
  action: ActionType,
  clientIp?: string | null,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const salt = process.env.AI_RATE_LIMIT_SALT || "zaltrex-action-salt-key";
  const rawId = clientIp || "anonymous-action";
  const identifier = createHash("sha256")
    .update(`${salt}:${action}:${rawId}`)
    .digest("hex");

  // In production with Redis:
  if (redis) {
    const limiter =
      action === "contact"
        ? contactLimiter
        : action === "signin"
          ? signinLimiter
          : requestLimiter;

    if (limiter) {
      try {
        const result = await limiter.limit(identifier);
        if (result.reason === "timeout") {
          return { allowed: false, retryAfter: 30 };
        }
        return {
          allowed: result.success,
          retryAfter: result.success
            ? 0
            : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
        };
      } catch {
        // Fall back to local memory bucket
      }
    }
  }

  // Resilient memory sliding-window limiter (for development or fallback)
  const windowMs =
    action === "signin"
      ? 5 * 60 * 1000 // 5 minutes
      : 10 * 60 * 1000; // 10 minutes
  const maxAttempts = action === "request" ? 6 : 5;

  cleanDevBuckets(windowMs);
  const now = Date.now();
  let entry = devActionBuckets.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    devActionBuckets.set(identifier, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxAttempts) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfter: 0 };
}
