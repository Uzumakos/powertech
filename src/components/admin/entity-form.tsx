"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import type { FieldDef } from "@/lib/admin/entities";
import type { FormState } from "@/lib/admin/actions";
import {
  FieldShell,
  ImageInput,
  ImagesInput,
  LocalizedInput,
  SpecsInput,
  inputClass,
  type MediaOption,
  type SpecRow,
} from "./fields";

type Props = {
  fields: FieldDef[];
  initial: Record<string, unknown>;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  media: MediaOption[];
  categories?: { value: string; label: string }[];
  cancelHref?: string;
  submitLabel?: string;
};

/** A form generated from field definitions (see lib/admin/entities.ts). */
export function EntityForm({ fields, initial, action, media, categories = [], cancelHref, submitLabel = "Enregistrer" }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="grid gap-6">
      {state.message && (
        <div
          role={state.saved ? "status" : "alert"}
          className={`flex items-start gap-3 rounded-[var(--radius-field)] border p-4 text-[0.9375rem] ${
            state.saved ? "border-[#16a34a]/30 bg-[#16a34a]/[0.06] text-[#166534]" : "border-crimson/30 bg-crimson/[0.06] text-crimson-deep"
          }`}
        >
          {state.saved ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" />}
          {state.message}
        </div>
      )}

      {/* Remounted after each response so fields show what was just submitted. */}
      <div key={state.at ?? 0} className="grid gap-x-6 gap-y-6 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7 lg:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.half ? "" : "lg:col-span-2"}>
            <Field field={field} value={(state.values ?? initial)[field.name]} errors={errors} media={media} categories={categories} />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-mist/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-[var(--radius-card)] sm:border sm:bg-white/95 sm:px-5">
        <button type="submit" disabled={pending} className="btn btn-volt disabled:opacity-70">
          <Save className="size-4" />
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="btn border border-line bg-white text-ink hover:border-ink/30">
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}

function Field({
  field,
  value,
  errors,
  media,
  categories,
}: {
  field: FieldDef;
  value: unknown;
  errors: Record<string, string>;
  media: MediaOption[];
  categories: { value: string; label: string }[];
}) {
  const id = `field-${field.name}`;
  const error = errors[field.name] ?? errors[`${field.name}.fr`];
  const shell = { label: field.label, help: field.help, error, required: field.required };

  switch (field.type) {
    case "localized":
    case "localizedLong":
      return (
        <FieldShell {...shell}>
          <LocalizedInput name={field.name} value={value as { fr: string; en: string }} long={field.type === "localizedLong"} errors={errors} />
        </FieldShell>
      );
    case "boolean":
      return (
        <div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-field)] border border-line bg-mist px-4 py-2.5 text-[0.9375rem] font-semibold text-ink has-checked:border-crimson has-checked:bg-crimson/[0.04]">
            <input type="checkbox" name={field.name} defaultChecked={value === undefined ? field.name === "active" : Boolean(value)} className="size-4 accent-crimson" />
            {field.label}
          </label>
          {field.help && <p className="mt-1.5 text-[0.8125rem] text-muted">{field.help}</p>}
        </div>
      );
    case "select":
    case "category": {
      const options = field.type === "category" ? categories : field.options ?? [];
      return (
        <FieldShell {...shell} htmlFor={id}>
          <select id={id} name={field.name} defaultValue={(value as string) ?? (field.required ? options[0]?.value : "")} className={inputClass}>
            {!field.required && <option value="">—</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    }
    case "image":
      return (
        <FieldShell {...shell}>
          <ImageInput name={field.name} defaultValue={value as string | null} media={media} invalid={Boolean(error)} />
        </FieldShell>
      );
    case "images":
      return (
        <FieldShell {...shell}>
          <ImagesInput name={field.name} defaultValue={value as string[] | null} media={media} />
        </FieldShell>
      );
    case "specs":
      return (
        <FieldShell {...shell}>
          <SpecsInput name={field.name} defaultValue={value as SpecRow[] | null} />
        </FieldShell>
      );
    default:
      return (
        <FieldShell {...shell} htmlFor={id}>
          <input
            id={id}
            name={field.name}
            type={field.type === "number" ? "text" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            inputMode={field.type === "number" ? "numeric" : undefined}
            defaultValue={value === null || value === undefined ? "" : String(value)}
            aria-invalid={error ? true : undefined}
            className={inputClass}
          />
        </FieldShell>
      );
  }
}
