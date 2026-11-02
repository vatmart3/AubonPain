"use client";

import { useEffect, useState } from "react";
import { money, rateLabel } from "@/lib/format";
import type { ApiErrorBody, ComptaView } from "@/lib/types";
import { useApi } from "./useApi";
import { Card, CountUp, CoverageBar, ErrorNotice, Fade, Loading } from "./ui";

export function ComptaPanel() {
  const [month, setMonth] = useState<string | null>(null);
  const { data, error, loading, reload } = useApi<ComptaView>(`/api/compta${month ? `?month=${month}` : ""}`, 5 * 60_000);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const incomplete = data && (!month || data.month === month) && !data.coverage.complete;
  useEffect(() => {
    if (!incomplete || loading) return;
    const t = setTimeout(reload, data?.coverage.throttled ? 8000 : 1500);
    return () => clearTimeout(t);
  }, [incomplete, loading, reload, data?.coverage.throttled, data?.coverage.analyzed]);

  const exportCsv = async () => {
    if (!data) return;
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch(`/api/export?month=${data.month}`, { cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
        setExportError(body?.error.message ?? "L'export n'a pas abouti.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `au-bon-pain_ventes-carte_${data.month}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      setExportError("Pas de connexion : l'export n'a pas pu être téléchargé.");
    } finally {
      setExporting(false);
    }
  };

  if (!data) return error ? <ErrorNotice error={error} onRetry={reload} /> : <Loading label="Préparation des comptes…" />;

  const cur = data.currency;

  return (
    <Fade busy={loading && month !== null && data.month !== month}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="relative">
            <span className="sr-only">Mois</span>
            <select
              value={month ?? data.month}
              onChange={(e) => setMonth(e.target.value)}
              className="appearance-none rounded-full border border-line bg-flour py-2 pl-4 pr-10 font-medium text-oven"
            >
              {data.months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-dust">
              ▾
            </span>
          </label>
          <button
            onClick={exportCsv}
            disabled={!data.coverage.complete || exporting}
            className="inline-flex items-center gap-2 rounded-full bg-oven px-4 py-2.5 text-sm font-semibold text-paper transition-opacity disabled:opacity-40"
          >
            <span aria-hidden>↓</span>
            {exporting ? "Préparation…" : "Export CSV du mois"}
          </button>
        </div>

        {error ? <ErrorNotice error={error} compact /> : null}
        {exportError ? (
          <p role="alert" className="rounded-2xl border border-down/25 bg-down/5 px-4 py-3 text-sm text-oven">
            {exportError}
          </p>
        ) : null}
        <CoverageBar coverage={data.coverage} />

        <Card tone="flour" className="px-5 py-6 sm:px-8 rise">
          <div className="eyebrow">{data.monthLabel}{data.isCurrentMonth ? " — en cours" : ""}</div>
          <div className="mt-3 text-sm text-bark">CA TTC (carte)</div>
          <CountUp value={data.net} format={(n) => money(n, cur)} className="figure-hero block text-[clamp(2.8rem,12vw,4.6rem)]" />
          <p className="mt-2 text-sm font-medium text-crust-deep">Paiements carte uniquement — hors espèces</p>

          <dl className="mt-6 divide-y divide-dashed divide-line border-t border-dashed border-line">
            {data.refunds > 0 ? (
              <>
                <Row label="Ventes encaissées" value={money(data.sales, cur)} sub={`${data.count} ventes`} />
                <Row label="Remboursements" value={`− ${money(data.refunds, cur)}`} />
                <Row label="CA TTC" value={money(data.net, cur)} strong />
              </>
            ) : (
              <Row label="CA TTC" value={money(data.net, cur)} sub={`${data.count} ventes`} strong />
            )}
            <Row label="dont TVA collectée" value={money(data.totalTva, cur)} />
            <Row label="Frais SumUp" value={`− ${money(data.fees, cur)}`} />
            <Row label="Net encaissé" value={money(data.netCashed, cur)} strong big />
          </dl>
        </Card>

        <Card className="px-5 py-5 sm:px-6 rise rise-1">
          <h2 className="font-display text-xl font-semibold">TVA collectée par taux</h2>
          {data.vat.length === 0 ? (
            <p className="mt-2 text-bark">Aucune vente analysée pour ce mois.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm tabular">
                <thead>
                  <tr className="text-left text-dust">
                    <th className="py-2 pr-3 font-medium">Taux</th>
                    <th className="py-2 px-3 text-right font-medium">HT</th>
                    <th className="py-2 px-3 text-right font-medium">TVA</th>
                    <th className="py-2 pl-3 text-right font-medium">TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-line">
                  {data.vat.map((v) => (
                    <tr key={String(v.rate)}>
                      <td className="py-2.5 pr-3 font-semibold">{rateLabel(v.rate)}</td>
                      <td className="py-2.5 px-3 text-right">{v.rate === null ? "—" : money(v.ht, cur)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{v.rate === null ? "—" : money(v.tva, cur)}</td>
                      <td className="py-2.5 pl-3 text-right">{money(v.ttc, cur)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-oven/30">
                    <td className="py-2.5 pr-3 font-semibold">Total</td>
                    <td className="py-2.5 px-3 text-right">{money(data.totalHt, cur)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{money(data.totalTva, cur)}</td>
                    <td className="py-2.5 pl-3 text-right">{money(data.vat.reduce((s, v) => s + v.ttc, 0), cur)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          {data.vat.some((v) => v.rate === null) ? (
            <p className="mt-3 text-sm text-dust">
              « Taux non renseigné » : ventes encaissées sans article du catalogue SumUp. Leur TVA est à ventiler par le comptable.
            </p>
          ) : null}
          <p className="mt-2 text-xs text-dust">TVA calculée sur les ventes, avant remboursements.</p>
        </Card>

        <details className="group rounded-[22px] border border-line/80 bg-paper px-5 py-4 sm:px-6 rise rise-2">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl font-semibold">
            Détail par jour
            <span aria-hidden className="text-dust transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm tabular">
              <thead>
                <tr className="text-left text-dust">
                  <th className="py-2 pr-3 font-medium">Jour</th>
                  <th className="py-2 px-2 text-right font-medium">Ventes</th>
                  <th className="py-2 px-2 text-right font-medium">CA TTC</th>
                  <th className="py-2 px-2 text-right font-medium">Frais</th>
                  <th className="py-2 pl-2 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-line">
                {data.days
                  .filter((d) => d.count > 0 || d.refunds > 0)
                  .map((d) => (
                    <tr key={d.date}>
                      <td className="py-2 pr-3">{d.date.slice(8)}/{d.date.slice(5, 7)}</td>
                      <td className="py-2 px-2 text-right">{d.count}</td>
                      <td className="py-2 px-2 text-right">{money(d.net, cur)}</td>
                      <td className="py-2 px-2 text-right text-bark">{money(d.fees, cur)}</td>
                      <td className="py-2 pl-2 text-right font-semibold">{money(d.net - d.fees, cur)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </Fade>
  );
}

function Row({ label, value, sub, strong, big }: { label: string; value: string; sub?: string; strong?: boolean; big?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <dt className={strong ? "font-semibold" : "text-bark"}>
        {label}
        {sub ? <span className="ml-2 text-xs text-dust">{sub}</span> : null}
      </dt>
      <dd className={`tabular ${strong ? "font-semibold" : ""} ${big ? "font-display text-2xl" : ""}`}>{value}</dd>
    </div>
  );
}
