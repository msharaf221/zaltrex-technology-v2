import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Locale } from "./i18n";

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  return store.get("zaltrex_locale")?.value === "en" ? "en" : "ar";
});
