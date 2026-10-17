import type { Metadata } from "next";
import { Suspense } from "react";
import { BoltMark } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Connexion" };

async function LoginWithNotice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { erreur } = await searchParams;
  const notice = erreur === "acces" ? "Ce compte n'a pas accès à l'administration. Demandez à un administrateur de l'ajouter." : undefined;
  return <LoginForm notice={notice} />;
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-frame)] border border-line bg-white p-7 shadow-float sm:p-10">
        <div className="flex items-center gap-3">
          <BoltMark />
          <div className="leading-tight">
            <p className="wide font-extrabold text-crimson">Powertech</p>
            <p className="text-sm text-muted">Administration du site</p>
          </div>
        </div>
        <h1 className="wide mt-8 text-2xl font-bold">Connexion</h1>
        <div className="mt-6">
          <Suspense fallback={<LoginForm />}>
            <LoginWithNotice searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
