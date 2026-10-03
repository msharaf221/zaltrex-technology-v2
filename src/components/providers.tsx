"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import { dictionaries, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("ar");
const MotionContext = createContext({ paused: false, toggle: () => {} });

export function Providers({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("motion-paused", paused);
    return () => document.body.classList.remove("motion-paused");
  }, [paused]);

  return (
    <LocaleContext.Provider value={locale}>
      <MotionContext.Provider
        value={{ paused, toggle: () => setPaused((value) => !value) }}
      >
        <MotionConfig reducedMotion={paused ? "always" : "user"}>
          <LazyMotion features={domAnimation} strict>
            {children}
          </LazyMotion>
        </MotionConfig>
      </MotionContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const locale = useContext(LocaleContext);
  return { locale, t: dictionaries[locale], isArabic: locale === "ar" };
}
export function useMotionPreference() {
  return useContext(MotionContext);
}
