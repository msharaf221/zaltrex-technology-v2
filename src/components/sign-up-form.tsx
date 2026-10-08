"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { signUp } from "@/app/actions";
import { initialFormState } from "@/lib/form-state";
import { FieldError, FormFeedback, SubmitLabel } from "./form-feedback";
import { useLocale } from "./providers";

export function SignUpForm({ enabled }: { enabled: boolean }) {
  const { t, locale } = useLocale();
  const [state, action, pending] = useActionState(signUp, initialFormState);
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") {
      // Small delay so user can read the success message
      const t = setTimeout(() => router.push("/request-service"), 2000);
      return () => clearTimeout(t);
    }
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
          {t.request.signup}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {t.request.signupIntro}
        </p>
      </div>
      <FormFeedback state={state} />
      <div>
        <label htmlFor="signup-name" className="field-label">
          {t.request.name}
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t.request.namePlaceholder}
          required
          maxLength={120}
          disabled={!enabled}
          className="field-input"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={
            state.fieldErrors?.name ? "signup-name-error" : undefined
          }
        />
        <FieldError id="signup-name-error" errors={state.fieldErrors?.name} />
      </div>
      <div>
        <label htmlFor="signup-email" className="field-label">
          {t.request.email}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="you@company.com"
          required
          maxLength={254}
          disabled={!enabled}
          className="field-input"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "signup-email-error" : undefined
          }
        />
        <FieldError id="signup-email-error" errors={state.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="signup-password" className="field-label">
          {t.request.password}
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t.request.passwordPlaceholder}
          required
          maxLength={128}
          minLength={6}
          disabled={!enabled}
          className="field-input"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "signup-password-error" : undefined
          }
        />
        <FieldError
          id="signup-password-error"
          errors={state.fieldErrors?.password}
        />
      </div>
      <button
        type="submit"
        disabled={!enabled || pending}
        className="button-primary w-full"
      >
        <SubmitLabel pending={pending}>
          {pending ? t.request.signingUp : t.request.signupButton}
        </SubmitLabel>
        {!pending && (
          <ArrowRight size={16} className="directional" aria-hidden="true" />
        )}
      </button>
      <Link
        href="/request-service"
        className="block text-center text-xs leading-6 text-slate-400 hover:text-blue-600"
      >
        {t.request.hasAccount}
      </Link>
    </form>
  );
}
