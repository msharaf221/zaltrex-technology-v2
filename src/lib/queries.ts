import "server-only";
import type {
  Service,
  SiteContent,
  ServiceRequest,
} from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";

export type QueryState = "ready" | "unconfigured" | "error";

export async function getActiveServices(): Promise<{
  services: Service[];
  state: QueryState;
}> {
  const supabase = await createClient();
  if (!supabase) return { services: [], state: "unconfigured" };
  try {
    // SELECT * also works before the optional i18n columns are migrated; localization safely falls back.
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(100)
      .abortSignal(AbortSignal.timeout(5000));
    if (error) {
      console.error("[services] Query failed:", error.code);
      return { services: [], state: "error" };
    }
    return { services: data ?? [], state: "ready" };
  } catch {
    return { services: [], state: "error" };
  }
}

export async function getSiteContent(
  section: string,
): Promise<SiteContent | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("id,section_name,content_text,image_url")
      .eq("section_name", section)
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}

export async function getLocalizedSiteContent(
  section: string,
  locale: Locale,
): Promise<SiteContent | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  try {
    const keys =
      locale === "en" ? [`${section}_en`] : [`${section}_ar`, section];
    const { data, error } = await supabase
      .from("site_content")
      .select("id,section_name,content_text,image_url")
      .in("section_name", keys)
      .abortSignal(AbortSignal.timeout(5000));
    if (error) return null;
    if (locale === "en") {
      const row = data?.find((r) => r.section_name === `${section}_en`);
      return row && (row.content_text.trim() || row.image_url) ? row : null;
    }
    const rowAr = data?.find((r) => r.section_name === `${section}_ar`);
    if (rowAr && (rowAr.content_text.trim() || rowAr.image_url)) return rowAr;
    const rowDefault = data?.find((r) => r.section_name === section);
    return rowDefault &&
      (rowDefault.content_text.trim() || rowDefault.image_url)
      ? rowDefault
      : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
  } catch {
    return null;
  }
}

export async function getOwnRequests(
  clientId: string,
): Promise<{ requests: ServiceRequest[]; error: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { requests: [], error: true };
  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select("id,client_id,service_id,requirements,status,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5)
      .abortSignal(AbortSignal.timeout(5000));
    return { requests: data ?? [], error: Boolean(error) };
  } catch {
    return { requests: [], error: true };
  }
}
