export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!url || !key || key.startsWith("sb_secret_")) return null;
  try {
    if (!["https:", "http:"].includes(new URL(url).protocol)) return null;
    // Guard against accidentally using an old-style service_role JWT as a public key.
    if (key.split(".").length === 3) {
      const payload = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.role === "service_role") return null;
    }
  } catch {
    return null;
  }

  return { url, key };
}
