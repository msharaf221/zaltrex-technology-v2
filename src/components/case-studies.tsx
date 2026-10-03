"use client";

import { useState } from "react";
import {
  Briefcase,
  Globe,
  Workflow,
  Sparkles,
  Code2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useLocale } from "./providers";

type StudyKey = "study1" | "study2" | "study3";
type TabKey = "challenge" | "solution" | "architecture";

export function CaseStudiesShowcase() {
  const { t } = useLocale();
  const dict = t.caseStudies;

  const [activeStudy, setActiveStudy] = useState<StudyKey>("study1");
  const [activeTab, setActiveTab] = useState<TabKey>("solution");

  const studies: { key: StudyKey; icon: typeof Globe; tag: string }[] = [
    { key: "study1", icon: Globe, tag: dict.study1.tag },
    { key: "study2", icon: Workflow, tag: dict.study2.tag },
    { key: "study3", icon: Sparkles, tag: dict.study3.tag },
  ];

  const current = dict[activeStudy];

  return (
    <section aria-labelledby="case-studies-title" className="py-16 sm:py-24">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Briefcase size={14} aria-hidden="true" />
            {dict.label}
          </p>
          <h2 id="case-studies-title" className="section-title mt-3">
            {dict.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {dict.intro}
          </p>
        </div>

        {/* Study Navigation Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {studies.map((item) => {
            const Icon = item.icon;
            const active = activeStudy === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveStudy(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{dict[item.key].title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Study Content Card */}
        <div className="mt-8 surface-card overflow-hidden border-slate-200/90 shadow-sm">
          {/* Card Header with Study Tag & Title */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-md bg-blue-100/70 px-2.5 py-1 text-[11px] font-semibold text-blue-800">
                  {current.tag}
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                  {current.title}
                </h3>
              </div>

              {/* Sub-tab Switcher (Challenge / Solution / Architecture) */}
              <div
                role="tablist"
                className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
              >
                {(["challenge", "solution", "architecture"] as const).map((tab) => {
                  const active = activeTab === tab;
                  const label =
                    tab === "challenge"
                      ? dict.tabChallenge
                      : tab === "solution"
                        ? dict.tabSolution
                        : dict.tabArchitecture;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Panel Body */}
          <div className="p-6 sm:p-8">
            {activeTab === "challenge" && (
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertCircle size={20} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {dict.tabChallenge}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {current.challenge}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "solution" && (
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={20} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {dict.tabSolution}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {current.solution}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "architecture" && (
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Code2 size={20} aria-hidden="true" />
                </div>
                <div className="w-full">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {dict.tabArchitecture}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {current.architecture}
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-900 p-4 text-xs font-mono text-emerald-400">
                    <code>
                      {`✓ Zero Cumulative Layout Shift (CLS < 0.01)\n✓ Sub-100ms TTFB on Edge Runtime\n✓ ISO/IEC 27001 & OWASP Top-10 Compliant Hardening`}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
