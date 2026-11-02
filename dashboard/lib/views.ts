import "server-only";
import { env } from "./env";
import { loadDays, loadDetails, today } from "./data";
import {
  deltaPct,
  feeOf,
  heatmap,
  mergeVat,
  productLines,
  round2,
  salesByHour,
  topProducts,
  totals,
  vatLines,
  type ProductLine,
  type Tx,
  type VatLine,
} from "./ledger";
import {
  addDays,
  addMonths,
  dayRange,
  daysInMonth,
  localParts,
  monthOf,
  monthStart,
  pad,
  startOfWeek,
  zonedTime,
  type LocalDate,
} from "./time";
import { longDate, monthLabel, monthName, shortDate, weekdayName, weekdayShort } from "./format";
import type {
  AffluenceView,
  ComptaDay,
  ComptaView,
  PeriodDay,
  PeriodView,
  ProductsView,
  TodayView,
} from "./types";

const currencyOf = (txs: Tx[]) => txs.find((t) => t.currency)?.currency ?? "EUR";

/** Même heure murale, `days` jours plus tôt (gère le changement d'heure). */
function sameTimeOn(day: LocalDate, now: Date): number {
  const p = localParts(now, env.timeZone);
  return zonedTime(day, p.hour, p.minute, env.timeZone).getTime() + p.second * 1000 + 999;
}

const CARD_LABELS: Record<string, string> = {
  VISA: "Visa",
  VISA_ELECTRON: "Visa",
  VISA_VPAY: "V Pay",
  VPAY: "V Pay",
  MASTERCARD: "Mastercard",
  MAESTRO: "Maestro",
  AMEX: "Amex",
  CONECS: "Titre-resto",
  SWILE: "Swile",
  PLUXEE: "Pluxee",
};

/* ------------------------------------------------------------------ */
/* Aujourd'hui                                                          */
/* ------------------------------------------------------------------ */

export async function todayView(): Promise<TodayView> {
  const now = new Date();
  const t = today();
  const lw = addDays(t, -7);
  const { byDay } = await loadDays([t, lw]);
  const todayTx = byDay.get(t) ?? [];
  const lwTx = byDay.get(lw) ?? [];

  const cutoff = sameTimeOn(lw, now);
  const lwSame = lwTx.filter((x) => x.ts <= cutoff);

  const cur = totals(todayTx);
  const prevSame = totals(lwSame);
  const prevFull = totals(lwTx);

  const { openHour, closeHour } = env;
  const hourNow = localParts(now, env.timeZone).hour;
  const todayHours = salesByHour(todayTx, env.timeZone, openHour, closeHour);
  const lwHours = salesByHour(lwTx, env.timeZone, openHour, closeHour);
  const lastIdx = hourNow - openHour;

  const recent = todayTx
    .filter((x) => x.kind !== "ignored")
    .slice(-6)
    .reverse()
    .map((x) => {
      const p = localParts(new Date(x.ts), env.timeZone);
      const card = x.cardType ? CARD_LABELS[x.cardType] : undefined;
      return {
        time: `${pad(p.hour)}:${pad(p.minute)}`,
        amount: x.amount,
        kind: x.kind as "sale" | "refund",
        label: x.kind === "refund" ? "Remboursement" : (x.summary ?? card ?? "Carte"),
      };
    });

  return {
    date: t,
    weekday: weekdayName(t),
    generatedAt: now.toISOString(),
    currency: currencyOf(todayTx.length ? todayTx : lwTx),
    net: cur.net,
    sales: cur.sales,
    refunds: cur.refunds,
    count: cur.count,
    avgBasket: cur.avgBasket,
    lastWeek: {
      date: lw,
      netSameTime: prevSame.net,
      countSameTime: prevSame.count,
      avgBasketSameTime: prevSame.avgBasket,
      netFullDay: prevFull.net,
    },
    deltaPct: deltaPct(cur.net, prevSame.net),
    countDeltaPct: deltaPct(cur.count, prevSame.count),
    basketDeltaPct: deltaPct(cur.avgBasket, prevSame.avgBasket),
    hours: todayHours.map((v, i) => ({
      hour: openHour + i,
      today: i <= lastIdx ? v : null,
      lastWeek: lwHours[i],
    })),
    recent,
  };
}

/* ------------------------------------------------------------------ */
/* Semaine / Mois                                                       */
/* ------------------------------------------------------------------ */

