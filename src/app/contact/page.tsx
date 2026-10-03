import type { Metadata } from "next";
import { MessageSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SetupNotice } from "@/components/setup-notice";
import { ContactForm } from "@/components/contact-form";
import { ChatTrigger } from "@/components/chat-trigger";
import { Reveal } from "@/components/reveal";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getLocalizedSiteContent } from "@/lib/queries";
import { getLocale } from "@/lib/locale-server";
import { dictionaries } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: dictionaries[await getLocale()].common.contact };
}
export default async function ContactPage() {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const configured = Boolean(getSupabaseEnv());
  const content = await getLocalizedSiteContent("contact_intro", locale);
  return (
    <div className="container-shell pb-20">
      <PageHeader
        label={t.contact.label}
        title={t.contact.title}
        description={content?.content_text.trim() || t.contact.intro}
      />
      <SetupNotice state={configured ? "ready" : "unconfigured"} />
      <div className="grid items-start gap-10 lg:grid-cols-[.8fr_1.4fr] lg:gap-16">
        <Reveal className="py-3">
          <span className="mb-7 inline-flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MessageSquare size={23} />
          </span>
          <h2 className="max-w-sm text-2xl leading-10 font-semibold tracking-tight">
            {t.contact.sideTitle}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-8 text-slate-500">
            {t.contact.sideDesc}
          </p>
          <div className="mt-9 max-w-sm rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <Sparkles size={19} className="mb-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-700">
              {t.contact.aiHint}
            </h3>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              {t.contact.aiHintDesc}
            </p>
            <ChatTrigger className="text-link mt-4 !text-xs" />
          </div>
        </Reveal>
        <Reveal>
          <ContactForm enabled={configured} />
        </Reveal>
      </div>
    </div>
  );
}
