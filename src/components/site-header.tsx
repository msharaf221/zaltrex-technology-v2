"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Brand } from "./brand";
import { LanguageSwitcher } from "./language-switcher";
import { useLocale } from "./providers";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  const links = [
    { href: "/", label: t.common.home },
    { href: "/about", label: t.common.about },
    { href: "/solutions", label: t.common.solutions },
    { href: "/contact", label: t.common.contact },
  ];

  return (
    <header className="site-header">
      <div className="container-shell flex h-[86px] items-center justify-between gap-3 sm:gap-7">
        <Brand />
        <nav
          aria-label={t.common.nav}
          className="hidden items-center gap-7 lg:flex"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`nav-link ${pathname === href ? "is-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/request-service"
            className="button-primary hidden !px-5 !py-2.5 !text-xs md:inline-flex"
          >
            {t.common.request}
            <ArrowUpRight
              size={15}
              className="directional"
              aria-hidden="true"
            />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? t.common.menuClose : t.common.menuOpen}
            onClick={() => setOpen(!open)}
            className="icon-button lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <m.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            id="mobile-navigation"
            aria-label={t.common.mobileNav}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="container-shell flex flex-col gap-1 py-4">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === href ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${pathname === href ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/request-service"
                onClick={() => setOpen(false)}
                className="button-primary mt-2"
              >
                {t.common.request}
                <ArrowUpRight size={16} className="directional" />
              </Link>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
