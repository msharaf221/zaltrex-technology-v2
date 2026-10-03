"use client";
import { useLocale } from "@/components/providers";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();
  return (
    <div className="container-shell py-24">
      <p className="eyebrow mb-5">{t.errors.errorLabel}</p>
      <h1 className="page-title">{t.errors.errorTitle}</h1>
      <p className="mt-5 text-sm leading-8 text-slate-500">
        {t.errors.errorDesc}
      </p>
      <button type="button" onClick={reset} className="button-primary mt-8">
        {t.errors.retry}
      </button>
    </div>
  );
}
