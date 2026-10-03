"use client";

import { useActionState, useRef } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { submitContact } from "@/app/actions";
import { initialFormState } from "@/lib/form-state";
import { FieldError, FormFeedback, SubmitLabel } from "./form-feedback";
import { useLocale } from "./providers";

export function ContactForm({ enabled }: { enabled: boolean }) {
  const { t, locale } = useLocale();
  const renderTsRef = useRef<number | null>(null);

  const [state, formAction, pending] = useActionState(
    submitContact,
    initialFormState,
  );
  const errors = state.fieldErrors;

  const handleFocus = () => {
    if (renderTsRef.current === null) {
      renderTsRef.current = Date.now();
    }
  };

  const handleSubmitAction = (formData: FormData) => {
    if (renderTsRef.current !== null) {
      formData.set("_render_ts", renderTsRef.current.toString());
    }
    return formAction(formData);
  };

  return (
    <form
      action={handleSubmitAction}
      onFocusCapture={handleFocus}
      className="surface-card space-y-5 p-6 sm:p-8"
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="mb-7">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {t.contact.formTitle}
        </h2>
        <p className="mt-2 text-xs text-slate-400">{t.contact.formHint}</p>
      </div>
      <FormFeedback state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            {t.contact.name}
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder={t.contact.namePlaceholder}
            required
            maxLength={120}
            disabled={!enabled}
            defaultValue={state.values?.name ?? ""}
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={errors?.name ? "name-error" : undefined}
            className="field-input"
          />
          <FieldError id="name-error" errors={errors?.name} />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            {t.contact.email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder="you@company.com"
            required
            maxLength={254}
            disabled={!enabled}
            defaultValue={state.values?.email ?? ""}
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? "email-error" : undefined}
            className="field-input"
          />
          <FieldError id="email-error" errors={errors?.email} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="field-label">
          {t.contact.subject}
        </label>
        <input
          id="contact-subject"
          name="subject"
          placeholder={t.contact.subjectPlaceholder}
          required
          maxLength={160}
          disabled={!enabled}
          defaultValue={state.values?.subject ?? ""}
          aria-invalid={Boolean(errors?.subject)}
          aria-describedby={errors?.subject ? "subject-error" : undefined}
          className="field-input"
        />
        <FieldError id="subject-error" errors={errors?.subject} />
      </div>
      <div>
        <label htmlFor="contact-message" className="field-label">
          {t.contact.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder={t.contact.messagePlaceholder}
          required
          maxLength={10000}
          disabled={!enabled}
          defaultValue={state.values?.message ?? ""}
          aria-invalid={Boolean(errors?.message)}
          aria-describedby={errors?.message ? "message-error" : undefined}
          className="field-input min-h-36 resize-y"
        />
        <FieldError id="message-error" errors={errors?.message} />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company-website">Leave this empty</label>
        <input
          id="company-website"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <LockKeyhole size={12} aria-hidden="true" />
          {t.contact.private}
        </p>
        <button
          type="submit"
          disabled={!enabled || pending}
          className="button-primary"
        >
          <SubmitLabel pending={pending}>
            {pending ? t.contact.sending : t.contact.send}
          </SubmitLabel>
          {!pending && (
            <ArrowUpRight
              size={16}
              className="directional"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </form>
  );
}
