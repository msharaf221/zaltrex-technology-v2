import type { Metadata } from "next";
import { Check, LogOut, ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SetupNotice } from "@/components/setup-notice";
import { SignInForm } from "@/components/sign-in-form";
import { ServiceRequestForm } from "@/components/service-request-form";
import { Reveal } from "@/components/reveal";
import { ChatTrigger } from "@/components/chat-trigger";
import {
  getActiveServices,
  getCurrentUser,
  getOwnRequests,
  getLocalizedSiteContent,
} from "@/lib/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getLocale } from "@/lib/locale-server";
import { dictionaries, localizeService } from "@/lib/i18n";
import { signOut } from "@/app/actions";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: dictionaries[await getLocale()].common.request };
}
export default async function RequestServicePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const [user, { services, state }, content, params] = await Promise.all([
    getCurrentUser(),
    getActiveServices(),
    getLocalizedSiteContent("request_service_intro", locale),
    searchParams,
  ]);
  const selected = services.some((item) => item.id === params.service)
    ? params.service
    : undefined;
  const ownRequests = user
    ? await getOwnRequests(user.id)
    : { requests: [], error: false };
  return (
    <div className="container-shell pb-20">
      <PageHeader
        label={t.request.label}
        title={t.request.title}
        description={content?.content_text.trim() || t.request.intro}
      />
      <SetupNotice state={state} />
      {!user ? (
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <SignInForm enabled={Boolean(getSupabaseEnv())} />
          </Reveal>
          <Reveal className="p-4 lg:p-8">
            <p className="eyebrow mb-7">{t.request.stepsTitle}</p>
            <ol className="space-y-4">
              {[t.request.step1, t.request.step2, t.request.step3].map(
                (step, i) => (
                  <li key={step}>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-semibold text-blue-600">
                        0{i + 1}
                      </span>
                      {step}
                    </div>
                    {i < 2 && (
                      <ArrowDown
                        size={12}
                        className="ms-3.5 mt-4 text-blue-200"
                      />
                    )}
                  </li>
                ),
              )}
            </ol>
            <div className="mt-9 border-t border-slate-100 pt-6">
              <ChatTrigger className="text-link !text-xs" />
            </div>
          </Reveal>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-slate-500">
                <Check size={14} className="text-blue-600" />
                {t.request.signedAs} <bdi>{user.email ?? "client"}</bdi>
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-sm text-slate-500 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <LogOut size={12} />
                  {t.request.signout}
                </button>
              </form>
            </div>
            <ServiceRequestForm
              services={services}
              selectedService={selected}
            />
          </div>
          <aside className="surface-card p-6 lg:mt-9">
            <h2 className="text-sm font-semibold">{t.request.recent}</h2>
            {ownRequests.error ? (
              <p
                role="status"
                className="mt-4 text-xs leading-7 text-slate-500"
              >
                {t.request.recentError}
              </p>
            ) : ownRequests.requests.length === 0 ? (
              <p className="mt-4 text-xs leading-7 text-slate-500">
                {t.request.recentEmpty}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {ownRequests.requests.map((request) => (
                  <li key={request.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs leading-6 font-medium text-slate-700">
                        {services.find(
                          (service) => service.id === request.service_id,
                        )
                          ? localizeService(
                              services.find(
                                (service) => service.id === request.service_id,
                              )!,
                              locale,
                            ).title
                          : t.request.genericService}
                      </h3>
                      <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[10px] leading-5 font-medium text-blue-700">
                        {t.request[request.status]}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">
                      {request.requirements}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      {new Intl.DateTimeFormat(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      }).format(new Date(request.created_at))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
