"use client";

import { useSyncExternalStore } from "react";

// The quote basket lives in the browser (localStorage), so it survives
// offline use and return visits. Items are product slugs and quantities;
// names and photos come from the catalog when displayed.

export type BasketItem = { slug: string; qty: number };

const KEY = "pt-quote-basket";
const EMPTY: BasketItem[] = [];
const listeners = new Set<() => void>();
let cache: BasketItem[] | null = null;

function read(): BasketItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed)
      ? parsed
          .filter((item) => typeof item?.slug === "string" && Number.isInteger(item?.qty))
          .map((item) => ({ slug: item.slug, qty: Math.min(999, Math.max(1, item.qty)) }))
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: BasketItem[]) {
  cache = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private mode or storage full: the basket still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep several open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const basket = {
  has(slug: string) {
    return read().some((item) => item.slug === slug);
  },
  add(slug: string, qty = 1) {
    const items = read();
    const existing = items.find((item) => item.slug === slug);
    write(existing ? items.map((item) => (item.slug === slug ? { ...item, qty: Math.min(999, item.qty + qty) } : item)) : [...items, { slug, qty }]);
  },
  setQty(slug: string, qty: number) {
    if (!Number.isFinite(qty)) return;
    write(read().map((item) => (item.slug === slug ? { ...item, qty: Math.min(999, Math.max(1, Math.round(qty))) } : item)));
  },
  remove(slug: string) {
    write(read().filter((item) => item.slug !== slug));
  },
  clear() {
    write(EMPTY);
  },
};

export function useBasket(): BasketItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
