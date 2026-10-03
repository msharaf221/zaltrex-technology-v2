"use client";

import { CircleAlert } from "lucide-react";
import type { QueryState } from "@/lib/queries";
import { useLocale } from "./providers";

export function SetupNotice({ state }: { state: QueryState }) {
  const { t } = useLocale();
  if (state === "ready") return null;
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-6 text-blue-800"
    >
      <CircleAlert size={16} className="mt-1 shrink-0" aria-hidden="true" />
      <span>{state === "unconfigured" ? t.setup.preview : t.setup.error}</span>
    </div>
  );
}
