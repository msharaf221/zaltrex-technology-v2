"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  RotateCcw,
  Check,
  Copy,
} from "lucide-react";
import { useLocale } from "./providers";

type SolutionKey = "web" | "auto" | "ai";
type FeatureKey = "bilingual" | "auth" | "cms" | "api" | "speed";
type TimelineKey = "agile" | "standard" | "enterprise";

export function ProjectEstimator() {
  const { t, locale } = useLocale();
  const dict = t.estimator;

  const [solution, setSolution] = useState<SolutionKey>("web");
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([
    "bilingual",
    "speed",
  ]);
  const [timeline, setTimeline] = useState<TimelineKey>("standard");
  const [copied, setCopied] = useState(false);

  const toggleFeature = (feature: FeatureKey) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };

  const handleReset = () => {
    setSolution("web");
    setSelectedFeatures(["bilingual", "speed"]);
    setTimeline("standard");
  };

  // Calculate estimated complexity and timeline
  const featureCount = selectedFeatures.length;
  const isHighComplexity =
    solution === "ai" || featureCount >= 4 || timeline === "enterprise";
  const isMediumComplexity =
    !isHighComplexity && (solution === "auto" || featureCount >= 2);

  const complexityLabel = isHighComplexity
    ? dict.complexityHigh
    : isMediumComplexity
      ? dict.complexityMed
      : dict.complexityLow;

  const complexityColor = isHighComplexity
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : isMediumComplexity
      ? "text-blue-600 bg-blue-50 border-blue-200"
      : "text-emerald-600 bg-emerald-50 border-emerald-200";

  const durationLabel = dict.timelines[timeline];

  const solutionName = dict.types[solution].title;
  const featureNames = selectedFeatures.map((f) => dict.features[f]).join(", ");

  const generatedBrief = `${solutionName} | ${featureNames} | ${durationLabel} | ${complexityLabel}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedBrief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <section aria-labelledby="estimator-title" className="py-16 sm:py-24">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Calculator size={14} aria-hidden="true" />
            {dict.label}
          </p>
          <h2 id="estimator-title" className="section-title mt-3">
            {dict.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {dict.intro}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <div className="space-y-8 lg:col-span-7">
            {/* Step 1: Solution Type */}
            <div className="surface-card p-6 sm:p-7">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 uppercase">
                <Layers size={16} className="text-blue-600" aria-hidden="true" />
                {dict.step1Title}
              </h3>
              <div
                role="radiogroup"
                aria-label={dict.step1Title}
                className="mt-4 grid gap-3 sm:grid-cols-3"
              >
                {(["web", "auto", "ai"] as const).map((key) => {
                  const active = solution === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSolution(key)}
                      className={`flex flex-col justify-between rounded-xl border p-4 text-start transition-all ${
                        active
                          ? "border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          {dict.types[key].title}
                        </span>
                        {active && (
                          <CheckCircle2
                            size={16}
                            className="text-blue-600"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        {dict.types[key].desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Features */}
            <div className="surface-card p-6 sm:p-7">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 uppercase">
                <Cpu size={16} className="text-blue-600" aria-hidden="true" />
                {dict.step2Title}
              </h3>
              <div
                role="group"
                aria-label={dict.step2Title}
                className="mt-4 grid gap-2.5 sm:grid-cols-2"
              >
                {(
                  ["bilingual", "speed", "auth", "cms", "api"] as const
                ).map((feature) => {
                  const checked = selectedFeatures.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleFeature(feature)}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 text-start transition-all ${
                        checked
                          ? "border-blue-500 bg-blue-50/40 text-slate-900"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded-md border text-white transition-colors ${
                          checked
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {checked && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                      </div>
                      <span className="text-xs font-medium">
                        {dict.features[feature]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Timeline */}
            <div className="surface-card p-6 sm:p-7">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 uppercase">
                <Clock size={16} className="text-blue-600" aria-hidden="true" />
                {dict.step3Title}
              </h3>
              <div
                role="radiogroup"
                aria-label={dict.step3Title}
                className="mt-4 grid gap-3 sm:grid-cols-3"
              >
                {(["agile", "standard", "enterprise"] as const).map((time) => {
                  const active = timeline === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setTimeline(time)}
                      className={`rounded-xl border p-3.5 text-center text-xs font-semibold transition-all ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {dict.timelines[time]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 surface-card overflow-hidden border-blue-100 bg-gradient-to-b from-white to-blue-50/30 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {dict.summaryTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                  title={dict.reset}
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  <span>{dict.reset}</span>
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {/* Solution Summary */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase">
                    {dict.step1Title}
                  </span>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {solutionName}
                  </p>
                </div>

                {/* Features Pill Box */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase">
                    {dict.step2Title}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedFeatures.map((f) => (
                      <span
                        key={f}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                      >
                        {dict.features[f]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Complexity & Timeline Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {dict.estimatedDuration}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-slate-800">
                      {durationLabel}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {dict.complexity}
                    </span>
                    <span
                      className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${complexityColor}`}
                    >
                      {complexityLabel}
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="space-y-2.5 pt-4">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(
                      `${solutionName} (${locale === "ar" ? "نطاق مقترح" : "Estimated Scope"})`,
                    )}`}
                    className="button-primary w-full shadow-md"
                  >
                    <span>{dict.transferButton}</span>
                    <ArrowUpRight size={16} className="directional" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="button-secondary w-full text-xs"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-600" aria-hidden="true" />
                        <span className="text-emerald-700">{dict.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} aria-hidden="true" />
                        <span>{locale === "ar" ? "نسخ الملخص" : "Copy Brief"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
