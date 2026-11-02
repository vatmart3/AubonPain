"use client";

import { useState } from "react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.replace("/");
        return;
      }
      const body = (await res.json().catch(() => null)) as { error?: { title?: string; message?: string } } | null;
      setError(body?.error ? `${body.error.title}. ${body.error.message ?? ""}` : "Connexion impossible.");
    } catch {
      setError("Pas de connexion Internet.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-3">
      <label htmlFor="password" className="block text-sm font-medium">
        Mot de passe
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-2xl border border-line bg-flour px-4 py-3.5 text-lg outline-none focus:border-crust"
      />
      {error ? (
        <p role="alert" className="text-sm text-down">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full rounded-full bg-oven py-3.5 font-semibold text-paper transition-opacity disabled:opacity-50"
      >
        {busy ? "Ouverture…" : "Ouvrir le cahier"}
      </button>
    </form>
  );
}
