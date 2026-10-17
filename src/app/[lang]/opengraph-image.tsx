import { ImageResponse } from "next/og";
import { hasLocale } from "@/i18n/config";
import { getDictionaryFor } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";

// Preview image shown when a page is shared (WhatsApp, Facebook, LinkedIn…).
// Product pages use their own photo instead (see their metadata).

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Powertech Services S.A.";

const BOLT =
  "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z";

/** Archivo Expanded ExtraBold as TTF (the image renderer can't read woff2). Optional. */
async function loadArchivo(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800&display=swap", {
      // An old user agent makes Google Fonts answer with TTF files.
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Safari/534.30" },
    }).then((response) => response.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await fetch(url).then((response) => response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "fr";
  const [dict, settings, archivo] = await Promise.all([getDictionaryFor(locale), getSettings(), loadArchivo()]);
  const display = archivo ? "Archivo" : "sans-serif";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0B0F19", position: "relative" }}>
        {/* Photo on the right, fading into the dark panel. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG by next/og */}
        <img
          src={settings.heroImageUrl}
          alt=""
          width={560}
          height={630}
          style={{ position: "absolute", right: 0, top: 0, width: 560, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: "linear-gradient(90deg, #0B0F19 0%, #0B0F19 53%, rgba(11,15,25,0.6) 66%, rgba(11,15,25,0) 85%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 64px", width: 700, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 18, background: "#9E1B1E" }}>
              <svg width="40" height="40" viewBox="0 0 24 24">
                <path d={BOLT} fill="#FFD100" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: display, fontSize: 34, color: "#FFFFFF", fontWeight: 800 }}>{settings.companyName}</span>
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.6)" }}>Port-au-Prince, Haïti</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 20px",
                borderRadius: 999,
                background: "#FFD100",
                color: "#0F172A",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {dict.hero.badge}
            </div>
            <span style={{ fontFamily: display, fontSize: 56, lineHeight: 1.08, color: "#FFFFFF", fontWeight: 800 }}>{dict.hero.title}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
              UPS · {locale === "fr" ? "Solaire" : "Solar"} · Lithium · {locale === "fr" ? "Générateurs" : "Generators"}
            </span>
            <span style={{ fontSize: 24, color: "#FFD100", fontWeight: 700 }}>{settings.phone}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: archivo ? [{ name: "Archivo", data: archivo, weight: 800, style: "normal" }] : undefined,
    },
  );
}
