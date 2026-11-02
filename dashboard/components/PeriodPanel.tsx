"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import type { PeriodView } from "@/lib/types";
import { DailyBars } from "./charts";
import { useApi } from "./useApi";
import { Card, CountUp, Delta, ErrorNotice, Fade, Loading, MoneyFigure, Segmented, Stat } from "./ui";

export function PeriodPanel() {
  const [kind, setKind] = useState<"week" | "month">("week");
  const [offset, setOffset] = useState(0);
  const { data, error, loading, reload } = useApi<PeriodView>(`/api/period?kind=${kind}&offset=${offset}`, 60_000);

  const switchKind = (k: "week" | "month") => {
    setKind(k);
    setOffset(0);
  };

  const stale = data && (data.kind !== kind || data.offset !== offset);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Segmented
          label="Période"
          value={kind}
          onChange={switchKind}
          options={[
            { value: "week", label: "Semaine" },
            { value: "month", label: "Mois" },
          ]}
        />
        <div className="flex items-center gap-1">
          <NavButton label={kind === "week" ? "Semaine précédente" : "Mois précédent"} onClick={() => setOffset((o) => o - 1)}>
            ‹
          </NavButton>
          <NavButton
            label={kind === "week" ? "Semaine suivante" : "Mois suivant"}
            disabled={offset >= 0}
            onClick={() => setOffset((o) => Math.min(0, o + 1))}
          >
            ›
          </NavButton>
        </div>
      </div>

      {!data ? (
        error ? (
          <ErrorNotice error={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : (
        <Fade busy={Boolean(stale && loading)}>
          {error ? (
            <div className="mb-4">
              <ErrorNotice error={error} compact />
            </div>
          ) : null}
          <div className="space-y-4">
            <Card tone="flour" className="px-5 py-6 sm:px-8 rise">
              <div className="eyebrow">{data.title}</div>
              <p className="mt-0.5 text-sm text-dust">{data.subtitle}</p>
              <MoneyFigure value={data.net} currency={data.currency} className="figure-hero mt-4 block text-[clamp(3.2rem,14vw,5.5rem)]" />
              <p className="mt-2 text-sm font-medium text-crust-deep">CA carte — hors espèces</p>
              <div className="mt-4 border-t border-dashed border-line pt-3">
                <Delta value={data.deltaPct} size="lg" />
                <p className="mt-1 text-bark">
                  {data.compareLabel} ({money(data.prevNet, data.currency, 0)})
                </p>
              </div>
            </Card>

            <Card className="px-4 py-5 sm:px-6 rise rise-1">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">CA par jour</h2>
                <span className="flex items-center gap-3 text-xs text-dust">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[3px] bg-oven" /> meilleur
                  </span>
                  {data.worst ? (
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[3px] bg-crust/55" /> plus calme
                    </span>
                  ) : null}
                  {data.days.some((d) => d.isToday) ? (
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[3px] bg-honey" /> en cours
                    </span>
                  ) : null}
                </span>
              </div>
              <DailyBars
                days={data.days}
                currency={data.currency}
                prevLabel={kind === "week" ? "Semaine d'avant" : "Mois d'avant"}
                bestDate={data.best?.date}
                worstDate={data.worst?.date}
              />
            </Card>

            <div className="grid grid-cols-2 gap-3 rise rise-2">
              <Card className="px-4 py-4 sm:px-6">
                <Stat label="Meilleur jour" sub={data.best ? data.best.label : "—"}>
                  {data.best ? money(data.best.net, data.currency, 0) : "—"}
                </Stat>
              </Card>
              <Card className="px-4 py-4 sm:px-6">
                <Stat label="Jour le plus calme" sub={data.worst ? data.worst.label : "Pas assez de jours"}>
                  {data.worst ? money(data.worst.net, data.currency, 0) : "—"}
                </Stat>
              </Card>
              <Card className="px-4 py-4 sm:px-6">
                <Stat label="Clients" sub={`${data.openDays} jour${data.openDays > 1 ? "s" : ""} ouvert${data.openDays > 1 ? "s" : ""}`}>
                  <CountUp value={data.count} format={(n) => Math.round(n).toLocaleString("fr-FR")} />
                </Stat>
              </Card>
              <Card className="px-4 py-4 sm:px-6">
                <Stat label="Moyenne par jour" sub={`Panier moyen ${money(data.avgBasket, data.currency)}`}>
                  <CountUp value={data.avgPerOpenDay} format={(n) => money(n, data.currency, 0)} />
                </Stat>
              </Card>
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
}

function NavButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-flour font-display text-2xl leading-none text-oven transition-colors hover:bg-wheat disabled:opacity-35 disabled:hover:bg-flour"
    >
      <span aria-hidden className="-translate-y-px">
        {children}
      </span>
    </button>
  );
}
