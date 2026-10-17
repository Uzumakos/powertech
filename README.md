# Powertech Services S.A. — website

Bilingual (FR/EN) lead-generation site and PWA for Powertech Services S.A., Port-au-Prince, Haiti,
with an admin dashboard where every piece of content is editable.
Design direction: [docs/DESIGN.md](docs/DESIGN.md). Going live: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Stack

- Next.js 16 (App Router, Cache Components, `proxy.ts` for locale redirects and admin sessions)
- Tailwind CSS 4 — design tokens in `src/app/globals.css`
- Supabase (Postgres, Auth, row-level security) — schema in `supabase/migrations/`
- Resend (optional) for email alerts

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/fr` or `/en` based on the browser language.
Without Supabase keys the site runs on the placeholder content in `src/lib/data/seed.ts`.
On a machine with little free memory, stop `npm run dev` before `npm run build`.

## Connect Supabase (needed for the admin and for receiving requests)

1. Create a project at supabase.com.
2. In the SQL editor, run the files in `supabase/migrations/` in order
   (`0001_init.sql`, `0002_admin_content.sql`, `0003_legal.sql`). `npm run db:status` shows which ones ran.
3. Copy `.env.example` to `.env.local` and fill in the URL, anon key and service-role key.
4. `npm run db:seed` loads the starting content (only fills empty tables).
5. Create your user in Supabase → Authentication → Users, then grant admin access in the SQL editor:
   `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`
6. Restart the dev server and sign in at http://localhost:3000/admin.

## Admin dashboard (`/admin`)

| Section | What it edits |
|---|---|
| Tableau de bord | New requests, totals, shortcuts |
| Demandes de devis | Quote requests with items, status follow-up, CSV export |
| Précommandes | Reservations, status, cumulative demand per product |
| Produits / Catégories / Services | Catalog, specs (FR/EN), photos, availability, pre-order switch |
| Textes du site | Every public text, FR and EN side by side, lists (timeline…) editable |
| Réalisations / Partenaires | Project cards, client and brand logos of the animated band |
| Médiathèque | Image and document links reused in every image field |
| Paramètres | Company name, founding year, contacts, logos, hero photo, notification email |

Images are links: paste any image URL or pick one from the media library. Links on
`images.unsplash.com` and `*.supabase.co` are optimized; any other host is shown as-is.
Every save refreshes the public pages immediately (cache tags).

## Mobile app (PWA) and offline use

- Installable from the browser (manifest in `src/app/manifest.ts`, icons in `public/icons/`,
  regenerate them with `node scripts/generate-icons.ts`).
- `public/sw.js` keeps visited pages, scripts, fonts and photos. The catalog page has a
  "Enregistrer le catalogue hors ligne" button that saves every product page at once.
- Offline, saved pages open normally; other pages show `/[lang]/hors-ligne`. Quote and
  pre-order forms submitted offline are sent automatically when the connection returns
  (as long as the page stays open).
- The service worker only runs in production builds. To try it locally:
  ```bash
  npm run build
  ```
  then `npm run start`. Bump `VERSION` in `public/sw.js` to clear every cached file after a
  major change.

## Project layout

```
src/app/[lang]/          Public pages, one tree per language (fr, en)
src/app/admin/           Admin: (auth) login and setup, (panel) dashboard pages
src/app/actions/         Public form actions (quote, pre-order)
src/components/          site/, home/, catalog/, quote/, about/, admin/
src/i18n/                Locales, built-in texts, merge of admin edits
src/lib/admin/           Content type definitions, form parsing, admin actions
src/lib/data/            Public data access (Supabase, or seed fallback)
supabase/migrations/     Database schema and row-level security
scripts/seed.ts          Pushes seed content to Supabase
```

## Content rules

- The company age is computed from the founding year (settings) — never hard-code "33 ans".
  In texts, `{company}`, `{founded}` and `{years}` are filled in automatically.
- The quote basket lives in the visitor's browser and is sent with the request.
- Public forms are protected by a honeypot field and a limit of 3 submissions per phone number per 10 minutes.
