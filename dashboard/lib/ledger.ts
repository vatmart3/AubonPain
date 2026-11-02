/**
 * Calculs purs sur les opérations SumUp : aucune entrée/sortie ici,
 * tout est testable (tests/ledger.test.ts).
 *
 * Règles de calcul du chiffre d'affaires :
 *  - une vente = opération de type PAYMENT au statut SUCCESSFUL ;
 *    une vente remboursée après coup passe au statut REFUNDED : elle reste
 *    une vente encaissée, le remboursement est déduit séparément ;
 *  - un remboursement = opération REFUND (ou CHARGE_BACK) au statut SUCCESSFUL,
 *    déduit le jour où il a eu lieu ;
 *  - FAILED, CANCELLED, PENDING : ignorés.
 */

import { localParts, localDateOf, type LocalDate } from "./time.ts";
import type { RawHistoryItem, RawTransactionFull } from "./sumup.ts";

export type TxKind = "sale" | "refund" | "ignored";

export interface Tx {
  id: string;
  code: string | null;
  ts: number;
  amount: number;
  currency: string;
  status: string;
  type: string;
  kind: TxKind;
  paymentType: string | null;
  cardType: string | null;
  refundedAmount: number;
  summary: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function classify(status: string, type: string): TxKind {
  const s = status.toUpperCase();
  const t = type.toUpperCase();
  if (t === "REFUND" || t === "CHARGE_BACK") return s === "SUCCESSFUL" ? "refund" : "ignored";
  if (s === "SUCCESSFUL" || s === "REFUNDED") return "sale";
  return "ignored";
}

export function normalize(raw: RawHistoryItem): Tx | null {
  const id = raw.id ?? raw.transaction_id ?? raw.transaction_code;
  const ts = raw.timestamp ? Date.parse(raw.timestamp) : Number.NaN;
  if (!id || !Number.isFinite(ts)) return null;
  const status = (raw.status ?? "").toUpperCase();
  const type = (raw.type ?? "PAYMENT").toUpperCase();
  return {
    id,
    code: raw.transaction_code ?? null,
    ts,
    amount: Math.abs(Number(raw.amount) || 0),
    currency: raw.currency ?? "EUR",
    status,
    type,
    kind: classify(status, type),
    paymentType: raw.payment_type ?? null,
    cardType: raw.card_type ?? null,
    refundedAmount: Math.abs(Number(raw.refunded_amount) || 0),
    summary: raw.product_summary?.trim() || null,
  };
}

/* ------------------------------------------------------------------ */
/* Totaux                                                               */
/* ------------------------------------------------------------------ */

export interface Totals {
  /** Ventes encaissées (TTC) */
  sales: number;
  /** Remboursements déduits */
  refunds: number;
  /** CA = ventes − remboursements */
  net: number;
  /** Nombre de ventes (≈ nombre de clients) */
  count: number;
  /** Panier moyen = ventes / nombre de ventes */
  avgBasket: number;
}

/**
 * Remboursements : on s'appuie sur les opérations REFUND. Si l'API n'en
 * renvoie aucune mais que des ventes portent un `refunded_amount`, on se
 * rabat sur ce montant (daté au jour de la vente).
 */
export function totals(txs: Tx[]): Totals {
  let sales = 0;
  let count = 0;
  let refundEntries = 0;
  let refundedOnSales = 0;
  for (const t of txs) {
    if (t.kind === "sale") {
      sales += t.amount;
      count++;
      refundedOnSales += t.refundedAmount;
    } else if (t.kind === "refund") {
      refundEntries += t.amount;
    }
  }
  const refunds = refundEntries > 0 ? refundEntries : refundedOnSales;
  return {
    sales: round2(sales),
    refunds: round2(refunds),
    net: round2(sales - refunds),
    count,
    avgBasket: count ? round2(sales / count) : 0,
  };
}

/** Ventes (TTC) par heure entre openHour et closeHour ; hors plage → tranche la plus proche. */
export function salesByHour(txs: Tx[], tz: string, openHour: number, closeHour: number, untilTs?: number): number[] {
  const n = Math.max(1, closeHour - openHour);
  const out = new Array<number>(n).fill(0);
  for (const t of txs) {
    if (t.kind !== "sale") continue;
    if (untilTs !== undefined && t.ts > untilTs) continue;
    const h = localParts(new Date(t.ts), tz).hour;
    const i = Math.min(n - 1, Math.max(0, h - openHour));
    out[i] += t.amount;
  }
  return out.map(round2);
}

export function groupByDay(txs: Tx[], tz: string): Map<LocalDate, Tx[]> {
  const map = new Map<LocalDate, Tx[]>();
  for (const t of txs) {
    const d = localDateOf(new Date(t.ts), tz);
    const arr = map.get(d);
    if (arr) arr.push(t);
    else map.set(d, [t]);
  }
  return map;
}

export function deltaPct(current: number, previous: number): number | null {
  if (!previous) return null;
  return round2(((current - previous) / previous) * 100);
}

/* ------------------------------------------------------------------ */
/* Affluence                                                            */
/* ------------------------------------------------------------------ */

export interface HeatCell {
  weekday: number;
  hour: number;
  /** Clients en moyenne sur ce créneau (jours d'ouverture uniquement) */
  clients: number;
  /** Ventes moyennes (TTC) sur ce créneau */
  sales: number;
}

/**
 * Moyenne par jour d'ouverture : un lundi fermé (aucune vente) ne fait pas
 * baisser la moyenne des lundis ouverts.
 */
export function heatmap(txs: Tx[], tz: string, openHour: number, closeHour: number): { cells: HeatCell[]; openDays: number[] } {
  const hours = Math.max(1, closeHour - openHour);
  const clients = Array.from({ length: 7 }, () => new Array<number>(hours).fill(0));
  const sales = Array.from({ length: 7 }, () => new Array<number>(hours).fill(0));
  const daysSeen = Array.from({ length: 7 }, () => new Set<string>());

  for (const t of txs) {
    if (t.kind !== "sale") continue;
    const p = localParts(new Date(t.ts), tz);
    const i = Math.min(hours - 1, Math.max(0, p.hour - openHour));
    clients[p.weekday][i] += 1;
    sales[p.weekday][i] += t.amount;
    daysSeen[p.weekday].add(`${p.year}-${p.month}-${p.day}`);
  }

  const openDays = daysSeen.map((s) => s.size);
  const cells: HeatCell[] = [];
  for (let w = 0; w < 7; w++) {
    for (let i = 0; i < hours; i++) {
      const d = openDays[w] || 1;
      cells.push({
        weekday: w,
        hour: openHour + i,
        clients: Math.round((clients[w][i] / d) * 10) / 10,
        sales: round2(sales[w][i] / d),
      });
    }
  }
  return { cells, openDays };
}

/* ------------------------------------------------------------------ */
/* Produits, TVA, frais (fiches détaillées)                             */
/* ------------------------------------------------------------------ */

export interface ProductLine {
  name: string;
  qty: number;
  revenue: number;
}

export function productLines(full: RawTransactionFull): ProductLine[] {
  const out: ProductLine[] = [];
  for (const p of full.products ?? []) {
    const name = (p.name ?? "").trim();
    if (!name) continue;
    const qty = Number(p.quantity) || 1;
    const revenue =
      num(p.total_with_vat) ??
      (num(p.price_with_vat) !== undefined ? num(p.price_with_vat)! * qty : undefined) ??
      num(p.total_price) ??
      (num(p.price) ?? 0) * qty;
    out.push({ name, qty, revenue });
  }
  return out;
}

export function topProducts(lines: ProductLine[], limit = 10): { byQty: ProductLine[]; byRevenue: ProductLine[]; distinct: number } {
  const map = new Map<string, ProductLine>();
  for (const l of lines) {
    const key = l.name.toLocaleLowerCase("fr");
    const cur = map.get(key);
    if (cur) {
      cur.qty += l.qty;
      cur.revenue += l.revenue;
    } else map.set(key, { ...l });
  }
  const all = [...map.values()].map((p) => ({ ...p, qty: Math.round(p.qty * 1000) / 1000, revenue: round2(p.revenue) }));
  return {
    byQty: [...all].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, limit),
    byRevenue: [...all].sort((a, b) => b.revenue - a.revenue || b.qty - a.qty).slice(0, limit),
    distinct: all.length,
  };
}

