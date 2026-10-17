"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { signIn, type FormState } from "@/lib/admin/actions";
import { inputClass } from "./fields";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signIn, {});
  const message = state.message ?? notice;

  return (
    <form action={formAction} className="grid gap-5">
      {message && (
        <p role="alert" className="flex gap-2.5 rounded-[var(--radius-field)] border border-crimson/30 bg-crimson/[0.06] p-3.5 text-[0.9375rem] text-crimson-deep">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          {message}
        </p>
      )}
      <div>
        <label htmlFor="login-email" className="text-sm font-semibold text-ink">
          E-mail
        </label>
        <input id="login-email" name="email" type="email" autoComplete="username" required className={`${inputClass} mt-1.5 h-12`} />
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-semibold text-ink">
          Mot de passe
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`${inputClass} mt-1.5 h-12`}
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-lg btn-volt disabled:opacity-70">
        <LogIn className="size-4" />
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
