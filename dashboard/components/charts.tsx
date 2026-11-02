"use client";

import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { money, WEEKDAYS_LONG, WEEKDAYS_SHORT } from "@/lib/format";
import type { AffluenceView, PeriodDay, TodayView } from "@/lib/types";

const C = {
  crust: "#b8732e",
  honey: "#d9a35b",
  oven: "#2a1b12",
  ghost: "#b4a28c",
  grid: "#e7dac6",
  axis: "#8c7663",
  paper: "#fbf6ee",
};

const HEAT = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)", "var(--heat-5)", "var(--heat-6)"];

function compactEuro(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)} k€`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",").replace(",0", "")} k€`;
  return `${Math.round(n)} €`;
}

function TipBox({ title, rows }: { title: string; rows: { label: string; value: string; swatch?: string; line?: boolean }[] }) {
  return (
    <div className="rounded-xl border border-line bg-flour px-3 py-2 text-sm shadow-[0_6px_24px_-12px_rgba(42,27,18,0.35)]">
      <div className="mb-1 font-semibold">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-bark">
            {r.swatch ? (
              <span
                aria-hidden
                className={r.line ? "inline-block h-[2px] w-3 rounded" : "inline-block h-2.5 w-2.5 rounded-[3px]"}
                style={{ background: r.swatch }}
              />
            ) : null}
            {r.label}
          </span>
          <span className="tabular font-medium">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aujourd'hui : ventes heure par heure                                 */
/* ------------------------------------------------------------------ */

export function HourlyChart({ data, lastWeekLabel, currency }: { data: TodayView["hours"]; lastWeekLabel: string; currency: string }) {
  const rows = data.map((h) => ({ ...h, label: `${h.hour}h` }));
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-bark">
        <span className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: C.crust }} />
          Aujourd&apos;hui
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-[2px] w-4 rounded" style={{ background: C.ghost }} />
          {lastWeekLabel}
        </span>
        {rows.some((r) => r.partial !== null) ? (
          <span className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: C.crust }} />
            heure en cours
          </span>
        ) : null}
      </div>
      <div className="h-[220px] w-full sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="todayFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.crust} stopOpacity={0.22} />
                <stop offset="100%" stopColor={C.crust} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: C.grid }}
              tick={{ fill: C.axis, fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={14}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: C.axis, fontSize: 12 }}
              tickFormatter={compactEuro}
              width={52}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: C.ghost, strokeWidth: 1 }}
              content={(p: TooltipContentProps<ValueType, NameType>) => {
                if (!p.active || !p.payload?.length) return null;
                const row = p.payload[0].payload as (typeof rows)[number];
                return (
                  <TipBox
                    title={`${row.hour}h – ${row.hour + 1}h`}
                    rows={[
                      ...(row.today !== null ? [{ label: "Aujourd'hui", value: money(row.today, currency), swatch: C.crust }] : []),
                      ...(row.partial !== null ? [{ label: "Heure en cours", value: money(row.partial, currency), swatch: C.crust }] : []),
                      { label: lastWeekLabel, value: money(row.lastWeek, currency), swatch: C.ghost, line: true },
                    ]}
                  />
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="lastWeek"
              stroke={C.ghost}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: C.ghost, stroke: C.paper, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={700}
            />
            <Area
              type="monotone"
              dataKey="today"
              stroke={C.crust}
              strokeWidth={2.5}
              fill="url(#todayFill)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 5, fill: C.crust, stroke: C.paper, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={900}
            />
            <Line
              dataKey="partial"
              stroke="none"
              legendType="none"
              isAnimationActive={false}
              dot={{ r: 4.5, fill: C.paper, stroke: C.crust, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: C.paper, stroke: C.crust, strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Semaine / Mois : CA par jour                                         */
/* ------------------------------------------------------------------ */

export function DailyBars({
  days,
  currency,
  prevLabel,
  bestDate,
  worstDate,
}: {
  days: PeriodDay[];
  currency: string;
  prevLabel: string;
  bestDate?: string;
  worstDate?: string;
}) {
  const rows = days.map((d) => ({ ...d, value: d.isFuture ? null : d.net }));
  const many = days.length > 10;
  return (
    <div className="h-[230px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: -8 }} barCategoryGap={many ? "18%" : "28%"}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis
            dataKey="short"
            tickLine={false}
            axisLine={{ stroke: C.grid }}
            tick={{ fill: C.axis, fontSize: 12 }}
            interval={many ? "preserveStartEnd" : 0}
            minTickGap={many ? 6 : 0}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: C.axis, fontSize: 12 }} tickFormatter={compactEuro} width={52} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(184,115,46,0.08)" }}
            content={(p: TooltipContentProps<ValueType, NameType>) => {
              if (!p.active || !p.payload?.length) return null;
              const d = p.payload[0].payload as PeriodDay;
              if (d.isFuture) return null;
              return (
                <TipBox
                  title={d.label + (d.isToday ? " (en cours)" : "")}
                  rows={[
                    { label: "CA carte", value: money(d.net, currency), swatch: C.crust },
                    { label: "Clients", value: String(d.count) },
                    ...(d.prevNet !== null ? [{ label: prevLabel, value: money(d.prevNet, currency) }] : []),
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive animationDuration={700}>
            {rows.map((d) => (
              <Cell
                key={d.date}
                fill={d.isToday ? C.honey : d.date === bestDate ? C.oven : C.crust}
                fillOpacity={d.date === worstDate ? 0.55 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Affluence : jour × heure                                             */
/* ------------------------------------------------------------------ */

export function Heatmap({ view, metric }: { view: AffluenceView; metric: "clients" | "sales" }) {
  const hours = useMemo(() => Array.from({ length: view.closeHour - view.openHour }, (_, i) => view.openHour + i), [view]);
  const max = useMemo(() => Math.max(0, ...view.cells.map((c) => c[metric])), [view, metric]);
  const [focus, setFocus] = useState<{ weekday: number; hour: number } | null>(null);

  const level = (v: number) => (max <= 0 || v <= 0 ? 0 : Math.min(6, 1 + Math.floor((v / max) * 5.999)));
  const fmt = (v: number) => (metric === "clients" ? `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} client${v >= 2 ? "s" : ""}` : money(v, view.currency, 0));
  const focused = focus ? view.cells.find((c) => c.weekday === focus.weekday && c.hour === focus.hour) : null;

  return (
    <div>
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <table className="w-full min-w-[330px] border-separate" style={{ borderSpacing: 3 }}>
          <caption className="sr-only">
            {metric === "clients" ? "Clients en moyenne" : "Ventes moyennes"} par jour de la semaine et par heure
          </caption>
          <thead>
            <tr>
              <th className="w-9" />
              {hours.map((h) => (
                <th key={h} scope="col" className="text-[10px] font-medium text-dust tabular">
                  {h % 2 === 0 ? `${h}h` : ""}
                  <span className="sr-only">{h % 2 === 0 ? "" : `${h}h`}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS_SHORT.map((wd, w) => {
              const closed = view.openDays[w] === 0;
              return (
                <tr key={wd}>
                  <th scope="row" className="pr-1 text-left text-xs font-semibold text-bark">
                    {wd}
                  </th>
                  {hours.map((h) => {
                    const c = view.cells.find((x) => x.weekday === w && x.hour === h)!;
                    const v = c[metric];
                    const isFocus = focus?.weekday === w && focus.hour === h;
                    return (
                      <td key={h} className="p-0">
                        <button
                          type="button"
                          onMouseEnter={() => setFocus({ weekday: w, hour: h })}
                          onFocus={() => setFocus({ weekday: w, hour: h })}
                          onClick={() => setFocus({ weekday: w, hour: h })}
                          aria-label={`${WEEKDAYS_LONG[w]} ${h}h : ${closed ? "fermé" : fmt(v)}`}
                          className={`block h-7 w-full min-w-[18px] rounded-[5px] transition-[outline-color] sm:h-9 ${
                            isFocus ? "outline-2 outline-offset-1 outline-oven" : "outline-2 outline-transparent"
                          }`}
                          style={{
                            background: closed ? "repeating-linear-gradient(135deg, #efe4d2 0 3px, #f7f0e4 3px 6px)" : HEAT[level(v)],
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[1.5rem] text-sm" aria-live="polite">
          {focused ? (
            <>
              <span className="font-semibold capitalize">{WEEKDAYS_LONG[focused.weekday]}</span>{" "}
              <span className="text-bark">
                {focused.hour}h–{focused.hour + 1}h :{" "}
              </span>
              <span className="font-semibold">
                {view.openDays[focused.weekday] === 0 ? "fermé" : fmt(focused[metric])}
              </span>
              {view.openDays[focused.weekday] > 0 ? <span className="text-dust"> en moyenne</span> : null}
            </>
          ) : (
            <span className="text-dust">Touchez une case pour le détail.</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-dust" aria-hidden>
          <span>Calme</span>
          {HEAT.slice(1).map((c) => (
            <span key={c} className="inline-block h-3 w-4 rounded-[3px]" style={{ background: c }} />
          ))}
          <span>Rush</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Produits : barres horizontales classées                              */
/* ------------------------------------------------------------------ */

export function RankedBars({
  items,
  value,
  format,
  secondary,
}: {
  items: { name: string; qty: number; revenue: number }[];
  value: (i: { qty: number; revenue: number }) => number;
  format: (n: number) => string;
  secondary: (i: { qty: number; revenue: number }) => string;
}) {
  const max = Math.max(1, ...items.map(value));
  return (
    <ol className="space-y-3.5">
      {items.map((it, i) => {
        const v = value(it);
        return (
          <li key={it.name} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                <span className="mr-2 inline-block w-5 font-display text-dust tabular">{i + 1}</span>
                <span className="font-medium">{it.name}</span>
              </span>
              <span className="shrink-0 tabular font-semibold">{format(v)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 pl-7">
              <div className="h-2 flex-1 rounded-full bg-wheat/70">
                <div
                  className="h-full rounded-full bg-crust transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.max(2, (v / max) * 100)}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-xs text-dust tabular">{secondary(it)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
