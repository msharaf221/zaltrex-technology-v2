"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLocale } from "./providers";

export function openChat() {
  window.dispatchEvent(new Event("zaltrex:open-chat"));
}

export function ChatTrigger({
  label,
  className = "button-primary",
  arrow = true,
}: {
  label?: string;
  className?: string;
  arrow?: boolean;
}) {
  const { t } = useLocale();
  return (
    <button type="button" onClick={openChat} className={className}>
      <Sparkles size={17} aria-hidden="true" />
      {label ?? t.common.ask}
      {arrow && (
        <ArrowUpRight size={16} className="directional" aria-hidden="true" />
      )}
    </button>
  );
}