export interface VatLine {
  /** Taux en pourcentage (5.5, 10, 20) ; null = taux non renseigné */
  rate: number | null;
  ht: number;
  tva: number;
  ttc: number;
}

/** Taux SumUp : parfois 0.1, parfois 10. On ramène tout en pourcentage. */
export function normalizeRate(rate: number | undefined): number | null {
  if (rate === undefined || rate === null || !Number.isFinite(rate)) return null;
  const pct = rate > 0 && rate < 1 ? rate * 100 : rate;
  return Math.round(pct * 100) / 100;
}

/** Ventilation TVA d'une vente : vat_rates, à défaut les produits, à défaut "non renseigné". */
export function vatLines(full: RawTransactionFull, saleAmount: number): VatLine[] {
  if (full.vat_rates && full.vat_rates.length > 0) {
    return full.vat_rates.map((v) => {
      const ttc = num(v.gross) ?? (num(v.net) ?? 0) + (num(v.vat) ?? 0);
      const tva = num(v.vat) ?? 0;
      return { rate: normalizeRate(v.rate), ht: num(v.net) ?? ttc - tva, tva, ttc };
    });
  }
  const withVat = (full.products ?? []).filter((p) => p.vat_rate !== undefined);
  if (withVat.length > 0) {
    const map = new Map<number | null, VatLine>();
    for (const p of withVat) {
      const rate = normalizeRate(p.vat_rate);
      const qty = Number(p.quantity) || 1;
      const ttc = num(p.total_with_vat) ?? (num(p.price_with_vat) ?? 0) * qty;
      const tva = num(p.vat_amount) ?? (rate ? ttc - ttc / (1 + rate / 100) : 0);
      const cur = map.get(rate) ?? { rate, ht: 0, tva: 0, ttc: 0 };
      cur.ttc += ttc;
      cur.tva += tva;
      cur.ht += ttc - tva;
      map.set(rate, cur);
    }
    return [...map.values()];
  }
  return [{ rate: null, ht: 0, tva: 0, ttc: saleAmount }];
}

export function mergeVat(lines: VatLine[]): VatLine[] {
  const map = new Map<string, VatLine>();
  for (const l of lines) {
    const key = l.rate === null ? "?" : String(l.rate);
    const cur = map.get(key) ?? { rate: l.rate, ht: 0, tva: 0, ttc: 0 };
    cur.ht += l.ht;
    cur.tva += l.tva;
    cur.ttc += l.ttc;
    map.set(key, cur);
  }
  return [...map.values()]
    .map((l) => ({ rate: l.rate, ht: round2(l.ht), tva: round2(l.tva), ttc: round2(l.ttc) }))
    .sort((a, b) => (a.rate ?? 999) - (b.rate ?? 999));
}

/** Frais SumUp d'une vente : fee_amount, à défaut la somme des frais des événements. */
export function feeOf(full: RawTransactionFull): number {
  const direct = num(full.fee_amount);
  if (direct !== undefined) return Math.abs(direct);
  let sum = 0;
  for (const e of full.events ?? []) sum += Math.abs(num(e.fee_amount) ?? 0);
  return sum;
}

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

export { round2 };
