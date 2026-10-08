"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Bot,
  HardDriveDownload,
  CheckCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useLocale } from "./providers";

export function SecurityTrustCenter() {
  const { t } = useLocale();
  const dict = t.trust;
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);

  const pillars = [
    {
      icon: Database,
      title: dict.badgeRls,
      desc: dict.badgeRlsDesc,
      details: dict.badgeRlsDetails,
    },
    {
      icon: Lock,
      title: dict.badgeCsp,
      desc: dict.badgeCspDesc,
      details: dict.badgeCspDetails,
    },
    {
      icon: Bot,
      title: dict.badgePrivacy,
      desc: dict.badgePrivacyDesc,
      details: dict.badgePrivacyDetails,
    },
    {
      icon: HardDriveDownload,
      title: dict.badgeLocal,
      desc: dict.badgeLocalDesc,
      details: dict.badgeLocalDetails,
    },
  ];

  return (
    <section
      aria-labelledby="trust-title"
      className="py-16 sm:py-24 bg-slate-50/50 border-y border-slate-100"
    >
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700">
            <ShieldCheck
              size={14}
              className="text-blue-600"
              aria-hidden="true"
            />
            <span>
              {dict.trustScore}: {dict.grade}
            </span>
          </div>
          <h2 id="trust-title" className="section-title mt-4">
            {dict.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {dict.intro}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isExpanded = expandedPillar === idx;
            return (
              <div
                key={idx}
                className="surface-card flex flex-col justify-between p-6 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedPillar(isExpanded ? null : idx)}
                    className="flex w-full items-center justify-between text-xs font-medium text-blue-600 hover:text-blue-800"
                    aria-expanded={isExpanded}
                  >
                    <span>
                      {isExpanded ? dict.hideDetails : dict.showDetails}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
                      <p>{pillar.details}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Compliance Footer Line */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-5 py-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle
              size={15}
              className="text-emerald-600"
              aria-hidden="true"
            />
            <span>{dict.rfcCompliance}</span>
          </div>
          <a
            href="/.well-known/security.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
          >
            <span>security.txt</span>
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
