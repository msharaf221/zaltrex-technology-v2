"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dictionaries, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import type { FormState } from "@/lib/form-state";
import { sanitizeInput, verifySubmissionTiming } from "@/lib/security/sanitize";
import { limitServerAction } from "@/lib/security/action-limiter";

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function formLocale(form: FormData): Locale {
  return text(form, "locale") === "en" ? "en" : "ar";
}

function failure(message: string, values?: Record<string, string>): FormState {
  return { status: "error", message, values };
}

async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || headerStore.get("x-real-ip") || "anonymous";
  } catch {
    return "anonymous";
  }
}

export async function submitContact(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const t = dictionaries[formLocale(form)].validation;
  const values = {
    name: sanitizeInput(text(form, "name")),
    email: sanitizeInput(text(form, "email")).trim(),
    subject: sanitizeInput(text(form, "subject")),
    message: sanitizeInput(text(form, "message")),
  };

  // 1. Honeypot bot protection
  if (text(form, "company_website")) return failure(t.contactError);

  // 2. Submission timing check (anti-bot)
  const renderTs = text(form, "_render_ts");
  if (renderTs && !verifySubmissionTiming(renderTs)) {
    return failure(t.botDetected, values);
  }

  // 3. Rate limiting protection
  const ip = await getClientIp();
  const limit = await limitServerAction("contact", ip);
  if (!limit.allowed) {
    return failure(t.rateLimited, values);
  }

  // 4. Schema validation
  const schema = z.object({
    name: z.string().trim().min(1, t.name).max(120, t.tooLong),
    email: z.email(t.email).max(254, t.tooLong),
    subject: z.string().trim().min(1, t.subject).max(160, t.tooLong),
    message: z.string().trim().min(1, t.message).max(10000, t.tooLong),
  });

  const parsed = schema.safeParse(values);
  if (!parsed.success)
    return {
      ...failure(t.check, values),
      fieldErrors: parsed.error.flatten().fieldErrors,
    };

  const supabase = await createClient();
  if (!supabase) return failure(t.unconfigured, values);

  try {
    // No .select(): public INSERT permission does not include reading submitted rows.
    const { error } = await supabase
      .from("contact_messages")
      .insert(parsed.data);
    if (error) {
      console.error("[contact] Insert failed:", error.code);
      return failure(t.contactError, values);
    }
    return { status: "success", message: t.contactSuccess };
  } catch {
    return failure(t.network, values);
  }
}

export async function submitServiceRequest(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const t = dictionaries[formLocale(form)].validation;
  const values = {
    service_id: text(form, "service_id"),
    requirements: sanitizeInput(text(form, "requirements")),
  };

  // Rate limiting protection
  const ip = await getClientIp();
  const limit = await limitServerAction("request", ip);
  if (!limit.allowed) {
    return failure(t.rateLimited, values);
  }

  const schema = z.object({
    service_id: z.uuid(t.service),
    requirements: z
      .string()
      .trim()
      .min(1, t.requirements)
      .max(10000, t.tooLong),
  });

  const parsed = schema.safeParse(values);
  if (!parsed.success)
    return {
      ...failure(t.check, values),
      fieldErrors: parsed.error.flatten().fieldErrors,
    };

  const supabase = await createClient();
  if (!supabase) return failure(t.unconfigured, values);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return failure(t.authRequired, values);

    // client_id is derived ONLY from the verified session; RLS independently enforces it.
    const { error } = await supabase.from("service_requests").insert({
      client_id: user.id,
      service_id: parsed.data.service_id,
      requirements: parsed.data.requirements,
    });

    if (error) {
      console.error("[request-service] Insert failed:", error.code);
      return failure(t.requestError, values);
    }
    revalidatePath("/request-service");
    return { status: "success", message: t.requestSuccess };
  } catch {
    return failure(t.network, values);
  }
}

export async function signIn(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const t = dictionaries[formLocale(form)].validation;

  // Rate limiting against brute force password guessing / credential stuffing
  const ip = await getClientIp();
  const limit = await limitServerAction("signin", ip);
  if (!limit.allowed) {
    return failure(t.rateLimited);
  }

  const schema = z.object({
    email: z.email(t.email).max(254, t.tooLong),
    password: z.string().min(1, t.password).max(128, t.tooLong),
  });

  const parsed = schema.safeParse({
    email: text(form, "email").trim(),
    password: text(form, "password"),
  });

  if (!parsed.success)
    return {
      ...failure(t.check),
      fieldErrors: parsed.error.flatten().fieldErrors,
    };

  const supabase = await createClient();
  if (!supabase) return failure(t.unconfigured);

  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return failure(t.signinError); // Do not disclose whether an email account exists.
    revalidatePath("/request-service");
    return { status: "success", message: t.signinSuccess };
  } catch {
    return failure(t.network);
  }
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error)
      throw new Error(dictionaries[await getLocale()].validation.signoutError);
  }
  revalidatePath("/request-service");
  redirect("/request-service");
}
