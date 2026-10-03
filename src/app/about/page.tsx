import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, Heart, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { InteractiveStudio } from "@/components/interactive-studio";
import { SecurityTrustCenter } from "@/components/security-trust-center";
import { getLocalizedSiteContent } from "@/lib/queries";
import { getLocale } from "@/lib/locale-server";
import { dictionaries } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: dictionaries[await getLocale()].common.about };
}
export default async function AboutPage() {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const content = await getLocalizedSiteContent("about_us", locale);
  return (
    <div className="container-shell pb-20">
      <PageHeader
        label={t.about.label}
        title={t.about.title}
        description={t.about.intro}
      />
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-5">{t.about.story}</p>
          <p className="text-base leading-9 whitespace-pre-wrap text-slate-600">
            {content?.content_text.trim() || t.about.storyDefault}
          </p>
          {content?.image_url && (
            <Image
              src={content.image_url}
              alt={t.about.label}
              width={960}
              height={540}
              className="mt-7 h-auto w-full rounded-2xl object-cover"
            />
          )}
          <Link href="/contact" className="text-link mt-7">
            {t.common.talk}
            <ArrowUpRight size={16} className="directional" />
          </Link>
        </Reveal>
        <Reveal>
          <InteractiveStudio />
        </Reveal>
      </div>
      <section className="mt-16 border-t border-slate-100 pt-12">
        <p className="eyebrow mb-7">{t.about.valuesLabel}</p>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { title: t.about.clarity, desc: t.about.clarityDesc, icon: Eye },
            { title: t.about.care, desc: t.about.careDesc, icon: Heart },
            {
              title: t.about.people,
              desc: t.about.peopleDesc,
              icon: UsersRound,
            },
          ].map(({ title, desc, icon: Icon }) => (
            <Reveal key={title} className="surface-card p-7">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={19} />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <div className="mt-16">
        <SecurityTrustCenter />
      </div>
    </div>
  );
}
