"use client";

import { useEffect, useState } from "react";
import { money, weekdayName } from "@/lib/format";
import type { TodayView } from "@/lib/types";
import { HourlyChart } from "./charts";
import { useApi } from "./useApi";
import { Card, CountUp, Delta, ErrorNotice, Loading, MoneyFigure, Stat } from "./ui";

export function TodayPanel() {
  const { data, error, reload } = useApi<TodayView>("/api/today", 60_000);

  if (!data) return error ? <ErrorNotice error={error} onRetry={reload} /> : <Loading />;

  const lastWeekDay = weekdayName(data.lastWeek.date);
  const sameDayLabel = `${lastWeekDay} dernier`;

  return (
    <div className="space-y-4">
      {error ? <ErrorNotice error={error} compact /> : null}

      {/* Le chiffre du jour */}
      <Card tone="flour" className="ticket-edge relative overflow-hidden px-5 pb-9 pt-6 sm:px-8 sm:pt-8 rise">
        <div className="eyebrow">CA carte du jour</div>
        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
          <MoneyFigure
            value={data.net}
            currency={data.currency}
            className="figure-hero text-[clamp(4rem,19vw,7.5rem)] text-oven"
          />
        </div>
        <p className="mt-3 text-sm font-medium text-crust-deep">Paiements carte uniquement — hors espèces</p>
        {data.refunds > 0 ? (
          <p className="mt-1 text-sm text-bark">
            Remboursements déjà déduits : {money(data.refunds, data.currency)}
          </p>
        ) : null}

        <div className="mt-6 border-t border-dashed border-line pt-4">
          <Delta value={data.deltaPct} size="lg" />
          <p className="mt-1 text-bark">
            {data.deltaPct === null ? (
              <>Pas de ventes {sameDayLabel} à la même heure pour comparer.</>
            ) : (
              <>
                par rapport à <span className="font-semibold text-oven">{sameDayLabel}</span> à la même heure (
                {money(data.lastWeek.netSameTime, data.currency, 0)})
              </>
            )}
          </p>
          <p className="mt-1 text-sm text-dust">
            {sameDayLabel.charAt(0).toUpperCase() + sameDayLabel.slice(1)}, sur toute la journée :{" "}
            {money(data.lastWeek.netFullDay, data.currency, 0)}
          </p>
        </div>
      </Card>

      {/* Clients et panier */}
      <div className="grid grid-cols-2 gap-3 rise rise-1">
        <Card className="px-4 py-4 sm:px-6 sm:py-5">
          <Stat label="Clients" sub={<Delta value={data.countDeltaPct} size="sm" />}>
            <CountUp value={data.count} format={(n) => Math.round(n).toLocaleString("fr-FR")} />
          </Stat>
        </Card>
        <Card className="px-4 py-4 sm:px-6 sm:py-5">
          <Stat label="Panier moyen" sub={<Delta value={data.basketDeltaPct} size="sm" />}>
            <CountUp value={data.avgBasket} format={(n) => money(n, data.currency)} />
          </Stat>
        </Card>
      </div>

      {/* Heure par heure */}
      <Card className="px-4 py-5 sm:px-6 rise rise-2">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Heure par heure</h2>
          <span className="text-xs text-dust">ventes carte</span>
        </div>
        <HourlyChart data={data.hours} lastWeekLabel={sameDayLabel} currency={data.currency} />
      </Card>

      <CashCard date={data.date} cardNet={data.net} currency={data.currency} />

      {data.recent.length > 0 ? (
        <Card className="px-5 py-5 sm:px-6 rise rise-3">
          <h2 className="font-display text-xl font-semibold">Dernières ventes</h2>
          <ul className="mt-3 divide-y divide-dashed divide-line">
            {data.recent.map((r, i) => (
              <li key={`${r.time}-${i}`} className="flex items-baseline gap-3 py-2.5">
                <span className="w-12 shrink-0 tabular text-sm text-dust">{r.time}</span>
                <span className="min-w-0 flex-1 truncate text-bark">{r.label}</span>
                <span className={`tabular font-semibold ${r.kind === "refund" ? "text-down" : ""}`}>
                  {r.kind === "refund" ? "−" : ""}
                  {money(r.amount, data.currency)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Espèces saisies à la main (stockées sur ce téléphone uniquement)     */
/* ------------------------------------------------------------------ */

function cashKey(date: string) {
  return `abp:cash:${date}`;
}

function readCash(date: string): string {
  try {
    return localStorage.getItem(cashKey(date)) ?? "";
  } catch {
    return "";
  }
}

function CashCard({ date, cardNet, currency }: { date: string; cardNet: number; currency: string }) {
  const [raw, setRaw] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRaw(readCash(date));
    setReady(true);
  }, [date]);

  const save = (v: string) => {
    setRaw(v);
    try {
      if (v.trim() === "") localStorage.removeItem(cashKey(date));
      else localStorage.setItem(cashKey(date), v);
    } catch {
      /* navigation privée : la saisie reste valable tant que la page est ouverte */
    }
  };

  const cash = Number.parseFloat(raw.replace(/\s/g, "").replace(",", "."));
  const hasCash = Number.isFinite(cash) && cash > 0;

  return (
    <Card className="px-5 py-5 sm:px-6 rise rise-3">
      <label htmlFor="cash" className="font-display text-xl font-semibold">
        Espèces du jour
      </label>
      <p className="mt-0.5 text-sm text-dust">Facultatif — gardé sur ce téléphone seulement.</p>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-line bg-flour px-4 focus-within:border-crust">
        <input
          id="cash"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={ready ? raw : ""}
          onChange={(e) => save(e.target.value.replace(/[^0-9.,\s]/g, ""))}
          className="w-full bg-transparent py-3 font-display text-2xl outline-none placeholder:text-ghost tabular"
        />
        <span className="font-display text-2xl text-dust">€</span>
      </div>
      {hasCash ? (
        <div className="mt-4 flex items-baseline justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
          <span className="text-sm text-bark">Total du jour, carte + espèces</span>
          <span className="font-display text-2xl font-semibold">{money(cardNet + cash, currency)}</span>
        </div>
      ) : null}
    </Card>
  );
}
