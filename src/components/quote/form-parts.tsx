"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Building blocks shared by the public quote and pre-order forms.

export const inputClass =
  "block w-full rounded-[var(--radius-field)] border border-line bg-white px-4 text-[1rem] text-ink placeholder:text-muted/60 transition-colors focus:border-crimson focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson aria-[invalid=true]:border-crimson";

export const choiceClass =
  "flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius-field)] border border-line bg-white px-4 py-3 text-[0.9375rem] font-medium text-ink transition-colors hover:border-ink/30 has-checked:border-crimson has-checked:bg-crimson/[0.04] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-crimson";

/** Invisible to people, tempting to bots. Submissions that fill it are dropped. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      data-form-error
      tabIndex={-1}
      role="alert"
      className="mb-6 flex gap-3 rounded-[var(--radius-field)] border border-crimson/30 bg-crimson/[0.06] p-4 text-[0.9375rem] text-crimson-deep"
    >
      <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export const SuccessCard = forwardRef<HTMLDivElement, { title: string; body: string; children?: ReactNode }>(function SuccessCard(
  { title, body, children },
  ref,
) {
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-[var(--radius-frame)] border border-line bg-mist p-8 text-center shadow-float sm:p-12">
      <CheckCircle2 aria-hidden className="mx-auto size-14 text-[#16a34a]" strokeWidth={1.5} />
      <h3 className="wide mt-5 text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-3 max-w-[44ch] text-lg leading-relaxed">{body}</p>
      {children}
    </div>
  );
});

export function Step({
  number,
  legend,
  error,
  errorId,
  children,
}: {
  number: number;
  legend: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-b border-line pb-7 pt-1 [&+&]:pt-7 last-of-type:border-0 last-of-type:pb-0">
      {/* float + w-full makes the legend lay out like a normal block inside the fieldset */}
      <legend className="float-left flex w-full items-center gap-3">
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">
          {number}
        </span>
        <span className="wide text-lg font-bold text-ink">{legend}</span>
      </legend>
      <div className="clear-both pt-4">{children}</div>
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-crimson">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function Field({
  name,
  label,
  optional,
  error,
  idPrefix = "form",
  ...input
}: {
  name: string;
  label: string;
  optional?: string;
  error?: string;
  idPrefix?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = `${idPrefix}-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">({optional})</span>}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} mt-2 h-12`}
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactPrefField({
  legend,
  prefs,
  defaultValue = "call",
}: {
  legend: string;
  prefs: Record<"call" | "whatsapp" | "email", string>;
  defaultValue?: string;
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(Object.keys(prefs) as (keyof typeof prefs)[]).map((key) => (
          <label key={key} className={`${choiceClass} min-h-12 justify-center px-2 text-center`}>
            <input type="radio" name="contactPref" value={key} defaultChecked={defaultValue === key} className="sr-only" />
            {prefs[key]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MessageField({ label, optional, placeholder, defaultValue, idPrefix = "form" }: { label: string; optional: string; placeholder?: string; defaultValue?: string; idPrefix?: string }) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor={`${idPrefix}-message`} className="text-sm font-semibold text-ink">
        {label} <span className="font-normal text-muted">({optional})</span>
      </label>
      <textarea
        id={`${idPrefix}-message`}
        name="message"
        rows={4}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${inputClass} mt-2 py-3 leading-relaxed`}
      />
    </div>
  );
}
