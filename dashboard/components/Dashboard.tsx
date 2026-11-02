"use client";

import { useEffect, useState, type ReactNode } from "react";
import { longDate } from "@/lib/format";
import type { StatusView } from "@/lib/types";
import { AffluencePanel } from "./AffluencePanel";
import { ComptaPanel } from "./ComptaPanel";
import { PeriodPanel } from "./PeriodPanel";
import { ProductsPanel } from "./ProductsPanel";
import { TodayPanel } from "./TodayPanel";
import { useApi } from "./useApi";
import { ErrorNotice, Loading } from "./ui";

type Tab = "jour" | "periode" | "affluence" | "produits" | "compta";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "jour", label: "Aujourd'hui", icon: <IconSun /> },
  { id: "periode", label: "Semaine", icon: <IconBars /> },
  { id: "affluence", label: "Affluence", icon: <IconGrid /> },
  { id: "produits", label: "Produits", icon: <IconLoaf /> },
  { id: "compta", label: "Compta", icon: <IconLedger /> },
];

function tabFromHash(): Tab {
  const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
  return (TABS.find((t) => t.id === h)?.id ?? "jour") as Tab;
}

export function Dashboard() {
  const status = useApi<StatusView>("/api/status", 30 * 60_000);
  const [tab, setTab] = useState<Tab>("jour");

  useEffect(() => {
    setTab(tabFromHash());
    const on = () => setTab(tabFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", t === "jour" ? window.location.pathname : `#${t}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  // Connexion SumUp (GET /v0.1/me) : tant qu'elle n'est pas validée, rien d'autre ne s'affiche.
  const connection = !status.data ? (status.error ? <ErrorNotice error={status.error} onRetry={status.reload} /> : <Loading label="Connexion à SumUp…" />) : null;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[880px] px-4 pb-32 pt-[max(env(safe-area-inset-top),16px)] sm:px-6 md:pb-16">
      <header className="flex items-start justify-between gap-4 pb-4 pt-2">
        <div className="min-w-0">
          <p className="font-display text-[1.65rem] font-semibold leading-none tracking-tight">
            Au Bon Pain<span className="text-crust">.</span>
          </p>
          <p className="mt-1.5 flex items-center gap-2 truncate text-sm text-dust">
            {status.data ? (
              <>
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-up live-dot" />
                <span className="truncate">
                  {status.data.merchantName} · {longDate(todayLocal(status.data.timeZone))}
                </span>
              </>
            ) : (
              <span>Sète</span>
            )}
          </p>
        </div>
        <button onClick={logout} className="shrink-0 rounded-full px-3 py-1.5 text-sm text-dust hover:bg-wheat/60 hover:text-oven">
          Sortir
        </button>
      </header>

      {status.data?.keyWarning ? (
        <p className="mb-4 rounded-2xl border border-line bg-flour px-4 py-3 text-sm text-bark">{status.data.keyWarning}</p>
      ) : null}

      {/* Onglets : en haut sur grand écran */}
      <nav aria-label="Sections" className="sticky top-0 z-20 -mx-4 mb-5 hidden bg-cream/90 px-4 py-2 backdrop-blur md:block">
        <div className="flex gap-1 rounded-full border border-line bg-flour p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-oven text-paper" : "text-bark hover:bg-wheat/60"
              }`}
            >
              {t.id === "periode" ? "Semaine / Mois" : t.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {connection ?? (
          <div key={tab}>
            {tab === "jour" && <TodayPanel />}
            {tab === "periode" && <PeriodPanel />}
            {tab === "affluence" && <AffluencePanel />}
            {tab === "produits" && <ProductsPanel />}
            {tab === "compta" && <ComptaPanel />}
          </div>
        )}
      </main>

      {/* Onglets : barre du bas sur téléphone, à portée de pouce */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
      >
        <div className="mx-auto grid max-w-[560px] grid-cols-5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pb-1.5 pt-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-oven" : "text-dust"
                }`}
              >
                <span
                  className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${active ? "bg-wheat text-crust-deep" : ""}`}
                >
                  {t.icon}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function todayLocal(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/* Icônes dessinées à la main, trait 1,75 px */
function Svg({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}
function IconSun() {
  return (
    <Svg>
      <circle cx="12" cy="13" r="4" />
      <path d="M12 4v2M4.9 7.9l1.4 1.4M19.1 7.9l-1.4 1.4M3 19h18M7 16h10" />
    </Svg>
  );
}
function IconBars() {
  return (
    <Svg>
      <path d="M5 20V12M10 20V7M15 20v-6M20 20V4" />
    </Svg>
  );
}
function IconGrid() {
  return (
    <Svg>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </Svg>
  );
}
function IconLoaf() {
  return (
    <Svg>
      <path d="M4 15c0-4.4 3.6-8 8-8s8 3.6 8 8v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1Z" />
      <path d="M9 10.5l-1.2 2.5M12.6 10l-1.2 2.6M16.2 10.7 15 13.2" />
    </Svg>
  );
}
function IconLedger() {
  return (
    <Svg>
      <path d="M6 3h10l3 3v15H6z" />
      <path d="M9 9h7M9 13h7M9 17h4" />
    </Svg>
  );
}
