"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { signIn } from "@/app/actions";
import { initialFormState } from "@/lib/form-state";
import { FieldError, FormFeedback, SubmitLabel } from "./form-feedback";
import { useLocale } from "./providers";

export function SignInForm({ enabled }: { enabled: boolean }) {
  const { t, locale } = useLocale();
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state.status, router]);
  return (
    <form
      action={action}
      className="surface-card max-w-xl space-y-5 p-6 sm:p-8"
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="mb-7">
        <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LockKeyhole size={21} />
        </span>
        <h2 className="text-2xl leading-9 font-semibold tracking-tight text-slate-900">
          {t.request.signin}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {t.request.signinIntro}
        </p>
      </div>
      <FormFeedback state={state} />
      <div>
        <label htmlFor="signin-email" className="field-label">
          {t.request.email}
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="username"
          placeholder="you@company.com"
          required
          maxLength={254}
          disabled={!enabled}
          className="field-input"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "signin-email-error" : undefined
          }
        />
        <FieldError id="signin-email-error" errors={state.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="signin-password" className="field-label">
          {t.request.password}
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t.request.passwordPlaceholder}
          required
          maxLength={128}
          disabled={!enabled}
          className="field-input"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "signin-password-error" : undefined
          }
        />
        <FieldError
          id="signin-password-error"
          errors={state.fieldErrors?.password}
        />
      </div>
      <button
        type="submit"
        disabled={!enabled || pending}
        className="button-primary w-full"
      >
        <SubmitLabel pending={pending}>
          {pending ? t.request.signing : t.request.signinButton}
        </SubmitLabel>
        {!pending && (
          <ArrowRight size={16} className="directional" aria-hidden="true" />
        )}
      </button>
      <Link
        href="/contact"
        className="block text-center text-xs leading-6 text-slate-400 hover:text-blue-600"
      >
        {t.request.noAccount}
      </Link>
    </form>
  );
}
