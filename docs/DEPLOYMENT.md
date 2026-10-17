# Going live — Powertech Services S.A.

Checklist to put the site online. Steps marked **(you)** need your accounts or decisions;
everything else is already in the code.

## 1. Supabase (database)

1. **(you)** In the Supabase SQL editor, run `supabase/migrations/0003_legal.sql`
   (adds the legal fields used by the "Mentions légales" page and the Settings form).
   Check with `npm run db:status`: every migration should say `ok`.
2. **(you) Disable public sign-ups** — Authentication → Sign In / Providers → Email →
   turn off "Allow new users to sign up". Only accounts you create yourself (Authentication →
   Users → Add user) should exist. Non-admin accounts can't see anything, but there is no
   reason to let strangers create them.
3. Optional: Authentication → URL Configuration → set "Site URL" to your domain.
4. To give a colleague admin access: create the user, then in the SQL editor
   `insert into public.admins (user_id) select id from auth.users where email = 'colleague@example.com';`

## 2. Code hosting (GitHub) and Vercel

Vercel deploys from a Git repository.

1. **(you)** Create a private GitHub repository and push this folder to it
   (`.env.local` is ignored by Git and must never be committed).
2. **(you)** On vercel.com → Add New → Project → import the repository.
   Framework: Next.js (detected). Build command and output: defaults.
3. **(you)** Project → Settings → Environment Variables, for "Production" and "Preview":

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://www.your-domain.ht` (no trailing slash) |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem |
   | `SUPABASE_SERVICE_ROLE_KEY` | idem — secret, server only |
   | `RESEND_API_KEY` | see step 4 |
   | `RESEND_FROM` | e.g. `Powertech <site@your-domain.ht>` |
   | `SALES_EMAIL` | fallback inbox if none is set in the admin |

4. Functions region: Settings → Functions → choose **Washington, D.C. (iad1)**, the closest
   to Haiti and to most Supabase US projects.
5. Deploy. Every later push to the main branch redeploys automatically.

## 3. Domain

1. **(you)** Vercel → Project → Settings → Domains → add `your-domain.ht` and `www.your-domain.ht`.
2. **(you)** At your domain registrar, add the DNS records Vercel shows (A record and CNAME).
3. HTTPS certificates are issued automatically. Update `NEXT_PUBLIC_SITE_URL` if needed and redeploy.

## 4. Email alerts (Resend)

1. **(you)** Create an account on resend.com → Domains → add your domain → add the DNS
   records it shows (SPF/DKIM) at your registrar → wait for "Verified".
2. **(you)** API Keys → create a key with "Sending access" → put it in `RESEND_API_KEY`.
3. `RESEND_FROM` must use the verified domain.
4. In the admin → Paramètres → "E-mail qui reçoit les demandes": the sales inbox.
5. Test: send a quote request from the live site; the team and the client (if they gave an
   email) each receive a message.

## 5. Before announcing the site

- [ ] Admin → Paramètres: real email, address, WhatsApp, logo links, NIF, legal form,
      publication director, registered address.
- [ ] Admin → Produits: real products, specs, photos and datasheets (the 12 seeded products
      are examples with illustrative figures).
- [ ] Admin → Partenaires: confirm every client and brand may be named publicly.
- [ ] Admin → Textes du site → "Mentions légales et confidentialité": have the legal pages
      reviewed (retention period: 3 years is a proposal).
- [ ] Delete the "TEST — à supprimer" request in Demandes de devis.
- [ ] On a phone: open the site, install the app, save the catalog offline, switch to
      airplane mode and browse it.
- [ ] Google Search Console: add the domain and submit `https://your-domain/sitemap.xml`.
- [ ] Share the home page link on WhatsApp to check the preview image.

## After launch

- Content changes: everything is in the admin; each save updates the site immediately.
- Code changes: push to GitHub; Vercel redeploys. If a change affects many cached files,
  bump `VERSION` in `public/sw.js` so installed apps refresh their offline copy.
- Database health: `npm run db:status` (needs `.env.local`).
