import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSecurityHeaders } from "@/lib/security/headers";

// Next.js 16 calls this proxy.ts. For Next.js 15 use middleware.ts instead.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Apply enterprise military-grade security headers
  const securityHeaders = getSecurityHeaders(process.env.NODE_ENV === "production");
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  const env = getSupabaseEnv();
  if (!env) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate, max-age=0",
    );
    response.headers.set("Expires", "0");
    response.headers.set("Pragma", "no-cache");
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        // Re-apply security headers on new response
        for (const [key, val] of Object.entries(securityHeaders)) {
          response.headers.set(key, val);
        }
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) =>
          response.headers.set(name, value),
        );
      },
    },
  });

  // Verify, don't trust getSession() on the server. Public pages remain public.
  try {
    await supabase.auth.getClaims();
  } catch {
    // An Auth outage must not crash the public website. Protected actions still
    // verify their user with getUser() and refuse unauthenticated writes.
    console.error("[auth] Unable to refresh the session.");
  }

  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
