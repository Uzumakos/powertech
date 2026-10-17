import type { Metadata } from "next";
import Link from "next/link";
import { BoltMark } from "@/components/site/logo";

export const metadata: Metadata = { title: "Configuration requise" };

const steps = [
  "Créez un projet gratuit sur supabase.com.",
  "Dans l'éditeur SQL de Supabase, exécutez dans l'ordre les fichiers du dossier supabase/migrations (0001, 0002, 0003…).",
  "Copiez .env.example en .env.local et renseignez l'URL du projet, la clé anon et la clé service_role (Project Settings → API).",
  "Lancez npm run db:seed pour charger le contenu de départ.",
  "Créez votre compte dans Supabase → Authentication → Users, puis donnez-lui l'accès admin dans l'éditeur SQL : insert into public.admins (user_id) select id from auth.users where email = 'vous@exemple.com';",
  "Redémarrez le serveur, puis connectez-vous.",
];

export default function ConfigurationPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-[var(--radius-frame)] border border-line bg-white p-7 shadow-float sm:p-10">
        <BoltMark />
        <h1 className="wide mt-6 text-2xl font-bold">Connectez la base de données</h1>
        <p className="mt-3 leading-relaxed">
          L&apos;administration a besoin de Supabase pour enregistrer le contenu et recevoir les demandes. En attendant, le
          site public fonctionne avec le contenu de démonstration.
        </p>
        <ol className="mt-6 grid gap-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{index + 1}</span>
              <span className="pt-0.5 leading-relaxed text-ink">{step}</span>
            </li>
          ))}
        </ol>
        <Link href="/admin/login" className="btn btn-volt mt-8">
          J&apos;ai terminé, me connecter
        </Link>
      </div>
    </main>
  );
}
