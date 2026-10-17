"use client";

import { useEffect, useRef, useState } from "react";
import { useOffline } from "next/offline";
import { Download, Share, WifiOff, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { BoltMark } from "@/components/site/logo";

type Labels = Dictionary["pwa"];

// The service worker only runs in production builds (and on demand in dev),
// so development never serves stale cached pages.
const SW_ENABLED = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_SW === "1";

/** Service worker registration, offline notice and install prompt. */
export function PwaClient({ labels }: { labels: Labels }) {
  useEffect(() => {
    if (!SW_ENABLED || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((error) => {
      console.error("Service worker registration failed", error);
    });
  }, []);

  return (
    <>
      <OfflineNotice labels={labels} />
      <InstallPrompt labels={labels} />
    </>
  );
}

function OfflineNotice({ labels }: { labels: Labels }) {
  const offline = useOffline();

  // Offline, Next.js holds client-side navigations until the network returns.
  // Saved pages can be served right away by the service worker instead, so
  // internal links switch to plain page loads while offline.
  const offlineRef = useRef(offline);
  const lastClick = useRef<{ href: string; at: number } | null>(null);

  useEffect(() => {
    offlineRef.current = offline;
    // A click made just before the connection was found to be down is stuck
    // waiting in Next.js: finish it as a page load from the saved copy.
    const pending = lastClick.current;
    if (offline && pending && Date.now() - pending.at < 10_000 && navigator.serviceWorker?.controller) {
      lastClick.current = null;
      if (new URL(pending.href).pathname !== window.location.pathname) window.location.assign(pending.href);
    }
  }, [offline]);

  useEffect(() => {
    if (!navigator.serviceWorker?.controller) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/admin")) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      lastClick.current = { href: url.href, at: Date.now() };
      // navigator.onLine catches a device that was already offline when the
      // page opened (no request has failed yet, so useOffline is still false).
      if (!offlineRef.current && navigator.onLine) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[55] flex justify-center px-4">
      {offline && (
        <p className="on-dark pointer-events-auto flex max-w-xl items-start gap-3 rounded-[var(--radius-card)] bg-night px-4 py-3 text-[0.9375rem] text-white shadow-float">
          <WifiOff aria-hidden className="mt-0.5 size-5 shrink-0 text-volt" />
          {labels.offline}
        </p>
      )}
    </div>
  );
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "pt-install-dismissed";
const DISMISS_DAYS = 30;

function recentlyDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY));
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

/**
 * Offers installation once per month at most: Chrome/Edge/Android through the
 * browser prompt, iOS Safari with "Share → Add to Home Screen" instructions.
 * Waits a few seconds so it never interrupts the first glance at the page.
 */
function InstallPrompt({ labels }: { labels: Labels }) {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone || recentlyDismissed()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const showSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(true), 6000);
    };
    const onPrompt = (prompt: Event) => {
      prompt.preventDefault();
      setEvent(prompt as InstallEvent);
      showSoon();
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no install event; it only installs from the Share menu.
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
    if (isIos && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) {
      timer = setTimeout(() => {
        setIos(true);
        setVisible(true);
      }, 6000);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || (!event && !ios)) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Storage unavailable: the prompt simply shows again next visit.
    }
  };

  const install = async () => {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome !== "accepted") dismiss();
    setEvent(null);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="on-dark fixed inset-x-3 bottom-3 z-[56] rounded-[var(--radius-card)] bg-night p-4 text-white shadow-float sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem] sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <BoltMark />
        <div className="min-w-0 flex-1">
          <p id="install-title" className="font-semibold">
            {labels.installTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/70">{ios ? labels.installIos : labels.installBody}</p>
          {ios && <Share aria-hidden className="mt-2 size-5 text-volt" />}
        </div>
        <button type="button" onClick={dismiss} aria-label={labels.dismiss} className="-mr-1 -mt-1 grid size-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
          <X className="size-5" />
        </button>
      </div>
      {!ios && (
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={dismiss} className="btn min-h-10 text-white/80 hover:text-white">
            {labels.dismiss}
          </button>
          <button type="button" onClick={install} className="btn btn-volt min-h-10">
            <Download aria-hidden className="size-4" />
            {labels.installButton}
          </button>
        </div>
      )}
    </div>
  );
}
