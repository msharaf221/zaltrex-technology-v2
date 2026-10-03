"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Layers3,
  Globe2,
  MousePointer2,
  Sparkles,
  Code2,
  Database,
  Zap,
  Plus,
  Minus,
  CircleCheck,
  MessageCircle,
} from "lucide-react";
import { useLocale } from "./providers";
import { Reveal } from "./reveal";
import { InteractiveStudio } from "./interactive-studio";
import { Capabilities } from "./capabilities";
import { ChatTrigger } from "./chat-trigger";
import { CaseStudiesShowcase } from "./case-studies";
import { ProjectEstimator } from "./project-estimator";
import { SecurityTrustCenter } from "./security-trust-center";

export function LandingPage({
  heroTitle,
  heroIntro,
}: {
  heroTitle?: string;
  heroIntro?: string;
}) {
  const { t, isArabic } = useLocale();
  const [faq, setFaq] = useState<number | null>(0);
  const questions = [
    { q: t.home.faq1, a: t.home.faq1Answer },
    { q: t.home.faq2, a: t.home.faq2Answer },
    { q: t.home.faq3, a: t.home.faq3Answer },
  ];
  return (
    <>
      <section className={`hero-section ${isArabic ? "hero-ar" : ""}`}>
        <div className="container-shell">
          <div className="grid items-center gap-12 pt-12 pb-10 sm:pt-16 lg:grid-cols-[1.06fr_1fr] lg:gap-16 lg:pt-16 lg:pb-12">
            <Reveal className="hero-copy">
              <p className="hero-pill">{t.home.eyebrow}</p>
              <h1 className="hero-title">
                {heroTitle || (
                  <>
                    {t.home.title1} <br />
                    <span className="accent">{t.home.title2}</span>
                  </>
                )}
              </h1>
              <p className="hero-intro">{heroIntro || t.home.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/request-service" className="button-primary">
                  {t.home.cta}
                  <ArrowUpRight size={17} className="directional" />
                </Link>
                <a href="#experience" className="button-secondary !bg-white/70">
                  <Layers3 size={16} />
                  {t.home.demo}
                </a>
              </div>
              <div className="hero-benefits">
                <span>
                  <Globe2 size={12} />
                  {t.home.bilingual}
                </span>
                <span>
                  <MousePointer2 size={12} />
                  {t.home.simple}
                </span>
                <span>
                  <Sparkles size={12} />
                  {t.home.smart}
                </span>
              </div>
              <p className="mt-7 max-w-sm text-[10px] leading-6 text-slate-400">
                {t.home.note}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <InteractiveStudio />
            </Reveal>
          </div>
          <div className="tech-ribbon">
            <span className="text-[10px] text-slate-400">
              {t.home.builtWith}
            </span>
            <div className="tech-stack" dir="ltr">
              <span>
                <Code2 size={15} />
                Next.js
              </span>
              <span>
                <Database size={14} />
                Supabase
              </span>
              <span>
                <Sparkles size={14} />
                Gemini AI
              </span>
              <span>
                <Zap size={14} />
                Thoughtful motion
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="container-shell py-16 sm:py-20">
        <Capabilities />
      </section>
      <section className="bento-section py-16 sm:py-20">
        <div className="container-shell">
          <Reveal className="mb-10 max-w-xl">
            <p className="eyebrow mb-4">{t.home.bentoLabel}</p>
            <h2 className="section-title">{t.home.bentoTitle}</h2>
            <p className="mt-5 text-sm leading-8 text-slate-500">
              {t.home.bentoIntro}
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
            <Reveal className="bento-card p-7 sm:p-8">
              <span className="mb-6 inline-flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Layers3 size={20} />
              </span>
              <h3 className="text-xl leading-8 font-semibold tracking-tight">
                {t.home.flowTitle}
              </h3>
              <p className="mt-3 max-w-md text-xs leading-7 text-slate-500">
                {t.home.flowDesc}
              </p>
              <div className="flow-demo mt-8">
                <p className="mb-4 text-[8px] text-slate-400">
                  {t.home.concept}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flow-chip">
                    <MessageCircle size={13} />
                    {t.home.flow1}
                  </div>
                  <ArrowRight
                    size={13}
                    className="directional hidden text-slate-300 sm:block"
                  />
                  <div className="flow-chip active">
                    <Layers3 size={13} />
                    {t.home.flow2}
                  </div>
                  <ArrowRight
                    size={13}
                    className="directional hidden text-slate-300 sm:block"
                  />
                  <div className="flow-chip">
                    <CircleCheck size={13} />
                    {t.home.flow3}
                  </div>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5">
              <Reveal delay={0.06} className="bento-card bento-card-blue p-7">
                <div className="bento-orbs" />
                <div className="relative flex items-start gap-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                    <MousePointer2 size={19} />
                  </span>
                  <div>
                    <h3 className="text-lg leading-7 font-semibold">
                      {t.home.motionTitle}
                    </h3>
                    <p className="mt-3 text-xs leading-7 text-blue-100/75">
                      {t.home.motionDesc}
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1} className="bento-card p-7">
                <div className="flex items-start gap-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Globe2 size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg leading-7 font-semibold">
                      {t.home.langTitle}
                    </h3>
                    <p className="mt-3 text-xs leading-7 text-slate-500">
                      {t.home.langDesc}
                    </p>
                    <div
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-[9px] text-slate-500"
                      dir="ltr"
                    >
                      <span>EN</span>
                      <span className="h-3 border-l border-slate-200" />
                      <span lang="ar">عربي</span>
                      <ArrowRight size={10} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
      <section className="container-shell py-16 sm:py-20">
        <Reveal className="mb-12 max-w-2xl">
          <p className="eyebrow mb-4">{t.home.processLabel}</p>
          <h2 className="section-title">{t.home.processTitle}</h2>
        </Reveal>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { title: t.home.step1, desc: t.home.step1Desc },
            { title: t.home.step2, desc: t.home.step2Desc },
            { title: t.home.step3, desc: t.home.step3Desc },
          ].map((step, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <article className="process-card">
                <span
                  className="mb-5 block font-sans text-[10px] font-semibold text-blue-500"
                  dir="ltr"
                >
                  0{i + 1}
                </span>
                <h3 className="text-lg leading-8 font-semibold tracking-tight text-slate-800">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-xs leading-7 text-slate-500">
                  {step.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <CaseStudiesShowcase />
      <ProjectEstimator />
      <section className="container-shell pb-16 sm:pb-20">
        <Reveal className="assistant-section grid items-center gap-10 p-8 sm:p-12 md:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="eyebrow mb-5 !text-blue-300">
              {t.home.assistantLabel}
            </p>
            <h2 className="max-w-xl text-3xl leading-[1.45] font-semibold tracking-tight sm:text-[37px]">
              {t.home.assistantTitle}
            </h2>
            <p className="mt-5 max-w-lg text-xs leading-8 text-slate-400">
              {t.home.assistantIntro}
            </p>
            <ChatTrigger
              label={t.home.assistantButton}
              className="button-secondary mt-7 !border-white/20 !bg-white !text-slate-900"
            />
            <p className="mt-4 text-[9px] text-slate-500">
              {t.home.assistantNote}
            </p>
          </div>
          <div
            className="hidden flex-col items-center gap-10 py-8 md:flex"
            aria-hidden="true"
          >
            <span className="assistant-orb">
              <Sparkles size={47} strokeWidth={1.1} />
            </span>
            <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[10px] text-slate-400">
              {t.home.miniQuestion}
              <span className="ms-6 text-blue-300">↗</span>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="container-shell pb-16 sm:pb-20">
        <div className="grid gap-8 md:grid-cols-[.85fr_1.4fr] md:gap-16">
          <Reveal>
            <p className="eyebrow mb-4">{t.home.faqLabel}</p>
            <h2 className="section-title max-w-md">{t.home.faqTitle}</h2>
            <Link href="/contact" className="text-link mt-7 !text-xs">
              {t.common.talk}
              <ArrowUpRight size={14} className="directional" />
            </Link>
          </Reveal>
          <Reveal>
            {questions.map(({ q, a }, index) => (
              <div key={q} className="faq-item">
                <button
                  type="button"
                  className="faq-button"
                  aria-expanded={faq === index}
                  aria-controls={`faq-${index}`}
                  onClick={() => setFaq(faq === index ? null : index)}
                >
                  {q}
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${faq === index ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}
                  >
                    {faq === index ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {faq === index && (
                    <m.div
                      id={`faq-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pe-9 text-xs leading-8 text-slate-500">
                        {a}
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <SecurityTrustCenter />
    </>
  );
}
