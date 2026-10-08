"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { Brand } from "./brand";
import { useLocale } from "./providers";
import { ChatTrigger } from "./chat-trigger";

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="site-footer">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-8 border-b border-slate-200/70 py-10 sm:flex-row sm:items-center sm:py-14">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t.home.finalTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-500">{t.home.finalDesc}</p>
          </div>
          <Link href="/contact" className="button-primary w-fit">
            {t.common.talk}
            <ArrowUpRight className="directional" size={17} />
          </Link>
        </div>
        <div className="grid gap-10 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Brand showTagline />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              {t.common.brandLine}
            </p>
          </div>
          <nav
            aria-label={t.common.footerNav}
            className="grid grid-cols-2 gap-x-7 gap-y-4 text-sm"
          >
            <Link href="/about" className="quiet-link">
              {t.common.about}
            </Link>
            <Link href="/solutions" className="quiet-link">
              {t.common.solutions}
            </Link>
            <Link href="/contact" className="quiet-link">
              {t.common.contact}
            </Link>
            <Link href="/request-service" className="quiet-link">
              {t.common.request}
            </Link>
          </nav>
          <div className="sm:justify-self-end">
            <p className="mb-3 text-xs text-slate-500">
              {t.home.assistantLabel}
            </p>
            <ChatTrigger className="text-link" arrow={false} />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-200/70 py-6 text-[11px] leading-6 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Zaltrex Technology.{" "}
            {t.common.allRights}
          </span>
          <span>{t.common.footerNote}</span>
          <a
            href="#top"
            aria-label={t.common.toTop}
            className="icon-button w-fit !size-9"
          >
            <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
