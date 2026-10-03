/**
 * Input sanitization, anti-bot challenge validation, and AI prompt protection.
 */

// Strip null bytes, control characters (except common whitespace), and dangerous HTML/script injection tags
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  // 1. Remove null bytes and control chars (preserve standard tabs, CR, LF)
  let clean = input.replace(/\0/g, "").replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Sanitize HTML tags and script-like tokens defensively
  clean = clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/javascript:/gi, "");

  return clean.trim();
}

/**
 * Common prompt injection and jailbreak signatures.
 * Catches attempts to bypass safety filters or extract system instructions.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions|prompts)/i,
  /forget\s+your\s+(instructions|system\s+prompt|rules)/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /jailbreak/i,
  /system\s*instruction\s*override/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|api\s*key)/i,
  /what\s+is\s+your\s+system\s+instruction/i,
  /output\s+the\s+above\s+instructions/i,
  /\[system\]/i,
  /\[inst\]/i,
  /<system>/i,
  /system:\s*you\s+are/i,
];

export function isPromptInjection(text: string): boolean {
  if (!text) return false;
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Verify form submission timing to prevent sub-second headless bot spam.
 * Human users take at least 1.2 seconds to view and submit a form.
 */
export function verifySubmissionTiming(submittedTimestamp: string | null | undefined): boolean {
  if (!submittedTimestamp) return true; // If not provided, fallback to honeypot
  const timestamp = parseInt(submittedTimestamp, 10);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  const elapsed = now - timestamp;

  // Bot submitted too fast (< 1200ms) or timestamp is in the future or older than 2 hours
  if (elapsed < 1200 || elapsed > 2 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}
