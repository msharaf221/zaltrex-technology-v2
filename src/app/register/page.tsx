import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SetupNotice } from "@/components/setup-notice";
import { SignUpForm } from "@/components/sign-up-form";
import { Reveal } from "@/components/reveal";
import { ChatTrigger } from "@/components/chat-trigger";
import { getCurrentUser, getActiveServices } from "@/lib/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getLocale } from "@/lib/locale-server";
import { dictionaries } from "@/lib/i18n";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: dictionaries[await getLocale()].common.request };
}

export default async function RegisterPage() {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const [user, { state }] = await Promise.all([
    getCurrentUser(),
    getActiveServices(),
  ]);

  if (user) {
    redirect("/request-service");
  }

  return (
    <div className="container-shell pb-20">
      <PageHeader
        label={t.request.signup}
        title={t.request.signupIntro}
        description=""
      />
      <SetupNotice state={state} />
      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <SignUpForm enabled={Boolean(getSupabaseEnv())} />
        </Reveal>
        <Reveal className="p-4 lg:p-8">
          <p className="eyebrow mb-7">{t.request.stepsTitle}</p>
          <ol className="space-y-4">
            {[t.request.signup, t.request.step2, t.request.step3].map(
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
    </div>
  );
}