export async function periodView(kind: "week" | "month", offset: number): Promise<PeriodView> {
  const now = new Date();
  const t = today();

  let days: LocalDate[];
  let prevOf: (d: LocalDate, i: number) => LocalDate | null;
  let prevAll: LocalDate[];
  let title: string;
  let subtitle: string;
  let prevName: string;

  if (kind === "week") {
    const start = addDays(startOfWeek(t), 7 * offset);
    days = dayRange(start, addDays(start, 6));
    prevOf = (d) => addDays(d, -7);
    prevAll = days.map((d) => addDays(d, -7));
    title = offset === 0 ? "Cette semaine" : offset === -1 ? "La semaine dernière" : `Semaine du ${shortDate(start)}`;
    subtitle = `Du ${longDate(start).toLocaleLowerCase("fr")} au ${longDate(days[6]).toLocaleLowerCase("fr")}`;
    prevName = "la semaine d'avant";
  } else {
    const month = addMonths(monthOf(t), offset);
    const prevMonth = addMonths(month, -1);
    const n = daysInMonth(month);
    const prevN = daysInMonth(prevMonth);
    days = dayRange(monthStart(month), `${month}-${pad(n)}`);
    prevOf = (_d, i) => (i < prevN ? `${prevMonth}-${pad(i + 1)}` : null);
    prevAll = dayRange(monthStart(prevMonth), `${prevMonth}-${pad(prevN)}`);
    title = offset === 0 ? "Ce mois-ci" : monthLabel(month);
    subtitle = offset === 0 ? monthLabel(month) : "Mois terminé";
    prevName = monthName(prevMonth);
  }

  const { byDay } = await loadDays([...days.filter((d) => d <= t), ...prevAll.filter((d) => d <= t)]);

  const isCurrent = days.includes(t);
  const todayIdx = days.indexOf(t);

  // Comparaison à périmètre égal : pour la période en cours, on s'arrête au
  // même jour et à la même heure dans la période précédente.
  const curTx: Tx[] = [];
  const prevTx: Tx[] = [];
  const outDays: PeriodDay[] = days.map((d, i) => {
    const txs = d <= t ? (byDay.get(d) ?? []) : [];
    const prevDate = prevOf(d, i);
    const prevList = prevDate ? (byDay.get(prevDate) ?? []) : [];
    const tt = totals(txs);
    curTx.push(...txs);
    if (prevDate && isCurrent && i < todayIdx) prevTx.push(...prevList);
    if (prevDate && isCurrent && i === todayIdx) {
      const cutoff = sameTimeOn(prevDate, now);
      prevTx.push(...prevList.filter((x) => x.ts <= cutoff));
    }
    return {
      date: d,
      label: longDate(d),
      short: kind === "week" ? weekdayShort(d) : String(Number(d.slice(8))),
      net: tt.net,
      count: tt.count,
      prevNet: prevDate ? totals(prevList).net : null,
      prevDate,
      isFuture: d > t,
      isToday: d === t,
    };
  });

  // Période terminée : on la compare à toute la période précédente.
  if (!isCurrent) for (const d of prevAll) prevTx.push(...(byDay.get(d) ?? []));

  const cur = totals(curTx);
  const prev = totals(prevTx);

  // Meilleur / pire jour : journées terminées et ouvertes (au moins une vente).
  const complete = outDays.filter((d) => !d.isFuture && !d.isToday && d.count > 0);
  const best = complete.reduce<PeriodDay | null>((a, d) => (!a || d.net > a.net ? d : a), null);
  const worst = complete.length >= 2 ? complete.reduce<PeriodDay | null>((a, d) => (!a || d.net < a.net ? d : a), null) : null;
  const openDays = outDays.filter((d) => d.count > 0).length;

  return {
    kind,
    offset,
    title,
    subtitle,
    compareLabel: isCurrent ? `vs ${prevName}, à la même heure` : `vs ${prevName}`,
    currency: currencyOf(curTx),
    days: outDays,
    net: cur.net,
    prevNet: prev.net,
    deltaPct: deltaPct(cur.net, prev.net),
    count: cur.count,
    avgBasket: cur.avgBasket,
    openDays,
    avgPerOpenDay: openDays ? round2(cur.net / openDays) : 0,
    best: best ? { date: best.date, label: best.label, net: best.net } : null,
    worst: worst ? { date: worst.date, label: worst.label, net: worst.net } : null,
    canGoForward: offset < 0,
  };
}

/* ------------------------------------------------------------------ */
/* Affluence                                                            */
/* ------------------------------------------------------------------ */

