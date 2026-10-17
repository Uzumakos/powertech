"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";
import { format, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Category, Product, StockStatus } from "@/lib/data";
import { specValue } from "@/lib/specs";
import { ProductCard } from "./product-card";

type Props = {
  products: Product[];
  categories: Category[];
  locale: Locale;
  dict: Dictionary["catalog"];
  basketDict: Dictionary["basket"];
};

const STATUSES: StockStatus[] = ["in_stock", "on_order", "preorder"];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// The URL (?categorie=ups&dispo=preorder&q=…) is the single source of truth
// for the filters, so a filtered view can be shared. It is read as an external
// store: the server renders the unfiltered catalog, and after hydration React
// just updates the existing list instead of re-creating it.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}
const getSearch = () => window.location.search;
const getServerSearch = () => "";

function setParams(next: { categorie?: string; dispo?: string; q?: string }) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(next)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", url);
  listeners.forEach((listener) => listener());
}

/** Client-side search and filters over the full list (works offline once cached). */
export function CatalogBrowser({ products, categories, locale, dict, basketDict }: Props) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const params = new URLSearchParams(search);
  const categoryParam = params.get("categorie") ?? "";
  const statusParam = params.get("dispo") as StockStatus | null;
  const category = categories.some((item) => item.slug === categoryParam) ? categoryParam : "";
  const status: StockStatus | "" = statusParam && STATUSES.includes(statusParam) ? statusParam : "";
  const query = params.get("q") ?? "";

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.slug, pick(item.name, locale)])),
    [categories, locale],
  );

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      if (category && product.categorySlug !== category) return false;
      if (status && product.stockStatus !== status) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(
        [
          pick(product.name, locale),
          pick(product.summary, locale),
          product.categorySlug ? categoryName[product.categorySlug] : "",
          ...product.specs.map((spec) => specValue(spec, locale)),
        ].join(" "),
      );
      // "120 kVA" should match "120 kVA" and "120kva".
      return terms.every((term) => haystack.includes(term) || haystack.replace(/\s/g, "").includes(term));
    });
  }, [products, category, status, query, locale, categoryName]);

  const filtered = Boolean(category || status || query);
  const reset = () => setParams({ categorie: "", dispo: "", q: "" });

  const chip = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
      active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40"
    }`;

  return (
    <div>
      <div className="grid gap-5 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5">
        <div className="relative">
          <label htmlFor="catalog-search" className="sr-only">
            {dict.search}
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(event) => setParams({ q: event.target.value })}
            placeholder={dict.searchPlaceholder}
            className="h-12 w-full rounded-[var(--radius-field)] border border-line bg-mist pl-12 pr-4 text-base text-ink placeholder:text-muted/70 focus:border-crimson focus:outline-none"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">{dict.filterCategory}</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={!category} className={chip(!category)} onClick={() => setParams({ categorie: "" })}>
                {dict.all}
              </button>
              {categories.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  aria-pressed={category === item.slug}
                  className={chip(category === item.slug)}
                  onClick={() => setParams({ categorie: item.slug })}
                >
                  {pick(item.name, locale)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">{dict.filterStatus}</legend>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  className={chip(status === value)}
                  onClick={() => setParams({ dispo: status === value ? "" : value })}
                >
                  {dict.status[value]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="mt-6 flex min-h-10 flex-wrap items-center justify-between gap-3">
        {/* Heading for the result list (h1 → h2 → product h3s). */}
        <h2 aria-live="polite" className="text-sm font-medium text-ink">
          {visible.length === 1 ? dict.countOne : format(dict.count, { count: visible.length })}
        </h2>
        {filtered && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-crimson hover:underline">
            <X aria-hidden className="size-4" />
            {dict.reset}
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard
                product={product}
                categoryName={product.categorySlug ? categoryName[product.categorySlug] : undefined}
                locale={locale}
                dict={dict}
                basketLabels={basketDict}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="text-lg font-medium text-ink">{dict.empty}</p>
          <button type="button" onClick={reset} className="btn btn-outline mt-5">
            {dict.reset}
          </button>
        </div>
      )}
    </div>
  );
}
