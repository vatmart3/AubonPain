"use client";

/** Filet de sécurité : jamais d'écran blanc, même en cas de bug d'affichage. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
      <div>
        <p className="font-display text-3xl font-semibold">Oups, un pépin d&apos;affichage</p>
        <p className="mt-3 text-bark">Les ventes ne sont pas perdues : elles restent chez SumUp. Rechargez l&apos;écran.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-oven px-5 py-2.5 text-sm font-semibold text-paper">
          Recharger
        </button>
      </div>
    </main>
  );
}
