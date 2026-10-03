"use client";

import { useTransition } from "react";
import { Globe2, LoaderCircle } from "lucide-react";
import { setLanguage } from "@/app/language-action";
import { useLocale } from "./providers";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      onClick={() =>
        startTransition(async () => {
          await setLanguage(locale === "ar" ? "en" : "ar");
        })
      }
      className="language-switcher"
    >
      {pending ? (
        <LoaderCircle size={15} className="animate-spin" />
      ) : (
        <Globe2 size={15} aria-hidden="true" />
      )}
      <span lang={locale === "ar" ? "en" : "ar"}>
        {locale === "ar" ? "EN" : "عربي"}
      </span>
    </button>
  );
}
