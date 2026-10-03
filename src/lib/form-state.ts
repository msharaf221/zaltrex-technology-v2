export type FormState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle", message: "" };
