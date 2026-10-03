"use client";

import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";
import { submitServiceRequest } from "@/app/actions";
import type { Service } from "@/lib/database.types";
import { initialFormState } from "@/lib/form-state";
import { FieldError, FormFeedback, SubmitLabel } from "./form-feedback";
import { useLocale } from "./providers";
import { localizeService } from "@/lib/i18n";

export function ServiceRequestForm({
  services,
  selectedService,
}: {
  services: Service[];
  selectedService?: string;
}) {
  const { t, locale } = useLocale();
  const [state, action, pending] = useActionState(
    submitServiceRequest,
    initialFormState,
  );
  const enabled = services.length > 0;
  return (
    <form action={action} className="surface-card space-y-6 p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {t.request.formTitle}
        </h2>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          {t.request.formHint}
        </p>
      </div>
      <FormFeedback state={state} />
      {!enabled && (
        <p
          role="status"
          className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-500"
        >
          {t.request.noServices}
        </p>
      )}
      <div>
        <label htmlFor="requested-service" className="field-label">
          {t.request.solution}
        </label>
        <select
          id="requested-service"
          name="service_id"
          required
          defaultValue={state.values?.service_id ?? selectedService ?? ""}
          disabled={!enabled}
          className="field-input"
          aria-invalid={Boolean(state.fieldErrors?.service_id)}
          aria-describedby={
            state.fieldErrors?.service_id ? "service-error" : undefined
          }
        >
          <option value="" disabled>
            {t.request.choose}
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {localizeService(service, locale).title}
            </option>
          ))}
        </select>
        <FieldError id="service-error" errors={state.fieldErrors?.service_id} />
      </div>
      <div>
        <label htmlFor="requirements" className="field-label">
          {t.request.requirements}
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={6}
          required
          maxLength={10000}
          disabled={!enabled}
          defaultValue={state.values?.requirements ?? ""}
          placeholder={t.request.requirementsPlaceholder}
          className="field-input resize-y"
          aria-invalid={Boolean(state.fieldErrors?.requirements)}
          aria-describedby={
            state.fieldErrors?.requirements
              ? "requirements-error"
              : "requirements-hint"
          }
        />
        <FieldError
          id="requirements-error"
          errors={state.fieldErrors?.requirements}
        />
        <p
          id="requirements-hint"
          className="mt-2 text-xs leading-6 text-slate-400"
        >
          {t.request.sensitive}
        </p>
      </div>
      <button
        type="submit"
        disabled={!enabled || pending}
        className="button-primary"
      >
        <SubmitLabel pending={pending}>
          {pending ? t.request.submitting : t.request.submit}
        </SubmitLabel>
        {!pending && (
          <ArrowUpRight size={16} className="directional" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
