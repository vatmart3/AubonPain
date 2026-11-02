import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion — Ventes Au Bon Pain" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <p className="eyebrow">Le cahier de caisse</p>
      <h1 className="mt-2 font-display text-[2.8rem] font-semibold leading-[0.95] tracking-tight">
        Au Bon Pain<span className="text-crust">.</span>
      </h1>
      <p className="mt-3 text-bark">Les ventes du jour, en direct de SumUp.</p>
      <LoginForm />
      <p className="mt-10 text-xs text-dust">Session gardée 30 jours sur cet appareil.</p>
    </main>
  );
}
