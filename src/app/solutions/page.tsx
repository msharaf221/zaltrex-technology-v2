import type { Metadata } from "next";
import { Layers3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SetupNotice } from "@/components/setup-notice";
import { ServiceCard } from "@/components/service-card";
import { Capabilities } from "@/components/capabilities";
import { ChatTrigger } from "@/components/chat-trigger";
import { ProjectEstimator } from "@/components/project-estimator";
import { Reveal } from "@/components/reveal";
import { getActiveServices, getLocalizedSiteContent } from "@/lib/queries";
import { getLocale } from "@/lib/locale-server";
import { dictionaries } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: dictionaries[await getLocale()].common.solutions };
}
export default async function SolutionsPage() {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const [{ services, state }, content] = await Promise.all([
    getActiveServices(),
    getLocalizedSiteContent("solutions_intro", locale),
  ]);
  return (
    <div className="container-shell pb-20">
      <PageHeader
        label={t.solutions.label}
        title={t.solutions.title}
        description={content?.content_text.trim() || t.solutions.intro}
      />
      <SetupNotice state={state} />
      {services.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Reveal key={service.id}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      ) : (
        <>
          <p className="eyebrow mb-6">{t.solutions.examples}</p>
          <Capabilities showHeading={false} concepts />
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-dashed border-slate-200 p-6">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers3 size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                {t.solutions.emptyTitle}
              </h2>
              <p className="mt-2 text-xs leading-7 text-slate-500">
                {t.solutions.emptyDesc}
              </p>
            </div>
          </div>
        </>
      )}
      <div className="mt-14">
        <ProjectEstimator />
      </div>
      <div className="mt-10 flex flex-col justify-between gap-5 rounded-2xl bg-blue-50/75 px-7 py-7 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            {t.solutions.unsure}
          </h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            {t.solutions.unsureDesc}
          </p>
        </div>
        <ChatTrigger className="button-primary !text-xs" />
      </div>
    </div>
  );
}
