import "server-only";
import { env } from "./env";
import { fetchHistory, fetchTransaction, getMerchantCode, SumUpError, type RawTransactionFull } from "./sumup";
import { normalize, type Tx } from "./ledger";
import { addDays, diffDays, localDateOf, startOfLocalDay, type LocalDate } from "./time";

/**
 * Chargement des données, journée par journée.
 * Découper par jour rend le cache efficace : une journée passée ne change
 * presque plus, elle est gardée longtemps ; seule la journée en cours est
 * relue toutes les 60 secondes.
 */

export function today(): LocalDate {
  return localDateOf(new Date(), env.timeZone);
}

function revalidateFor(day: LocalDate, todayLd: LocalDate): number {
  const age = diffDays(day, todayLd);
  if (age <= 0) return 60; // aujourd'hui
  if (age === 1) return 300; // hier (remboursements tardifs, synchro des terminaux)
  if (age <= 7) return 3600;
  return 86_400;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

/** Opérations d'une journée locale (vide si la date est dans le futur). */
export async function loadDay(merchantCode: string, day: LocalDate, todayLd: LocalDate): Promise<Tx[]> {
  if (day > todayLd) return [];
  const tz = env.timeZone;
  const raw = await fetchHistory(
    merchantCode,
    startOfLocalDay(day, tz),
    new Date(startOfLocalDay(addDays(day, 1), tz).getTime() - 1),
    revalidateFor(day, todayLd),
  );
  const out: Tx[] = [];
  for (const r of raw) {
    const t = normalize(r);
    if (t) out.push(t);
  }
  return out.sort((a, b) => a.ts - b.ts);
}

/** Plusieurs journées, renvoyées dans l'ordre des dates demandées. */
export async function loadDays(days: LocalDate[]): Promise<{ merchantCode: string; byDay: Map<LocalDate, Tx[]> }> {
  const merchantCode = await getMerchantCode();
  const t = today();
  const lists = await mapLimit(days, 6, (d) => loadDay(merchantCode, d, t));
  const byDay = new Map<LocalDate, Tx[]>();
  days.forEach((d, i) => byDay.set(d, lists[i]));
  return { merchantCode, byDay };
}

/* ------------------------------------------------------------------ */
/* Fiches détaillées (produits, TVA, frais)                             */
/* ------------------------------------------------------------------ */

export interface DetailResult {
  details: Map<string, RawTransactionFull>;
  /** Ventes analysées / ventes à analyser */
  analyzed: number;
  total: number;
  /** Vrai si SumUp a demandé de ralentir : on reprendra au prochain appel. */
  throttled: boolean;
}

/**
 * Lit la fiche complète de chaque vente, dans un budget de temps.
 * Chaque fiche est mise en cache 30 jours par Next : au premier affichage
 * d'un mois chargé, l'analyse peut demander plusieurs passages (l'écran
 * affiche la progression et relance tout seul), ensuite tout est instantané.
 */
export async function loadDetails(merchantCode: string, sales: Tx[], budgetMs = 35_000): Promise<DetailResult> {
  const deadline = Date.now() + budgetMs;
  const details = new Map<string, RawTransactionFull>();
  let throttled = false;
  let stop = false;
  let skipped = 0;

  // Les plus récentes d'abord : ce sont celles qu'on regarde en premier.
  const queue = [...sales].sort((a, b) => b.ts - a.ts);

  await mapLimit(queue, 8, async (tx) => {
    if (stop || Date.now() > deadline) return;
    try {
      details.set(tx.id, await fetchTransaction(merchantCode, tx.id));
    } catch (e) {
      if (e instanceof SumUpError && (e.kind === "rate_limited" || e.kind === "unavailable")) {
        throttled = true;
        stop = true;
        return;
      }
      if (e instanceof SumUpError && e.kind === "not_found") {
        skipped++; // fiche absente : comptée comme analysée, sans détail
        return;
      }
      throw e;
    }
  });

  return { details, analyzed: details.size + skipped, total: sales.length, throttled };
}