export async function affluenceView(weeks: number): Promise<AffluenceView> {
  const t = today();
  const from = addDays(t, -7 * weeks);
  const to = addDays(t, -1);
  const { byDay } = await loadDays(dayRange(from, to));
  const all = [...byDay.values()].flat();
  const { cells, openDays } = heatmap(all, env.timeZone, env.openHour, env.closeHour);

  const peakCell = cells.reduce<(typeof cells)[number] | null>((a, c) => (!a || c.clients > a.clients ? c : a), null);
  const perDay = Array.from({ length: 7 }, (_, w) => cells.filter((c) => c.weekday === w).reduce((s, c) => s + c.clients, 0));
  const busiest = perDay.reduce((a, v, w) => (v > perDay[a] ? w : a), 0);

  return {
    weeks,
    from,
    to,
    openHour: env.openHour,
    closeHour: env.closeHour,
    cells,
    openDays,
    peak: peakCell && peakCell.clients > 0 ? { weekday: peakCell.weekday, hour: peakCell.hour, clients: peakCell.clients } : null,
    busiestDay: perDay[busiest] > 0 ? { weekday: busiest, clients: Math.round(perDay[busiest]) } : null,
    currency: currencyOf(all),
  };
}

/* ------------------------------------------------------------------ */
/* Produits                                                             */
/* ------------------------------------------------------------------ */

const PRODUCT_RANGES: Record<string, { label: string; from: (t: LocalDate) => LocalDate }> = {
  today: { label: "Aujourd'hui", from: (t) => t },
  "7d": { label: "7 derniers jours", from: (t) => addDays(t, -6) },
  "30d": { label: "30 derniers jours", from: (t) => addDays(t, -29) },
  month: { label: "Ce mois-ci", from: (t) => monthStart(monthOf(t)) },
};

export function isProductRange(r: string): boolean {
  return r in PRODUCT_RANGES;
}

export async function productsView(range: string): Promise<ProductsView> {
  const t = today();
  const def = PRODUCT_RANGES[range] ?? PRODUCT_RANGES["7d"];
  const from = def.from(t);
  const { merchantCode, byDay } = await loadDays(dayRange(from, t));
  const sales = [...byDay.values()].flat().filter((x) => x.kind === "sale");
  const det = await loadDetails(merchantCode, sales);

  const lines: ProductLine[] = [];
  let salesWithProducts = 0;
  for (const full of det.details.values()) {
    const l = productLines(full);
    if (l.length) salesWithProducts++;
    lines.push(...l);
  }
  const top = topProducts(lines, 10);

  return {
    range: range in PRODUCT_RANGES ? range : "7d",
    rangeLabel: def.label,
    from,
    to: t,
    currency: currencyOf(sales),
    coverage: {
      analyzed: det.analyzed,
      total: det.total,
      complete: det.analyzed >= det.total,
      throttled: det.throttled,
    },
    salesWithProducts,
    byQty: top.byQty,
    byRevenue: top.byRevenue,
    distinct: top.distinct,
  };
}

/* ------------------------------------------------------------------ */
/* Compta                                                               */
/* ------------------------------------------------------------------ */

export async function comptaView(month: string): Promise<ComptaView> {
  const t = today();
  const current = monthOf(t);
  const lastDay = month === current ? t : `${month}-${pad(daysInMonth(month))}`;
  const days = month > current ? [] : dayRange(monthStart(month), lastDay);

  const { merchantCode, byDay } = await loadDays(days);
  const allTx = [...byDay.values()].flat();
  const sales = allTx.filter((x) => x.kind === "sale");
  const det = await loadDetails(merchantCode, sales);

  const outDays: ComptaDay[] = days.map((d) => {
    const txs = byDay.get(d) ?? [];
    const tt = totals(txs);
    const vat: VatLine[] = [];
    let fees = 0;
    for (const x of txs) {
      if (x.kind !== "sale") continue;
      const full = det.details.get(x.id);
      if (!full) continue;
      vat.push(...vatLines(full, x.amount));
      fees += feeOf(full);
    }
    return {
      date: d,
      count: tt.count,
      sales: tt.sales,
      refunds: tt.refunds,
      net: tt.net,
      vat: mergeVat(vat),
      fees: round2(fees),
    };
  });

  const tt = totals(allTx);
  const vat = mergeVat(outDays.flatMap((d) => d.vat));
  const fees = round2(outDays.reduce((s, d) => s + d.fees, 0));
  const totalTva = round2(vat.reduce((s, v) => s + v.tva, 0));
  const totalHt = round2(vat.reduce((s, v) => s + v.ht, 0));

  const months = Array.from({ length: 13 }, (_, i) => addMonths(current, -i)).map((m) => ({ value: m, label: monthLabel(m) }));

  return {
    month,
    monthLabel: monthLabel(month),
    isCurrentMonth: month === current,
    currency: currencyOf(allTx),
    coverage: {
      analyzed: det.analyzed,
      total: det.total,
      complete: det.analyzed >= det.total,
      throttled: det.throttled,
    },
    count: tt.count,
    sales: tt.sales,
    refunds: tt.refunds,
    net: tt.net,
    vat,
    totalHt,
    totalTva,
    fees,
    netCashed: round2(tt.net - fees),
    days: outDays,
    months,
  };
}
