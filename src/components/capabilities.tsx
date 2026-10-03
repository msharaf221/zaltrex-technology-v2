"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Workflow,
  Sparkles,
  MousePointer2,
  MessageCircle,
} from "lucide-react";
import { useLocale } from "./providers";
import { Reveal } from "./reveal";

export function CapabilityVisual({
  type,
}: {
  type: "web" | "automation" | "ai";
}) {
  return (
    <div className="capability-visual" aria-hidden="true" dir="ltr">
      {type === "web" ? (
        <div className="visual-window">
          <div className="flex gap-1">
            <i className="size-1 rounded-full bg-blue-300" />
            <i className="size-1 rounded-full bg-slate-200" />
            <i className="size-1 rounded-full bg-slate-200" />
          </div>
          <div className="visual-window-blue">
            <div>
              <i />
              <i className="mt-1.5 !w-7 !bg-blue-200" />
            </div>
            <span className="ms-auto size-5 rounded-md bg-blue-300/70" />
          </div>
          <div className="visual-window-row">
            <i />
            <i />
            <i />
          </div>
          <MousePointer2
            size={13}
            className="absolute right-3 bottom-2 text-blue-500"
          />
        </div>
      ) : type === "automation" ? (
        <>
          <span className="visual-node">
            <Code2 size={16} />
          </span>
          <span className="visual-connector" />
          <span className="visual-node !bg-blue-600 !text-white">
            <Workflow size={17} />
          </span>
          <span className="visual-connector" />
          <span className="visual-node">
            <Sparkles size={16} />
          </span>
        </>
      ) : (
        <div className="relative flex items-center gap-3">
          <span className="visual-node !size-12 !rounded-[15px] !bg-blue-600 !text-white">
            <Sparkles size={23} strokeWidth={1.5} />
          </span>
          <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
            <MessageCircle size={14} className="mb-2 text-blue-500" />
            <span className="block h-1 w-20 rounded bg-blue-100" />
            <span className="mt-1.5 block h-1 w-14 rounded bg-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
}

export function Capabilities({
  showHeading = true,
  concepts = false,
}: {
  showHeading?: boolean;
  concepts?: boolean;
}) {
  const { t } = useLocale();
  const cards = [
    {
      type: "web",
      title: t.home.webTitle,
      desc: t.home.webDesc,
      tag: "01 / DIGITAL EXPERIENCES",
    },
    {
      type: "automation",
      title: t.home.autoTitle,
      desc: t.home.autoDesc,
      tag: "02 / CONNECTED SYSTEMS",
    },
    {
      type: "ai",
      title: t.home.aiTitle,
      desc: t.home.aiDesc,
      tag: "03 / HUMAN-CENTERED AI",
    },
  ] as const;
  return (
    <div>
      {showHeading && (
        <Reveal className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">{t.home.capabilitiesLabel}</p>
            <h2 className="section-title">{t.home.capabilitiesTitle}</h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-500">
              {t.home.capabilitiesIntro}
            </p>
          </div>
          <Link href="/solutions" className="text-link shrink-0 !text-xs">
            {t.home.explore}
            <ArrowUpRight size={15} className="directional" />
          </Link>
        </Reveal>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card, index) => (
          <Reveal key={card.type} delay={index * 0.07}>
            <article className="capability-card">
              <span
                className="mb-6 font-sans text-[8px] font-semibold tracking-[.12em] text-slate-400"
                dir="ltr"
              >
                {card.tag}
              </span>
              <CapabilityVisual type={card.type} />
              <h3 className="mt-6 text-lg leading-8 font-semibold tracking-tight text-slate-800">
                {card.title}
              </h3>
              <p className="mt-3 flex-1 text-xs leading-7 text-slate-500">
                {card.desc}
              </p>
              <Link
                href="/contact"
                className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600"
              >
                <span>{t.common.talk}</span>
                <ArrowRight size={14} className="directional" />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
      {concepts && (
        <p className="mt-4 text-xs leading-7 text-slate-400">
          {t.home.proposed}
        </p>
      )}
    </div>
  );
}
