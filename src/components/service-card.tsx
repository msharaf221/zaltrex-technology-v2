"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Cloud,
  Code2,
  Cpu,
  Database,
  Layers3,
  Server,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/lib/database.types";
import { localizeService } from "@/lib/i18n";
import { useLocale } from "./providers";

const icons: Record<string, LucideIcon> = {
  Cloud,
  Code2,
  Cpu,
  Database,
  Layers3,
  Server,
  ShieldCheck,
  Workflow,
};
export function ServiceCard({ service: original }: { service: Service }) {
  const { locale, t } = useLocale();
  const service = localizeService(original, locale);
  const Icon = icons[service.icon_name] ?? Layers3;
  return (
    <article className="capability-card">
      <span className="mb-7 inline-flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={23} aria-hidden="true" />
      </span>
      <h2 className="text-xl leading-9 font-semibold tracking-tight text-slate-900">
        {service.title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-8 whitespace-pre-wrap text-slate-500">
        {service.description}
      </p>
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <span className="text-xs font-medium text-slate-500">
          {service.price === null
            ? t.common.customQuote
            : `${t.common.price}: ${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(service.price)}`}
        </span>
        <Link
          href={`/request-service?service=${encodeURIComponent(service.id)}`}
          className="text-link !text-xs"
        >
          {t.common.request}
          <span className="sr-only"> {service.title}</span>
          <ArrowUpRight size={15} className="directional" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
