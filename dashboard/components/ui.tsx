"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { money, pct } from "@/lib/format";
import type { ApiError } from "./useApi";
import type { Coverage } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Compteur animé                                                       */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Monte de 0 à la valeur à l'ouverture, puis glisse d'une valeur à l'autre
 * à chaque rafraîchissement ou changement de période.
 */
export function CountUp({
  value,
  format,
  duration = 1100,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const a = from.current;
    const b = value;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const v = a + (b - a) * eased;
      setShown(v);
      from.current = v;
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration, reduced]);

  return (
    <span className={className} aria-label={format(value)}>
      <span aria-hidden>{format(shown)}</span>
    </span>
  );
}

/** "1 234,56 €" avec les centimes en plus petit : lisible de loin. */
export function MoneyFigure({ value, currency = "EUR", className = "" }: { value: number; currency?: string; className?: string }) {
  return (
    <CountUp
      value={value}
      className={className}
      format={(n) => money(n, currency, 0)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Évolution                                                            */
/* ------------------------------------------------------------------ */

export function Delta({ value, suffix, size = "md" }: { value: number | null; suffix?: string; size?: "sm" | "md" | "lg" }) {
  if (value === null) {
    return <span className="text-dust text-sm">{suffix ? `Pas de comparaison ${suffix}` : "—"}</span>;
  }
  const up = value > 0.05;
  const down = value < -0.05;
  const color = up ? "text-up" : down ? "text-down" : "text-bark";
  const arrow = up ? "▲" : down ? "▼" : "■";
  const word = up ? "en hausse" : down ? "en baisse" : "stable";
  const sz = size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base";
  return (
    <span className={`${color} ${sz} inline-flex items-baseline gap-1.5 font-semibold`}>
      <span aria-hidden className="text-[0.7em] translate-y-[-0.05em]">
        {arrow}
      </span>
      <span>{pct(value)}</span>
      <span className="sr-only">{word}</span>
      {suffix ? <span className="font-normal text-bark">{suffix}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Mise en page                                                         */
/* ------------------------------------------------------------------ */

export function Card({ children, className = "", tone = "paper" }: { children: ReactNode; className?: string; tone?: "paper" | "flour" | "oven" }) {
  const bg =
    tone === "oven" ? "bg-oven text-paper" : tone === "flour" ? "bg-flour" : "bg-paper";
  return <section className={`${bg} rounded-[22px] border border-line/80 ${className}`}>{children}</section>;
}

export function Stat({ label, children, sub }: { label: string; children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 font-display text-[1.9rem] leading-none tracking-tight" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 72' }}>
        {children}
      </div>
      {sub ? <div className="mt-1.5 text-sm text-bark">{sub}</div> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-flour p-1 gap-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
              active ? "bg-oven text-paper" : "text-bark hover:bg-wheat/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* États : erreur, chargement, progression                              */
/* ------------------------------------------------------------------ */

export function ErrorNotice({ error, onRetry, compact = false }: { error: ApiError; onRetry?: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-down/25 bg-down/5 px-4 py-3 text-sm">
        <span aria-hidden className="mt-0.5 text-down">●</span>
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-oven">{error.title}.</span>{" "}
          <span className="text-bark">Derniers chiffres affichés — {error.message.charAt(0).toLowerCase() + error.message.slice(1)}</span>
        </div>
      </div>
    );
  }
  return (
    <Card className="px-6 py-8 text-center rise" tone="flour">
      <div aria-hidden className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-wheat text-crust-deep font-display text-2xl">
        !
      </div>
      <h2 className="font-display text-2xl font-semibold">{error.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-bark">{error.message}</p>
      {error.hint ? <p className="mx-auto mt-3 max-w-md text-sm text-dust">{error.hint}</p> : null}
      {onRetry ? (
        <button onClick={onRetry} className="mt-6 rounded-full bg-oven px-5 py-2.5 text-sm font-semibold text-paper">
          Réessayer
        </button>
      ) : null}
    </Card>
  );
}

export function Loading({ label = "Lecture des ventes…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-24 text-dust" role="status">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-crust live-dot" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

/** Progression de l'analyse des tickets (produits, TVA, frais). */
export function CoverageBar({ coverage }: { coverage: Coverage }) {
  if (coverage.complete) return null;
  const p = coverage.total ? Math.round((coverage.analyzed / coverage.total) * 100) : 100;
  return (
    <div className="rounded-2xl border border-line bg-flour px-4 py-3" role="status">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">Lecture des tickets en cours…</span>
        <span className="tabular text-bark">
          {coverage.analyzed} / {coverage.total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-wheat">
        <div className="h-full rounded-full bg-crust transition-[width] duration-700 ease-out" style={{ width: `${p}%` }} />
      </div>
      <p className="mt-2 text-xs text-dust">
        {coverage.throttled
          ? "SumUp demande de ralentir : la lecture reprend toute seule dans quelques secondes."
          : "Première ouverture de cette période : chaque ticket est lu une fois puis gardé en mémoire. Les chiffres se complètent automatiquement."}
      </p>
    </div>
  );
}

/** Garde les chiffres précédents à l'écran, atténués, pendant un changement de période. */
export function Fade({ busy, children }: { busy: boolean; children: ReactNode }) {
  return <div className={`transition-opacity duration-300 ${busy ? "opacity-55" : "opacity-100"}`}>{children}</div>;
}
