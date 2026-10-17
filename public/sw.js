/* Powertech service worker — offline catalog and instant repeat visits.
 *
 * Pages:  network first (fresh content), cached copy when offline, then the
 *         offline page. Visited pages are kept for later.
 * Assets: /_next/static is immutable, so cache first.
 * Images: cache first, refreshed in the background; offline, any cached width
 *         of the same picture is used.
 * The admin, API routes and RSC data requests are never cached.
 *
 * Bump VERSION to drop every cache from older versions on the next visit.
 */
const VERSION = "v1";
const PAGES = `pt-pages-${VERSION}`;
const STATIC = `pt-static-${VERSION}`;
const IMAGES = `pt-images-${VERSION}`;
const OFFLINE_PAGES = { fr: "/fr/hors-ligne", en: "/en/hors-ligne" };
const LIMITS = { [PAGES]: 150, [IMAGES]: 300 };
const PAGE_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(Object.values(OFFLINE_PAGES)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const current = [PAGES, STATIC, IMAGES];
      for (const key of await caches.keys()) {
        if (key.startsWith("pt-") && !current.includes(key)) await caches.delete(key);
      }
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;
    // RSC payloads depend on request headers: let Next.js handle them (when
    // offline it falls back to a full page load, served from the cache below).
    if (url.searchParams.has("_rsc") || request.headers.get("RSC")) return;
    if (request.mode === "navigate") return event.respondWith(pageResponse(event));
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
      return event.respondWith(cacheFirst(request, STATIC));
    }
    if (url.pathname === "/_next/image") return event.respondWith(imageResponse(request, url));
    return;
  }

  if (request.destination === "image") event.respondWith(imageResponse(request, url));
});

// ---------------------------------------------------------------------------

/** A redirected response can't answer a navigation; copy it into a fresh one. */
async function clean(response) {
  if (!response.redirected) return response;
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers });
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function trim(cacheName) {
  const limit = LIMITS[cacheName];
  if (!limit) return;
  const cache = await caches.open(cacheName);
  const protectedPaths = Object.values(OFFLINE_PAGES);
  // Oldest first; the offline fallback pages are never evicted.
  const keys = (await cache.keys()).filter((key) => !protectedPaths.includes(new URL(key.url).pathname));
  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) await cache.delete(key);
}

function localeOf(pathname) {
  const segment = pathname.split("/")[1];
  if (segment === "fr" || segment === "en") return segment;
  return (self.navigator.language || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
}

async function pageResponse(event) {
  const { request } = event;
  const url = new URL(request.url);
  const cache = await caches.open(PAGES);

  try {
    const preloaded = await event.preloadResponse;
    const response = await Promise.race([preloaded ? Promise.resolve(preloaded) : fetch(request), timeout(PAGE_TIMEOUT_MS)]);
    if (response.ok && response.type === "basic") {
      const copy = await clean(response.clone());
      event.waitUntil(cache.put(request, copy).then(() => trim(PAGES)));
    }
    return clean(response);
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(url.pathname));
    if (cached) return cached;
    // "/" redirects by language when online; offline, open whichever home
    // page is saved, the browser's language first.
    if (url.pathname === "/") {
      const preferred = localeOf(url.pathname);
      const home = (await cache.match(`/${preferred}`)) || (await cache.match(`/${preferred === "fr" ? "en" : "fr"}`));
      if (home) return home;
    }
    const offline = await cache.match(OFFLINE_PAGES[localeOf(url.pathname)]);
    return offline || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

/** Same picture, any width: `/_next/image?url=X&w=640` matches `url=X&w=1080`. */
async function anyWidthOf(url) {
  const source = url.searchParams.get("url");
  if (!source) return undefined;
  const cache = await caches.open(IMAGES);
  for (const key of await cache.keys()) {
    const keyUrl = new URL(key.url);
    if (keyUrl.pathname === "/_next/image" && keyUrl.searchParams.get("url") === source) return cache.match(key);
  }
  return undefined;
}

async function imageResponse(request, url) {
  const cache = await caches.open(IMAGES);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok || response.type === "opaque") {
        await cache.put(request, response.clone());
        trim(IMAGES);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;
  const fresh = await refresh;
  if (fresh) return fresh;
  return (await anyWidthOf(url)) || Response.error();
}

// ---------------------------------------------------------------------------
// "Save the catalog offline": the page sends the list of URLs to keep; each
// page is cached along with its scripts, styles and main images.

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS") return;
  const port = event.ports[0];
  event.waitUntil(saveUrls(event.data.urls || [], port));
});

async function saveUrls(urls, port) {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(STATIC);
  const images = await caches.open(IMAGES);
  let done = 0;
  let failed = 0;

  for (const path of urls) {
    try {
      const response = await fetch(path, { credentials: "same-origin" });
      if (!response.ok) throw new Error(String(response.status));
      const html = await (await clean(response.clone())).text();
      await pages.put(path, new Response(html, { headers: response.headers }));

      const found = new Set();
      for (const match of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) found.add(match[1]);
      const imageUrls = new Set();
      for (const match of html.matchAll(/src="(\/_next\/image\?[^"]+)"/g)) imageUrls.add(match[1].replace(/&amp;/g, "&"));

      await Promise.all(
        [...found].map(async (asset) => {
          if (!(await assets.match(asset))) await assets.add(asset).catch(() => undefined);
        }),
      );
      // Fonts are referenced from the stylesheets, not from the HTML.
      for (const stylesheet of [...found].filter((asset) => asset.endsWith(".css"))) {
        const css = await (await assets.match(stylesheet))?.text();
        if (!css) continue;
        for (const match of css.matchAll(/url\(["']?(\/_next\/static\/media\/[^)"']+)["']?\)/g)) {
          if (!(await assets.match(match[1]))) await assets.add(match[1]).catch(() => undefined);
        }
      }
      await Promise.all(
        [...imageUrls].map(async (image) => {
          if (!(await images.match(image))) await images.add(image).catch(() => undefined);
        }),
      );
    } catch {
      failed++;
    }
    done++;
    port?.postMessage({ type: "progress", done, total: urls.length });
  }
  await trim(IMAGES);
  port?.postMessage({ type: "done", done, failed, total: urls.length });
}
