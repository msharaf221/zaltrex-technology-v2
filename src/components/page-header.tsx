"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "./providers";
import { Reveal } from "./reveal";

export function PageHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  const { t } = useLocale();
  return (
    <Reveal className="max-w-3xl pt-10 pb-10 sm:pt-14 sm:pb-12">
      <Link
        href="/"
        className="quiet-link mb-9 inline-flex items-center gap-2 !text-xs"
      >
        <ArrowLeft size={13} className="directional" />
        {t.common.back}
      </Link>
      <p className="eyebrow mb-5">{label}</p>
      <h1 className="page-title">{title}</h1>
      <p className="mt-6 max-w-2xl text-[15px] leading-8 text-slate-500">
        {description}
      </p>
    </Reveal>
  );
}
