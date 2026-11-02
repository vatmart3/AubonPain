"use client";

import { useState } from "react";
import { shortDate, WEEKDAYS_LONG } from "@/lib/format";
import type { AffluenceView } from "@/lib/types";
import { Heatmap } from "./charts";
import { useApi } from "./useApi";
import { Card, ErrorNotice, Fade, Loading, Segmented } from "./ui";

export function AffluencePanel() {
  const [weeks, setWeeks] = useState<"4" | "8" | "12">("4");
  const [metric, setMetric] = useState<"clients" | "sales">("clients");
  const { data, error, loading, reload } = useApi<AffluenceView>(`/api/affluence?weeks=${weeks}`, 10 * 60_000);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Sur combien de semaines"
          value={weeks}
          onChange={setWeeks}
          options={[
            { value: "4", label: "4 sem." },
            { value: "8", label: "8 sem." },
            { value: "12", label: "12 sem." },
          ]}
        />
        <Segmented
          label="Mesure"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "clients", label: "Clients" },
            { value: "sales", label: "Ventes €" },
          ]}
        />
      </div>

      {!data ? (
        error ? (
          <ErrorNotice error={error} onRetry={reload} />
        ) : (
          <Loading label="Calcul des rushs…" />
        )
      ) : (
        <Fade busy={loading && String(data.weeks) !== weeks}>
          {error ? (
            <div className="mb-4">
              <ErrorNotice error={error} compact />
            </div>
          ) : null}
          <div className="space-y-4">
            <Card tone="oven" className="px-5 py-6 sm:px-8 rise">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-honey">Le gros rush</div>
              {data.peak ? (
                <>
                  <p className="mt-2 font-display text-[clamp(2rem,9vw,3.2rem)] leading-[1.02] font-semibold capitalize">
                    {WEEKDAYS_LONG[data.peak.weekday]}, {data.peak.hour}h–{data.peak.hour + 1}h
                  </p>
                  <p className="mt-2 text-wheat">
                    environ <span className="font-semibold text-paper">{Math.round(data.peak.clients)} clients</span> en une heure, en
                    moyenne.
                    {data.busiestDay ? (
                      <>
                        {" "}
                        Journée la plus chargée : <span className="font-semibold text-paper">{WEEKDAYS_LONG[data.busiestDay.weekday]}</span>.
                      </>
                    ) : null}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-wheat">Pas encore assez de ventes sur la période pour repérer les rushs.</p>
              )}
            </Card>

            <Card className="px-3 py-5 sm:px-6 rise rise-1">
              <div className="mb-3 px-1">
                <h2 className="font-display text-xl font-semibold">
                  {metric === "clients" ? "Clients par heure" : "Ventes par heure"}
                </h2>
                <p className="text-sm text-dust">
                  Moyenne par jour d&apos;ouverture · {shortDate(data.from)} → {shortDate(data.to)}
                  <br />
                  Les jours hachurés sont fermés.
                </p>
              </div>
              <Heatmap view={data} metric={metric} />
            </Card>

            <p className="px-1 text-sm text-dust">
              Pour la fournée : les cases les plus foncées sont les heures où il faut le plus de pain en rayon. Paiements carte
              uniquement — les clients payant en espèces n&apos;apparaissent pas.
            </p>
          </div>
        </Fade>
      )}
    </div>
  );
}
