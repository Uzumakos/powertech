"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useOffline } from "next/offline";
import { PackageCheck } from "lucide-react";
import type { PreorderField, PreorderState } from "@/app/actions/preorder";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { ContactPrefField, Field, FormAlert, Honeypot, MessageField, SuccessCard } from "./form-parts";

type Props = {
  locale: Locale;
  action: (state: PreorderState, formData: FormData) => Promise<PreorderState>;
  quote: Dictionary["quote"];
  dict: Dictionary["preorder"];
  phone: string;
  productHref: string;
  offlineLabel: string;
};

export function PreorderForm({ locale, action, quote, dict, phone, productHref, offlineLabel }: Props) {
  const [state, formAction, pending] = useActionState<PreorderState, FormData>(action, { status: "idle" });
  const offline = useOffline();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[data-form-error], [aria-invalid='true']")?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <SuccessCard
        ref={successRef}
        title={dict.successTitle}
        body={format(dict.successBody, { name: state.name, pref: quote.prefs[state.contactPref].toLowerCase() })}
      >
        <Link href={productHref} className="btn btn-outline mt-8">
          {dict.back}
        </Link>
      </SuccessCard>
    );
  }

  const values = state.status === "error" ? state.values : null;
  const errors = state.status === "error" ? state.fieldErrors : {};
  const formError = state.status === "error" ? state.formError : undefined;
  const errorText = (field: PreorderField) => {
    const code = errors[field];
    if (!code) return undefined;
    return code === "quantity" || code === "date" ? dict.errors[code] : quote.errors[code];
  };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={formAction} noValidate className="rounded-[var(--radius-frame)] border border-line bg-mist p-5 shadow-float sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />
      {(formError || Object.keys(errors).length > 0) && (
        <FormAlert>{formError ? format(quote.errors[formError], { phone }) : quote.errors.summary}</FormAlert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          idPrefix="preorder"
          name="quantity"
          label={dict.quantity}
          inputMode="numeric"
          defaultValue={values?.quantity ?? "1"}
          error={errorText("quantity")}
        />
        <Field
          idPrefix="preorder"
          name="desiredDate"
          label={dict.desiredDate}
          optional={quote.fields.optional}
          type="date"
          min={today}
          defaultValue={values?.desiredDate}
          error={errorText("desiredDate")}
        />
        <Field idPrefix="preorder" name="name" label={quote.fields.name} autoComplete="name" defaultValue={values?.name} error={errorText("name")} />
        <Field
          idPrefix="preorder"
          name="phone"
          label={quote.fields.phone}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+509"
          defaultValue={values?.phone}
          error={errorText("phone")}
        />
        <Field idPrefix="preorder" name="company" label={quote.fields.company} optional={quote.fields.optional} autoComplete="organization" defaultValue={values?.company} />
        <Field
          idPrefix="preorder"
          name="email"
          label={quote.fields.email}
          optional={quote.fields.optional}
          type="email"
          autoComplete="email"
          defaultValue={values?.email}
          error={errorText("email")}
        />
        <ContactPrefField legend={quote.fields.contactPref} prefs={quote.prefs} defaultValue={values?.contactPref} />
        <MessageField idPrefix="preorder" label={quote.fields.message} optional={quote.fields.optional} defaultValue={values?.message} />
      </div>

      <button type="submit" disabled={pending} className="btn btn-lg btn-volt mt-8 w-full disabled:opacity-70">
        <PackageCheck aria-hidden className="size-4" />
        {pending ? (offline ? offlineLabel : dict.submitting) : dict.submit}
      </button>
      <p className="mt-3 text-center text-sm">{quote.privacy}</p>
    </form>
  );
}
