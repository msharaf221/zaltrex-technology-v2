"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  LoaderCircle,
  ArrowUpRight,
  CircleAlert,
} from "lucide-react";
import { useLocale } from "./providers";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  failed?: boolean;
};

export function ChatWidget() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ text: string; code: string } | null>(
    null,
  );
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const listener = () => setOpen(true);
    window.addEventListener("zaltrex:open-chat", listener);
    return () => {
      window.removeEventListener("zaltrex:open-chat", listener);
      abortRef.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      180,
    );
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  useEffect(() => {
    if (open && logRef.current)
      logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [open, messages, pending, error]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending || content.length > 2000) return;
    const history = messages.filter((message) => !message.failed);
    const user: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: content,
    };
    const next = [...history, user];
    setMessages(next);
    setInput("");
    setError(null);
    setPending(true);
    // Keep at most four previous exchanges and enforce the server's context budget.
    let context = next.slice(-9).map((message) => ({
      role: message.role === "user" ? ("user" as const) : ("model" as const),
      text: message.text.slice(0, 2000),
    }));
    while (context[0]?.role === "model") context = context.slice(1);
    while (
      context.length > 1 &&
      context.reduce((total, message) => total + message.text.length, 0) > 8000
    )
      context = context.slice(2);
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 42000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ locale, messages: context }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string") {
        setMessages((items) =>
          items.map((item) =>
            item.id === user.id ? { ...item, failed: true } : item,
          ),
        );
        const code = typeof data.code === "string" ? data.code : "error";
        const text =
          code === "limited"
            ? t.chat.limited
            : code === "invalid"
              ? t.chat.invalid
              : code === "unconfigured"
                ? t.chat.unconfigured
              : code === "unavailable"
                ? t.chat.unavailable
                : t.chat.error;
        setError({ text, code });
        return;
      }
      setMessages((items) => [
        ...items,
        { id: crypto.randomUUID(), role: "assistant", text: data.reply },
      ]);
    } catch {
      setMessages((items) =>
        items.map((item) =>
          item.id === user.id ? { ...item, failed: true } : item,
        ),
      );
      setError({ text: t.chat.error, code: "error" });
    } finally {
      clearTimeout(timeout);
      setPending(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <m.section
            id="zaltrex-chat"
            role="dialog"
            aria-modal="false"
            aria-label={t.chat.label}
            className="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <header className="chat-header">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-500/15 text-blue-200">
                  <Sparkles size={21} strokeWidth={1.6} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">{t.chat.title}</h2>
                  <p className="mt-1 text-[9px] text-blue-100/50">
                    {t.chat.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={t.chat.clear}
                  disabled={pending}
                  onClick={() => {
                    setMessages([]);
                    setError(null);
                    setInput("");
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300 disabled:opacity-30"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  aria-label={t.chat.close}
                  onClick={() => {
                    setOpen(false);
                    launcherRef.current?.focus({ preventScroll: true });
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
                >
                  <X size={17} />
                </button>
              </div>
            </header>
            <div
              ref={logRef}
              className="chat-log"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
            >
              <div className="chat-message assistant">{t.chat.greeting}</div>
              {messages.length === 0 && (
                <div className="mb-5 grid gap-2">
                  {[t.chat.prompt1, t.chat.prompt2, t.chat.prompt3].map(
                    (prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => send(prompt)}
                        className="chat-prompt"
                      >
                        {prompt}
                        <ArrowUpRight
                          size={10}
                          className="directional ms-2 inline"
                        />
                      </button>
                    ),
                  )}
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id}>
                  <div className={`chat-message ${message.role}`}>
                    {message.text}
                  </div>
                  {message.failed && (
                    <p className="mb-3 -mt-1 text-end text-[9px] text-slate-400">
                      {t.chat.failed}
                    </p>
                  )}
                </div>
              ))}
              {pending && (
                <div className="chat-message assistant flex items-center gap-2.5">
                  <span className="typing-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t.chat.thinking}
                  </span>
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5 text-[11px] leading-7 text-amber-900"
                >
                  <div className="flex gap-2">
                    <CircleAlert size={14} className="mt-1.5 shrink-0" />
                    <span>{error.text}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const failed = messages.findLast(
                          (message) => message.failed,
                        );
                        if (failed) send(failed.text);
                      }}
                      disabled={pending}
                      className="font-semibold text-amber-900 underline underline-offset-4"
                    >
                      {t.chat.retry}
                    </button>
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="font-semibold text-blue-600"
                    >
                      {t.chat.human}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <form
              className="chat-composer"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <label htmlFor="chat-message" className="sr-only">
                {t.chat.input}
              </label>
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  id="chat-message"
                  name="message"
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={t.chat.placeholder}
                  maxLength={2000}
                  disabled={pending}
                />
                <button
                  type="submit"
                  className="chat-send"
                  disabled={pending || !input.trim()}
                  aria-label={t.chat.send}
                >
                  {pending ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} className="directional" />
                  )}
                </button>
              </div>
              <p className="mt-2.5 text-[9px] leading-[1.8] text-slate-500">
                {t.chat.privacy}
              </p>
            </form>
          </m.section>
        )}
      </AnimatePresence>
      <button
        type="button"
        ref={launcherRef}
        className="chat-fab"
        aria-label={open ? t.chat.close : t.chat.open}
        aria-expanded={open}
        aria-controls="zaltrex-chat"
        onClick={() => setOpen(!open)}
      >
        <span className="chat-fab-icon">
          {open ? <X size={20} /> : <Sparkles size={19} strokeWidth={1.7} />}
        </span>
        <span>{t.common.ask}</span>
      </button>
    </>
  );
}
