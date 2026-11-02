"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import type { ProductsView } from "@/lib/types";
import { RankedBars } from "./charts";
import { useApi } from "./useApi";
import { Card, CoverageBar, ErrorNotice, Fade, Loading, Segmented } from "./ui";

type Range = "today" | "7d" | "30d" | "month";

export function ProductsPanel() {
  const [range, setRange] = useState<Range>("7d");
  const [by, setBy] = useState<"qty" | "revenue">("qty");
  const { data, error, loading, reload } = useApi<ProductsView>(`/api/products?range=${range}`, 5 * 60_000);

  // Tant que tous les tickets ne sont pas lus, on relance automatiquement.
  const incomplete = data && data.range === range && !data.coverage.complete;
  useEffect(() => {
    if (!incomplete || loading) return;
    const t = setTimeout(reload, data?.coverage.throttled ? 8000 : 1500);
    return () => clearTimeout(t);
  }, [incomplete, loading, reload, data?.coverage.throttled, data?.coverage.analyzed]);

  const qty = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} vendu${n >= 2 ? "s" : ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Période"
          value={range}
          onChange={setRange}
          options={[
            { value: "today", label: "Jour" },
            { value: "7d", label: "7 j" },
            { value: "30d", label: "30 j" },
            { value: "month", label: "Mois" },
          ]}
        />
        <Segmented
          label="Classer par"
          value={by}
          onChange={setBy}
          options={[
            { value: "qty", label: "Quantité" },
            { value: "revenue", label: "CA" },
          ]}
        />
      </div>

      {!data ? (
        error ? (
          <ErrorNotice error={error} onRetry={reload} />
        ) : (
          <Loading label="Lecture des tickets…" />
        )
      ) : (
        <Fade busy={loading && data.range !== range}>
          {error ? (
            <div className="mb-4">
              <ErrorNotice error={error} compact />
            </div>
          ) : null}
          <div className="space-y-4">
            <CoverageBar coverage={data.coverage} />

            {data.coverage.total === 0 ? (
              <Card tone="flour" className="px-6 py-8 text-center">
                <p className="font-display text-xl font-semibold">Aucune vente carte sur la période</p>
                <p className="mt-1 text-bark">{data.rangeLabel}</p>
              </Card>
            ) : data.salesWithProducts === 0 && data.coverage.analyzed > 0 ? (
              <NoCatalogue />
            ) : (
              <Card className="px-5 py-5 sm:px-6 rise">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold">
                    Top 10 {by === "qty" ? "en quantité" : "en chiffre d'affaires"}
                  </h2>
                  <span className="text-xs text-dust">{data.rangeLabel}</span>
                </div>
                <RankedBars
                  items={by === "qty" ? data.byQty : data.byRevenue}
                  value={(i) => (by === "qty" ? i.qty : i.revenue)}
                  format={(n) => (by === "qty" ? n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : money(n, data.currency, 0))}
                  secondary={(i) => (by === "qty" ? money(i.revenue, data.currency, 0) : qty(i.qty))}
                />
                <p className="mt-5 text-xs text-dust">
                  {data.distinct} article{data.distinct > 1 ? "s" : ""} différent{data.distinct > 1 ? "s" : ""} vendus ·{" "}
                  {data.salesWithProducts} ticket{data.salesWithProducts > 1 ? "s" : ""} avec articles · paiements carte uniquement
                </p>
              </Card>
            )}
          </div>
        </Fade>
      )}
    </div>
  );
}

function NoCatalogue() {
  return (
    <Card tone="flour" className="px-6 py-7 rise">
      <div aria-hidden className="mb-3 font-display text-4xl">🥖</div>
      <h2 className="font-display text-2xl font-semibold">Les articles ne sont pas enregistrés</h2>
      <p className="mt-2 text-bark">
        Les ventes sont bien là, mais elles ont été encaissées en tapant un montant, sans choisir d&apos;article. SumUp ne sait donc pas
        si c&apos;était une baguette ou un flan.
      </p>
      <div className="mt-4 rounded-2xl bg-cream px-4 py-4">
        <p className="font-semibold">Pour voir vos meilleures ventes ici :</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-bark">
          <li>Dans l&apos;application SumUp, ouvrez « Articles » et créez vos produits avec leur prix (et leur taux de TVA).</li>
          <li>À l&apos;encaissement, touchez les articles au lieu de taper le montant.</li>
          <li>Les nouvelles ventes apparaîtront automatiquement dans ce classement.</li>
        </ol>
      </div>
      <p className="mt-3 text-sm text-dust">Bonus : la TVA de l&apos;onglet Compta sera alors ventilée automatiquement par taux.</p>
    </Card>
  );
}
