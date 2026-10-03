"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n";

export async function setLanguage(locale: Locale) {
  if (locale !== "ar" && locale !== "en") return;
  (await cookies()).set("zaltrex_locale", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
}
