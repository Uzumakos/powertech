"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, CloudDownload, RefreshCw } from "lucide-react";
import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";

type Status = { kind: "idle" } | { kind: "saving"; done: number; total: number } | { kind: "failed" };

const savedKey = (locale: Locale) => `pt-catalog-saved-${locale}`;

// The "saved on" date lives in localStorage; read it as an external store so
// the server render (no storage) and the first client render agree.
const listeners = new Set<() => void>();
function subscribeSaved(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function readSaved(locale: Locale): string | null {
  try {
    return window.localStorage.getItem(savedKey(locale));
  } catch {
    return null;
  }
}

function subscribeController(listener: () => void) {
  navigator.serviceWorker?.addEventListener("controllerchange", listener);
  return () => navigator.serviceWorker?.removeEventListener("controllerchange", listener);
}

/**
 * Asks the service worker to store the whole catalog (pages, scripts and
 * product photos) so it can be read in the field without network. Hidden
 * where no service worker controls the page (development, old browsers).
 */
export function SaveCatalog({ urls, locale, labels }: { urls: string[]; locale: Locale; labels: Dictionary["pwa"] }) {
  const controlled = useSyncExternalStore(subscribeController, () => Boolean(navigator.serviceWorker?.controller), () => false);
  const savedAt = useSyncExternalStore(subscribeSaved, () => readSaved(locale), () => null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  if (!controlled) return null;

  const save = () => {
    const worker = navigator.serviceWorker.controller;
    if (!worker) return;
    setStatus({ kind: "saving", done: 0, total: urls.length });
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<{ type: string; done: number; total: number; failed?: number }>) => {
      const { type, done, total, failed = 0 } = event.data;
      if (type === "progress") setStatus({ kind: "saving", done, total });
      if (type === "done") {
        if (failed > 0) {
          setStatus({ kind: "failed" });
          return;
        }
        try {
          window.localStorage.setItem(savedKey(locale), new Date().toISOString());
        } catch {
          // Storage unavailable: the pages are cached all the same.
        }
        listeners.forEach((listener) => listener());
        setStatus({ kind: "idle" });
      }
    };
    worker.postMessage({ type: "CACHE_URLS", urls }, [channel.port2]);
  };

  const saving = status.kind === "saving";
  const savedLabel = savedAt
    ? format(labels.catalogSavedOn, {
        date: new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(savedAt)),
      })
    : null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:p-5">
      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-night text-volt">
        {savedAt && !saving ? <CheckCircle2 className="size-5" /> : <CloudDownload className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{savedAt ? labels.catalogSaved : labels.saveCatalog}</p>
        <p aria-live="polite" className="text-sm">
          {saving
            ? format(labels.savingCatalog, { done: status.done, total: status.total })
            : status.kind === "failed"
              ? labels.saveFailed
              : savedLabel ?? labels.saveCatalogHelp}
        </p>
      </div>
      <button type="button" onClick={save} disabled={saving} className="btn btn-outline min-h-11 disabled:opacity-60">
        {savedAt ? <RefreshCw aria-hidden className={`size-4 ${saving ? "animate-spin" : ""}`} /> : <CloudDownload aria-hidden className="size-4" />}
        {savedAt ? labels.updateCatalog : labels.saveCatalogButton}
      </button>
    </div>
  );
}
