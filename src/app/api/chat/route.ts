import { NextResponse } from "next/server";
import { z } from "zod";
import { dictionaries, type Locale } from "@/lib/i18n";
import { limitChat } from "@/lib/ai/rate-limit";
import { buildSystemInstruction } from "@/lib/ai/knowledge";
import { isPromptInjection } from "@/lib/security/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const schema = z
  .object({
    locale: z.enum(["ar", "en"]),
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "model"]),
            text: z.string().trim().min(1).max(2000),
          })
          .strict(),
      )
      .min(1)
      .max(9),
  })
  .strict()
  .refine(
    ({ messages }) =>
      messages[0].role === "user" &&
      messages.at(-1)?.role === "user" &&
      messages.every(
        (message, index) =>
          index === 0 || message.role !== messages[index - 1].role,
      ) &&
      messages.reduce((total, message) => total + message.text.length, 0) <=
        8000,
  );

function errorResponse(
  locale: Locale,
  code: "error" | "limited" | "invalid" | "unavailable",
  status: number,
  retryAfter?: number,
) {
  return NextResponse.json(
    { error: dictionaries[locale].chat[code], code },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    },
  );
}

function isSameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const supplied = new URL(origin);
    const expected = process.env.SITE_URL
      ? new URL(process.env.SITE_URL)
      : new URL(request.url);
    if (supplied.host === expected.host) return true;
    if (supplied.host === request.headers.get("host")) return true;
    return (
      process.env.NODE_ENV !== "production" &&
      supplied.protocol === "https:" &&
      supplied.hostname.endsWith(".e2b.app")
    );
  } catch {
    return false;
  }
}

async function boundedJson(request: Request) {
  if (!request.body) throw new Error("empty");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    bytes += next.value.byteLength;
    if (bytes > 32000) {
      await reader.cancel();
      throw new Error("too-large");
    }
    chunks.push(next.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

type GeminiResult = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
};

export async function POST(request: Request) {
  let locale: Locale = "ar";
  if (!isSameOrigin(request)) return errorResponse(locale, "invalid", 403);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return errorResponse(locale, "invalid", 415);
  if (Number(request.headers.get("content-length") || 0) > 32000)
    return errorResponse(locale, "invalid", 413);
  let parsed: z.infer<typeof schema>;
  try {
    const raw = await boundedJson(request);
    if (
      typeof raw === "object" &&
      raw !== null &&
      "locale" in raw &&
      raw.locale === "en"
    )
      locale = "en";
    const validated = schema.safeParse(raw);
    if (!validated.success) return errorResponse(locale, "invalid", 400);
    parsed = validated.data;

    // Defense-in-Depth: Block prompt injections and jailbreaks early
    const latestUserMessage = parsed.messages.at(-1)?.text || "";
    if (isPromptInjection(latestUserMessage)) {
      return errorResponse(locale, "invalid", 400);
    }
  } catch {
    return errorResponse(locale, "invalid", 400);
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return errorResponse(locale, "unavailable", 503);
  const limited = await limitChat(request);
  if (!limited.configured)
    return errorResponse(locale, "unavailable", 503, limited.retryAfter);
  if (!limited.allowed)
    return errorResponse(locale, "limited", 429, limited.retryAfter);

  const primary = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const fallback = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-latest";
  const models = Array.from(
    new Set([primary, ...(fallback && fallback !== "none" ? [fallback] : [])]),
  );
  if (models.some((model) => !/^[a-zA-Z0-9._-]+$/.test(model)))
    return errorResponse(locale, "unavailable", 503);
  const instruction = await buildSystemInstruction(locale);
  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[attempt];
    const hasFallback = attempt + 1 < models.length;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          cache: "no-store",
          signal: AbortSignal.timeout(hasFallback ? 8000 : 28000),
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": key,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: instruction }] },
            contents: parsed.messages.map((message) => ({
              role: message.role,
              parts: [{ text: message.text }],
            })),
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 1024,
              ...(model.startsWith("gemini-3")
                ? { thinkingConfig: { thinkingLevel: "low" } }
                : {}),
            },
          }),
        },
      );
      if (!response.ok) {
        // Never log Google request headers, credentials, conversations, or raw provider bodies.
        console.error(
          "[zaltrex-ai] Provider request failed. HTTP",
          response.status,
        );
        // A verified secondary Gemini model is only a resilience fallback, not a fake response.
        // Never fallback to evade rate limits, invalid credentials, or provider safety refusals.
        if ((response.status >= 500 || response.status === 404) && hasFallback)
          continue;
        return errorResponse(
          locale,
          response.status === 429 ? "limited" : "error",
          response.status === 429 ? 429 : 503,
          response.status === 429 ? 60 : 15,
        );
      }
      const data = (await response.json()) as GeminiResult;
      const reply = data.candidates?.[0]?.content?.parts
        ?.filter((part) => !part.thought)
        .map((part) => part.text || "")
        .join("")
        .trim();
      if (!reply) return errorResponse(locale, "error", 503);
      // Data-loss prevention: Ensure provider output does not contain keys or system tokens
      if (
        (key && reply.includes(key)) ||
        reply.includes("UPSTASH_") ||
        reply.includes("AI_RATE_LIMIT_SALT")
      ) {
        return errorResponse(locale, "error", 503);
      }
      return NextResponse.json(
        { reply: reply.slice(0, 6000), model },
        {
          headers: {
            "Cache-Control": "private, no-store",
            "X-Zaltrex-AI-Model": model,
          },
        },
      );
    } catch {
      if (hasFallback) continue;
      console.error("[zaltrex-ai] Provider connection unavailable.");
      return errorResponse(locale, "error", 503, 15);
    }
  }
  return errorResponse(locale, "error", 503);
}
