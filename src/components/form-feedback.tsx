import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import type { FormState } from "@/lib/form-state";

export function FormFeedback({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  const success = state.status === "success";
  const Icon = success ? CheckCircle2 : CircleAlert;
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-sm leading-6 ${success ? "border-green-100 bg-green-50 text-green-800" : "border-red-100 bg-red-50 text-red-700"}`}
    >
      <Icon size={17} className="mt-1 shrink-0" aria-hidden="true" />
      <span>{state.message}</span>
    </div>
  );
}

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  return errors?.[0] ? (
    <p id={id} className="mt-1.5 text-xs text-red-600">
      {errors[0]}
    </p>
  ) : null;
}

export function SubmitLabel({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {pending && (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </>
  );
}
