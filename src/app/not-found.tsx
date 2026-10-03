import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

export default async function NotFound() {
  const t = dictionaries[await getLocale()];
  return (
    <div className="container-shell py-24">
      <p className="eyebrow mb-5">{t.errors.notFoundLabel}</p>
      <h1 className="page-title">{t.errors.notFoundTitle}</h1>
      <p className="mt-5 text-sm leading-8 text-slate-500">
        {t.errors.notFoundDesc}
      </p>
      <Link href="/" className="button-primary mt-8">
        <ArrowLeft size={15} className="directional" />
        {t.common.back}
      </Link>
    </div>
  );
}
