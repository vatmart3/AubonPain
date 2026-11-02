import "server-only";
import { env } from "./env";
import { nextPageQuery } from "./pagination";

/**
 * Client SumUp minimal, exécuté uniquement côté serveur.
 * Les appels passent par le fetch de Next avec `revalidate` : la réponse est
 * mise en cache (Data Cache) et partagée entre les visites. Seules les
 * réponses 200 sont mises en cache par Next : une erreur n'est jamais figée.
 */

export type SumUpErrorKind =
  | "no_key"
  | "key_format"
  | "no_merchant"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "bad_response";

export class SumUpError extends Error {
  constructor(
    public kind: SumUpErrorKind,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "SumUpError";
  }
}

/* ------------------------------------------------------------------ */
/* Types bruts renvoyés par l'API (champs utilisés uniquement)          */
/* ------------------------------------------------------------------ */

export interface RawHistoryItem {
  id?: string;
  transaction_id?: string;
  transaction_code?: string;
  amount?: number;
  currency?: string;
  timestamp?: string;
  status?: string;
  type?: string;
  payment_type?: string;
  card_type?: string;
  product_summary?: string;
  refunded_amount?: number;
}

export interface RawProduct {
  name?: string;
  price?: number;
  price_with_vat?: number;
  quantity?: number;
  total_price?: number;
  total_with_vat?: number;
  vat_rate?: number;
  vat_amount?: number;
}

export interface RawVatRate {
  rate?: number;
  net?: number;
  vat?: number;
  gross?: number;
}

export interface RawTransactionFull extends RawHistoryItem {
  fee_amount?: number;
  products?: RawProduct[];
  vat_rates?: RawVatRate[];
  events?: { type?: string; fee_amount?: number }[];
}

interface HistoryResponse {
  items?: RawHistoryItem[];
  links?: { rel?: string; href?: string }[];
}

/* ------------------------------------------------------------------ */
/* Requête de base                                                     */
/* ------------------------------------------------------------------ */

function apiKey(): string {
  const key = env.sumupApiKey;
  if (!key) throw new SumUpError("no_key", "SUMUP_API_KEY absente");
  if (key.startsWith("sup_pk_")) throw new SumUpError("key_format", "Clé publique fournie au lieu de la clé secrète");
  return key;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sumupGet<T>(pathAndQuery: string, revalidate: number): Promise<T> {
  const url = `${env.sumupBaseUrl}${pathAndQuery}`;
  const key = apiKey();

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
        next: { revalidate },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (e) {
      if (attempt < 1) {
        await sleep(400);
        continue;
      }
      throw new SumUpError("unavailable", `Réseau : ${(e as Error).message}`);
    }

    if (res.ok) {
      try {
        return (await res.json()) as T;
      } catch {
        throw new SumUpError("bad_response", "Réponse SumUp illisible", res.status);
      }
    }

    // On lit le corps pour le journal serveur, jamais renvoyé tel quel au client.
    const body = await res.text().catch(() => "");
    const detail = body.slice(0, 300);

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 800 * (attempt + 1);
      if (attempt < 2 && wait <= 4000) {
        await sleep(wait);
        continue;
      }
      throw new SumUpError(res.status === 429 ? "rate_limited" : "unavailable", `HTTP ${res.status} ${detail}`, res.status);
    }
    if (res.status === 401) throw new SumUpError("unauthorized", `HTTP 401 ${detail}`, 401);
    if (res.status === 403) throw new SumUpError("forbidden", `HTTP 403 ${detail}`, 403);
    if (res.status === 404) throw new SumUpError("not_found", `HTTP 404 ${detail}`, 404);
    throw new SumUpError("bad_response", `HTTP ${res.status} ${detail}`, res.status);
  }
}

/* ------------------------------------------------------------------ */
/* Profil du commerce                                                  */
/* ------------------------------------------------------------------ */

export interface MerchantInfo {
  name: string;
  merchantCode: string | null;
  currency: string | null;
  country: string | null;
}

interface MeResponse {
  merchant_profile?: {
    merchant_code?: string;
    company_name?: string;
    country?: string;
    default_currency?: string;
    doing_business_as?: { business_name?: string };
  };
  personal_profile?: { first_name?: string; last_name?: string };
}

/** GET /v0.1/me — valide la clé et donne le nom du commerce. */
export async function getMe(): Promise<MerchantInfo> {
  const me = await sumupGet<MeResponse>("/v0.1/me", 3600);
  const mp = me.merchant_profile ?? {};
  const name = mp.doing_business_as?.business_name || mp.company_name || "Commerce SumUp";
  return {
    name,
    merchantCode: mp.merchant_code ?? null,
    currency: mp.default_currency ?? null,
    country: mp.country ?? null,
  };
}

export async function getMerchantCode(): Promise<string> {
  const fromEnv = env.sumupMerchantCode;
  if (fromEnv) return fromEnv;
  const me = await getMe();
  if (!me.merchantCode) throw new SumUpError("no_merchant", "merchant_code absent de /v0.1/me");
  return me.merchantCode;
}

/* ------------------------------------------------------------------ */
/* Historique                                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 100;
const MAX_PAGES = 200;

/**
 * Toutes les opérations entre deux instants, en suivant les liens "next".
 * Le href d'un lien SumUp est une chaîne de requête à rejouer sur
 * l'endpoint d'historique ; on accepte aussi une URL complète ou relative.
 */
export async function fetchHistory(
  merchantCode: string,
  oldest: Date,
  newest: Date,
  revalidate: number,
): Promise<RawHistoryItem[]> {
  const path = `/v2.1/merchants/${encodeURIComponent(merchantCode)}/transactions/history`;
  const base = new URLSearchParams({
    oldest_time: oldest.toISOString(),
    newest_time: newest.toISOString(),
    limit: String(PAGE_SIZE),
    order: "ascending",
  });

  const seen = new Set<string>();
  const items: RawHistoryItem[] = [];
  let query = base.toString();

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await sumupGet<HistoryResponse>(`${path}?${query}`, revalidate);
    const pageItems = Array.isArray(res.items) ? res.items : [];
    for (const it of pageItems) {
      const id = it.id ?? it.transaction_id ?? it.transaction_code;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push(it);
    }

    const next = res.links?.find((l) => l.rel === "next" && l.href);
    if (!next?.href || pageItems.length === 0) break;
    const nextQuery = nextPageQuery(next.href, base);
    if (nextQuery === query) break;
    query = nextQuery;
  }
  return items;
}

/** Fiche complète : produits, TVA, frais. Stable une fois la vente passée. */
export async function fetchTransaction(merchantCode: string, id: string): Promise<RawTransactionFull> {
  const path = `/v2.1/merchants/${encodeURIComponent(merchantCode)}/transactions?id=${encodeURIComponent(id)}`;
  return sumupGet<RawTransactionFull>(path, 60 * 60 * 24 * 30);
}
