"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env)
    throw new Error(
      "Set the Supabase URL and publishable (or anon) key first.",
    );
  return createBrowserClient<Database>(env.url, env.key);
}
