"use client";

/* eslint-disable @next/next/no-img-element -- small basket thumbnails from admin-provided links */
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useOffline } from "next/offline";
import { Minus, Plus, Trash2, Zap } from "lucide-react";
import { submitQuote, type QuoteField, type QuoteState } from "@/app/actions/quote";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { basket, useBasket } from "@/lib/basket";
import { ContactPrefField, Field, FormAlert, Honeypot, MessageField, Step, SuccessCard, choiceClass } from "./form-parts";

export type CatalogEntry = { slug: string; name: string; image: string | null };

type Props = {
  locale: Locale;
  dict: Dictionary["quote"];
  basketDict: Dictionary["basket"];
  phone: string;
  catalog: CatalogEntry[];
  /** Button label while a submission waits for the network to come back. */
  offlineLabel: string;
};

/** Quote request form; "Send another request" remounts it with a fresh state. */
export function QuoteForm(props: Props) {
  const [round, setRound] = useState(0);
  return <QuoteFormInner key={round} {...props} onReset={() => setRound((value) => value + 1)} />;
}

function QuoteFormInner({ locale, dict, basketDict, phone, catalog, offlineLabel, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: "idle" });
  const offline = useOffline();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const items = useBasket();
  const known = items.filter((item) => catalog.some((entry) => entry.slug === item.slug));

  // A product page links here with ?produit=slug: put it in the basket, then
  // tidy the URL so a reload doesn't add it twice.
  useEffect(() => {
    const url = new URL(window.location.href);
    const slug = url.searchParams.get("produit");
    if (!slug) return;
    if (catalog.some((entry) => entry.slug === slug) && !basket.has(slug)) basket.add(slug);
    url.searchParams.delete("produit");
    window.history.replaceState(null, "", url);
  }, [catalog]);

  // Move focus to what changed: the success message or the first problem.
  useEffect(() => {
    if (state.status === "success") {
      basket.clear();
      successRef.current?.focus();
    }
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[data-form-error], [aria-invalid='true']")?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <SuccessCard
        ref={successRef}
        title={dict.successTitle}
        body={format(dict.successBody, { name: state.name, pref: dict.prefs[state.contactPref].toLowerCase() })}
      >
        <button type="button" onClick={onReset} className="btn btn-outline mt-8">
          {dict.newRequest}
        </button>
      </SuccessCard>
    );
  }

  const values = state.status === "error" ? state.values : null;
  const errors = state.status === "error" ? state.fieldErrors : {};
  const formError = state.status === "error" ? state.formError : undefined;
  const errorText = (field: QuoteField) => {
    const code = errors[field];
    return code ? dict.errors[code] : undefined;
  };

  return (
    <form ref={formRef} action={formAction} noValidate className="rounded-[var(--radius-frame)] border border-line bg-mist p-5 shadow-float sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="items" value={JSON.stringify(known)} />
      <Honeypot />

      {(formError || Object.keys(errors).length > 0) && (
        <FormAlert>{formError ? format(dict.errors[formError], { phone }) : dict.errors.summary}</FormAlert>
      )}

      <section aria-labelledby="basket-title" className="mb-7 rounded-[var(--radius-field)] border border-line bg-white p-4 sm:p-5">
        <h3 id="basket-title" className="font-semibold text-ink">
          {basketDict.title}
        </h3>
        {known.length === 0 ? (
          <p className="mt-2 text-[0.9375rem] leading-relaxed">
            {basketDict.empty}{" "}
            <Link href={`/${locale}/produits`} className="font-semibold text-crimson hover:underline">
              {basketDict.browse}
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {known.map((item) => {
              const entry = catalog.find((product) => product.slug === item.slug)!;
              return (
                <li key={item.slug} className="flex items-center gap-3 py-2.5">
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-mist">
                    {entry.image && <img src={entry.image} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <Link href={`/${locale}/produits/${item.slug}`} className="min-w-0 flex-1 text-[0.9375rem] font-medium leading-snug text-ink hover:text-crimson">
                    {entry.name}
                  </Link>
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      aria-label={`− ${format(basketDict.quantity, { name: entry.name })}`}
                      disabled={item.qty <= 1}
                      onClick={() => basket.setQty(item.slug, item.qty - 1)}
                      className="grid size-9 place-items-center text-ink disabled:opacity-30"
                    >
                      <Minus className="size-4" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={format(basketDict.quantity, { name: entry.name })}
                      value={item.qty}
                      onChange={(event) => basket.setQty(item.slug, Number(event.target.value.replace(/\D/g, "")) || 1)}
                      className="w-10 bg-transparent text-center font-semibold tabular-nums text-ink focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`+ ${format(basketDict.quantity, { name: entry.name })}`}
                      onClick={() => basket.setQty(item.slug, item.qty + 1)}
                      className="grid size-9 place-items-center text-ink"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={format(basketDict.remove, { name: entry.name })}
                    onClick={() => basket.remove(item.slug)}
                    className="grid size-9 place-items-center rounded-full text-muted hover:bg-crimson/5 hover:text-crimson"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Step number={1} legend={dict.step1} error={errorText("org")} errorId="org-error">
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(dict.orgs) as (keyof typeof dict.orgs)[]).map((key) => (
            <label key={key} className={choiceClass}>
              <input
                type="radio"
                name="org"
                value={key}
                defaultChecked={values?.org === key}
                aria-describedby={errors.org ? "org-error" : undefined}
                className="size-4 shrink-0 accent-crimson"
              />
              {dict.orgs[key]}
            </label>
          ))}
        </div>
      </Step>

      <Step number={2} legend={dict.step2} error={errorText("solutions")} errorId="solutions-error">
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(dict.solutions) as (keyof typeof dict.solutions)[]).map((key) => (
            <label key={key} className={choiceClass}>
              <input
                type="checkbox"
                name="solutions"
                value={key}
                defaultChecked={values?.solutions.includes(key)}
                aria-invalid={errors.solutions ? true : undefined}
                aria-describedby={errors.solutions ? "solutions-error" : undefined}
                className="size-4 shrink-0 rounded accent-crimson"
              />
              {dict.solutions[key]}
            </label>
          ))}
        </div>
      </Step>

      <Step number={3} legend={dict.step3}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field idPrefix="quote" name="name" label={dict.fields.name} autoComplete="name" defaultValue={values?.name} error={errorText("name")} />
          <Field
            idPrefix="quote"
            name="phone"
            label={dict.fields.phone}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+509"
            defaultValue={values?.phone}
            error={errorText("phone")}
          />
          <Field idPrefix="quote" name="company" label={dict.fields.company} optional={dict.fields.optional} autoComplete="organization" defaultValue={values?.company} />
          <Field
            idPrefix="quote"
            name="email"
            label={dict.fields.email}
            optional={dict.fields.optional}
            type="email"
            autoComplete="email"
            defaultValue={values?.email}
            error={errorText("email")}
          />
          <Field idPrefix="quote" name="city" label={dict.fields.city} optional={dict.fields.optional} autoComplete="address-level2" defaultValue={values?.city} />
          <ContactPrefField legend={dict.fields.contactPref} prefs={dict.prefs} defaultValue={values?.contactPref} />
          <MessageField
            idPrefix="quote"
            label={dict.fields.message}
            optional={dict.fields.optional}
            placeholder={dict.fields.messagePlaceholder}
            defaultValue={values?.message}
          />
        </div>
      </Step>

      <button type="submit" disabled={pending} className="btn btn-lg btn-volt mt-8 w-full disabled:opacity-70">
        <Zap aria-hidden className="size-4 fill-current" />
        {pending ? (offline ? offlineLabel : dict.submitting) : dict.submit}
      </button>
      <p className="mt-3 text-center text-sm">{dict.privacy}</p>
    </form>
  );
}
