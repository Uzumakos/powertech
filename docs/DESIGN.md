# Powertech Service S.A. — Design Direction

Source: client brief + reference "Sonar Solar Energy Platform" (Pinterest). Validated 2026-10-13.

## Subject, audience, job

- **Subject:** Haitian energy infrastructure & engineering firm, founded **1993** (33 years in 2026) — online UPS, solar + lithium storage, industrial generators, after-sales service contracts.
- **Audience:** facility managers and procurement directors at banks, institutions and businesses in Haiti; field technicians on mobile (PWA, low connectivity).
- **Primary job:** turn a visit into a qualified quote request or pre-order by proving one thing: *with Powertech, the power never cuts.*

## Taken from the reference

- Full-bleed photo hero inside a large rounded frame, inset on the light page.
- Giant faded word (ÉNERGIE / ENERGY) in extra-wide type, sitting in the sky of the photo.
- Floating glass pill navigation that turns solid on scroll.
- Glass stat cards: years (computed) · 0 ms · 24/7.
- Solar-yellow pill CTA with a bolt icon.

Not copied: the single italic-serif accent word, the award laurels.

## Color tokens (client brief, exact)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FFFFFF` | Surfaces, cards |
| `mist` | `#F8FAFC` | Page background, form container |
| `line` | `#E2E8F0` | 1px borders |
| `ink` | `#0F172A` | Headings |
| `slate` | `#475569` | Body copy |
| `crimson` | `#9E1B1E` | Logo, icon badges, links, focus ring |
| `volt` | `#FFD100` | CTA fill, live indicators — never as text on white; always dark text on yellow |
| `night` | `#0B0F19` | Solutions section, footer |
| `night-2` | `#151C2C` | Cards on dark sections |

## Typography

One family, two widths — **Archivo** (variable, `wdth` axis).
- Expanded (wdth 125), 700–800: giant hero word, H1/H2.
- Normal (wdth 100), 400–600: body, UI, forms.
- Tabular figures for every spec (kVA, Ah, ms, V).
- Sentence case; no all-caps eyebrow labels; line length ≤ 70ch.

## Shape

Hero frame / big containers 28px · cards 16px · inputs 10px · buttons, badges, nav: pill. Shadows only on floating elements.

## Signature moment

UPS explainer "La courbe qui ne s'arrête jamais": three sine waves (Réseau EDH → flat line; backup simple → gap then restart; UPS en ligne → never breaks), triggered by "Simuler une coupure EDH". Everything else stays calm. Motion budget: one hero load sequence + partner logo marquee + the waveform on demand. `prefers-reduced-motion` respected (marquee becomes a static wrapped grid).

## Content rules

- Company age is **computed** from the founding year stored in admin settings — never hard-coded.
- Copyright: `© 1993–{current year}`.
- Every image (logo, hero, solutions, projects, partner logos) is a **URL field** editable in the admin, with a preview; a media library keeps links for reuse.
- Imagery: infrastructure only, no people.
- Partners without a logo URL render as a typographic wordmark.
- Client references BRH and Sogebank: approved for public display.

## Responsive

Fluid from 320px phones to 2560px screens: fluid type with `clamp()`, container max 1440px with 16px gutters on mobile, touch targets ≥ 44px, menu collapses to a sheet under 1024px, horizontal panels become an accordion under 1024px.
