#!/usr/bin/env node
/**
 * Vérifie la connexion SumUp avant toute chose :
 *   1. GET /v0.1/me  → nom du commerce et code commerçant
 *   2. GET /v2.1/merchants/{code}/transactions/history → droit de lecture des ventes
 *   3. GET /v2.1/merchants/{code}/transactions?id=…    → produits / TVA / frais présents ?
 *
 * Usage : npm run check:sumup   (lit .env.local ou .env si présents)
 * La clé n'est jamais affichée.
 */
import { existsSync } from "node:fs";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    try {
      process.loadEnvFile(f);
    } catch {}
  }
}

const BASE = (process.env.SUMUP_API_BASE || "https://api.sumup.com").replace(/\/+$/, "");
const KEY = process.env.SUMUP_API_KEY?.trim();

const ok = (m) => console.log(`  ✓ ${m}`);
const ko = (m) => console.log(`  ✗ ${m}`);
const info = (m) => console.log(`    ${m}`);

async function get(path) {
  const res = await fetch(BASE + path, {
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {}
  return { status: res.status, body, text };
}

function explain(status) {
  if (status === 401) return "clé invalide, expirée ou révoquée (401) : générez une nouvelle clé secrète sup_sk_ dans SumUp → Paramètres → Développeurs.";
  if (status === 403) return "accès refusé (403) : la clé n'a pas le droit de lire ce commerce.";
  if (status === 404) return "introuvable (404) : vérifiez SUMUP_MERCHANT_CODE.";
  if (status === 429) return "trop de requêtes (429) : réessayez dans une minute.";
  if (status >= 500) return `SumUp indisponible (${status}).`;
  return `réponse inattendue (${status}).`;
}

console.log(`\nConnexion SumUp — ${BASE}\n`);

if (!KEY) {
  ko("SUMUP_API_KEY absente (ajoutez-la dans .env.local ou dans l'environnement).");
  process.exit(1);
}
if (KEY.startsWith("sup_pk_")) {
  ko("La clé fournie est une clé PUBLIQUE (sup_pk_…). Il faut la clé secrète sup_sk_….");
  process.exit(1);
}
if (!KEY.startsWith("sup_sk_")) info("Attention : la clé ne commence pas par sup_sk_.");

try {
  // 1. Profil
  const me = await get("/v0.1/me");
  if (me.status !== 200) {
    ko(`/v0.1/me : ${explain(me.status)}`);
    process.exit(1);
  }
  const mp = me.body?.merchant_profile ?? {};
  const name = mp.doing_business_as?.business_name || mp.company_name || "(nom non renseigné)";
  ok(`Clé valide — commerce : ${name}`);
  info(`code commerçant : ${mp.merchant_code ?? "?"} · pays : ${mp.country ?? "?"} · devise : ${mp.default_currency ?? "?"}`);

  const code = process.env.SUMUP_MERCHANT_CODE?.trim() || mp.merchant_code;
  if (process.env.SUMUP_MERCHANT_CODE && mp.merchant_code && process.env.SUMUP_MERCHANT_CODE.trim() !== mp.merchant_code) {
    info(`Attention : SUMUP_MERCHANT_CODE (${process.env.SUMUP_MERCHANT_CODE}) ≠ code du profil (${mp.merchant_code}).`);
  }
  if (!code) {
    ko("Aucun code commerçant : renseignez SUMUP_MERCHANT_CODE.");
    process.exit(1);
  }

  // 2. Historique sur 7 jours
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const hist = await get(
    `/v2.1/merchants/${encodeURIComponent(code)}/transactions/history?oldest_time=${encodeURIComponent(since)}&limit=100&order=descending`,
  );
  if (hist.status !== 200) {
    ko(`Historique : ${explain(hist.status)}`);
    process.exit(1);
  }
  const items = hist.body?.items ?? [];
  const success = items.filter((t) => t.status === "SUCCESSFUL");
  ok(`Historique lisible — ${items.length} opération(s) sur 7 jours (1re page), dont ${success.length} SUCCESSFUL`);
  if (hist.body?.links?.length) info(`pagination : ${hist.body.links.map((l) => l.rel).join(", ")}`);

  // 3. Une fiche détaillée
  const sample = success[0];
  if (sample?.id) {
    const full = await get(`/v2.1/merchants/${encodeURIComponent(code)}/transactions?id=${encodeURIComponent(sample.id)}`);
    if (full.status === 200) {
      const b = full.body ?? {};
      ok("Fiche détaillée lisible");
      info(`articles (products) : ${b.products?.length ? `${b.products.length} — ex. « ${b.products[0].name} »` : "aucun (encaissement au montant libre)"}`);
      info(`TVA (vat_rates) : ${b.vat_rates?.length ? b.vat_rates.map((v) => v.rate).join(", ") : "non renseignée"}`);
      info(`frais (fee_amount) : ${b.fee_amount ?? "absent"}`);
    } else {
      ko(`Fiche détaillée : ${explain(full.status)}`);
    }
  } else {
    info("Pas de vente réussie récente pour tester la fiche détaillée.");
  }
  console.log("\nTout est prêt : vous pouvez déployer.\n");
} catch (e) {
  ko(`Impossible de joindre SumUp : ${e.message}`);
  process.exit(1);
}
