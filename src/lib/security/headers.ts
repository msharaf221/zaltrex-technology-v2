/**
 * Enterprise Military-Grade HTTP Security Headers
 *
 * Implements Defense-in-Depth headers complying with OWASP Top 10,
 * Mozilla Observatory A+ standards, and RFC security guidelines.
 */

export function getSecurityHeaders(
  isProduction: boolean = process.env.NODE_ENV === "production",
): Record<string, string> {
  // Content Security Policy
  // Note: 'unsafe-inline' is required for Next.js hydration scripts & styling.
  // We forbid object-src, restrict base-uri, enforce frame-ancestors 'none', and restrict connect sources.
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "connect-src 'self' https://*.supabase.co https://*.upstash.io https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];

  const headers: Record<string, string> = {
    // 1. Content Security Policy
    "Content-Security-Policy": cspDirectives.join("; "),

    // 2. Prevent clickjacking by forbidding embedding in frames
    "X-Frame-Options": "DENY",

    // 3. Prevent MIME-type sniffing
    "X-Content-Type-Options": "nosniff",

    // 4. Protect referrer information on external navigation
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // 5. Restrict access to sensitive browser capabilities & hardware
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "browsing-topics=()",
      "payment=()",
      "usb=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
      "interest-cohort=()",
    ].join(", "),

    // 6. Cross-Origin isolation policies
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "credentialless",

    // 7. Prevent legacy Adobe Flash/PDF domain policy exploitation
    "X-Permitted-Cross-Domain-Policies": "none",

    // 8. Disable prefetching of external DNS to preserve privacy
    "X-DNS-Prefetch-Control": "off",
  };

  // 9. HTTP Strict Transport Security (HSTS) with subdomains and preload
  if (isProduction) {
    headers["Strict-Transport-Security"] =
      "max-age=63072000; includeSubDomains; preload";
  }

  return headers;
}
