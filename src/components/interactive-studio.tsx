"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  Code2,
  Workflow,
  Sparkles,
  Pause,
  Play,
  Check,
  MousePointer2,
} from "lucide-react";
import { useLocale, useMotionPreference } from "./providers";
import { ZMark } from "./brand";

export function InteractiveStudio() {
  const { t, locale } = useLocale();
  const { paused, toggle } = useMotionPreference();
  const [active, setActive] = useState<"web" | "automation" | "ai">("web");
  const tabs = [
    { id: "web", label: t.home.webTab, icon: Code2 },
    { id: "automation", label: t.home.autoTab, icon: Workflow },
    { id: "ai", label: t.home.aiTab, icon: Sparkles },
  ] as const;
  const label =
    active === "web"
      ? t.home.stageWeb
      : active === "automation"
        ? t.home.stageAuto
        : t.home.stageAi;
  return (
    <div className="studio-wrap" id="experience">
      <div className="studio-stage" data-mode={active} dir="ltr">
        <div className="stage-grid" />
        <div className="stage-glow" />
        <div className="stage-heading">
          <span>ZALTREX / DIGITAL PLAYGROUND</span>
          <button
            type="button"
            onClick={toggle}
            aria-label={paused ? t.common.resume : t.common.pause}
            aria-pressed={paused}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
        <div className="orbit">
          <div className="orbit-inner" />
        </div>
        <svg
          aria-hidden="true"
          fill="none"
          viewBox="0 0 480 440"
          preserveAspectRatio="none"
          className="stage-connectors absolute inset-0 h-full w-full"
        >
          <path
            d="M153 160C201 159 198 216 241 219M264 220C331 220 353 240 363 253M242 276C245 305 194 331 176 345"
            stroke="#587fd04d"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <circle cx="232" cy="112" r="2.5" fill="#6796f1" />
          <circle cx="373" cy="132" r="2" fill="#7fa5fb" />
          <circle cx="83" cy="282" r="2" fill="#4066a9" />
        </svg>
        <div className="stage-core" aria-hidden="true">
          {active === "web" ? (
            <ZMark />
          ) : active === "automation" ? (
            <Workflow strokeWidth={1.3} className="!size-16" />
          ) : (
            <Sparkles strokeWidth={1.3} className="!size-16" />
          )}
        </div>
        <div className="floating-card card-browser" aria-hidden="true">
          <div className="browser-dots">
            <i />
            <i />
            <i />
            <span className="ms-auto text-[6px] font-medium tracking-wider text-slate-400">
              YOUR NEXT IDEA
            </span>
          </div>
          <div className="browser-preview">
            <span className="mini-heading">
              {locale === "ar" ? "أهلًا." : "Hello."}
            </span>
            <div className="mt-2 h-[3px] w-12 rounded-full bg-blue-200" />
            <div className="mini-orb" />
          </div>
          <div className="browser-lines">
            <i />
            <i />
            <i />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[6px] text-slate-400">THOUGHTFULLY MADE</span>
            <MousePointer2 size={9} className="text-blue-500" />
          </div>
        </div>
        <div className="floating-card card-workflow" aria-hidden="true">
          <div className="flex items-center gap-2">
            <span className="workflow-dot">
              <Workflow size={12} />
            </span>
            <div>
              <span className="block text-[8px] text-white">
                {t.home.autoTab}
              </span>
              <span className="mt-0.5 block text-[6px] text-blue-200/50">
                CONNECTED BY DESIGN
              </span>
            </div>
          </div>
          <div className="workflow-path">
            <span />
            <i />
            <span />
            <i />
            <span />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[7px] text-blue-100/80">
            <Check size={9} />
            {t.home.flow2}
          </div>
        </div>
        <div
          className="floating-card card-assistant"
          dir={locale === "ar" ? "rtl" : "ltr"}
          aria-hidden="true"
        >
          <div className="flex items-center gap-2.5">
            <span className="assistant-mini-icon">
              <Sparkles size={13} />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold text-slate-700">
                {t.home.miniQuestion}
              </p>
              <p className="mt-1 text-[7px] text-slate-500">
                {t.home.miniAnswer}
              </p>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <span className="typing-dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
        <div className="stage-bottom">
          <span>{t.home.stageTag}</span>
          <span>01 / ZALTREX STUDIO</span>
        </div>
      </div>
      <div className="studio-tabs" role="tablist" aria-label={t.home.demo}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            id={`studio-tab-${id}`}
            key={id}
            role="tab"
            aria-selected={active === id}
            tabIndex={active === id ? 0 : -1}
            aria-controls="studio-description"
            onClick={() => setActive(id)}
            onKeyDown={(event) => {
              const current = tabs.findIndex((tab) => tab.id === id);
              const forward = locale === "ar" ? -1 : 1;
              let next: number;
              if (event.key === "ArrowRight")
                next = (current + forward + tabs.length) % tabs.length;
              else if (event.key === "ArrowLeft")
                next = (current - forward + tabs.length) % tabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = tabs.length - 1;
              else return;
              event.preventDefault();
              setActive(tabs[next].id);
              document.getElementById(`studio-tab-${tabs[next].id}`)?.focus();
            }}
            className={`studio-tab ${active === id ? "active" : ""}`}
          >
            <Icon size={13} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div
        id="studio-description"
        role="tabpanel"
        aria-labelledby={`studio-tab-${active}`}
        className="h-8 pt-2 text-center text-[10px] text-slate-600"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={active}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </m.p>
        </AnimatePresence>
      </div>
      <p className="studio-caption">{t.home.demoCaption}</p>
    </div>
  );
}
