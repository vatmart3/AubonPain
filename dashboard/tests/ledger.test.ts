import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, feeOf, heatmap, mergeVat, normalize, normalizeRate, productLines, salesByHour, topProducts, totals, vatLines, type Tx } from "../lib/ledger.ts";
import { nextPageQuery } from "../lib/pagination.ts";

const TZ = "Europe/Paris";

function tx(over: Record<string, unknown>): Tx {
  const t = normalize({ id: Math.random().toString(36).slice(2), amount: 10, currency: "EUR", status: "SUCCESSFUL", type: "PAYMENT", timestamp: "2026-11-02T07:15:00Z", ...over });
  assert.ok(t);
  return t;
}

test("classement des opérations", () => {
  assert.equal(classify("SUCCESSFUL", "PAYMENT"), "sale");
  assert.equal(classify("REFUNDED", "PAYMENT"), "sale");
  assert.equal(classify("FAILED", "PAYMENT"), "ignored");
  assert.equal(classify("CANCELLED", "PAYMENT"), "ignored");
  assert.equal(classify("PENDING", "PAYMENT"), "ignored");
  assert.equal(classify("SUCCESSFUL", "REFUND"), "refund");
  assert.equal(classify("FAILED", "REFUND"), "ignored");
});

test("CA = ventes réussies − remboursements, échecs ignorés", () => {
  const t = totals([
    tx({ amount: 12.5 }),
    tx({ amount: 7.5 }),
    tx({ amount: 30, status: "FAILED" }),
    tx({ amount: 4, status: "REFUNDED", refunded_amount: 4 }),
    tx({ amount: 4, type: "REFUND" }),
  ]);
  assert.equal(t.sales, 24);
  assert.equal(t.refunds, 4);
  assert.equal(t.net, 20);
  assert.equal(t.count, 3);
  assert.equal(t.avgBasket, 8);
});

test("remboursement sans opération REFUND : refunded_amount en secours", () => {
  const t = totals([tx({ amount: 10, status: "REFUNDED", refunded_amount: 3 }), tx({ amount: 5 })]);
  assert.equal(t.refunds, 3);
  assert.equal(t.net, 12);
});

test("ventes par heure, bornées à la plage d'ouverture", () => {
  const h = salesByHour(
    [
      tx({ amount: 5, timestamp: "2026-11-02T04:30:00Z" }), // 5h30 Paris → tranche 6h
      tx({ amount: 3, timestamp: "2026-11-02T06:10:00Z" }), // 7h10
      tx({ amount: 2, timestamp: "2026-11-02T20:00:00Z" }), // 21h → tranche 19h
    ],
    TZ,
    6,
    20,
  );
  assert.equal(h.length, 14);
  assert.equal(h[0], 5);
  assert.equal(h[1], 3);
  assert.equal(h[13], 2);
});

test("affluence : moyenne par jour d'ouverture", () => {
  const { cells, openDays } = heatmap(
    [
      tx({ timestamp: "2026-11-07T07:05:00Z" }), // samedi 8h
      tx({ timestamp: "2026-11-07T07:25:00Z" }),
      tx({ timestamp: "2026-10-31T07:40:00Z" }), // samedi précédent 8h
    ],
    TZ,
    6,
    20,
  );
  assert.equal(openDays[5], 2);
  const sat8 = cells.find((c) => c.weekday === 5 && c.hour === 8);
  assert.equal(sat8?.clients, 1.5);
});

test("produits : agrégation par nom, top 10", () => {
  const lines = [
    ...productLines({ products: [{ name: "Baguette", quantity: 3, total_with_vat: 3.6 }, { name: "Croissant", quantity: 2, price_with_vat: 1.3 }] }),
    ...productLines({ products: [{ name: "baguette", quantity: 1, price: 1.2 }] }),
  ];
  const top = topProducts(lines);
  assert.equal(top.byQty[0].name, "Baguette");
  assert.equal(top.byQty[0].qty, 4);
  assert.equal(top.byQty[0].revenue, 4.8);
  assert.equal(top.byRevenue[1].revenue, 2.6);
  assert.equal(top.distinct, 2);
});

test("TVA : vat_rates, puis produits, puis non renseigné", () => {
  assert.equal(normalizeRate(0.055), 5.5);
  assert.equal(normalizeRate(10), 10);
  const a = vatLines({ vat_rates: [{ rate: 0.055, net: 9.48, vat: 0.52, gross: 10 }] }, 10);
  assert.deepEqual(a, [{ rate: 5.5, ht: 9.48, tva: 0.52, ttc: 10 }]);
  const b = vatLines({ products: [{ name: "Café", quantity: 1, price_with_vat: 1.1, vat_rate: 0.1, vat_amount: 0.1 }] }, 1.1);
  assert.equal(b[0].rate, 10);
  assert.equal(b[0].tva, 0.1);
  const c = vatLines({}, 7);
  assert.deepEqual(c, [{ rate: null, ht: 0, tva: 0, ttc: 7 }]);
  const m = mergeVat([...a, ...a, ...c]);
  assert.deepEqual(m, [
    { rate: 5.5, ht: 18.96, tva: 1.04, ttc: 20 },
    { rate: null, ht: 0, tva: 0, ttc: 7 },
  ]);
});

test("frais : fee_amount sinon somme des événements", () => {
  assert.equal(feeOf({ fee_amount: 0.17 }), 0.17);
  assert.equal(feeOf({ events: [{ fee_amount: 0.1 }, { fee_amount: 0.05 }] }), 0.15000000000000002);
  assert.equal(feeOf({}), 0);
});

test("pagination : le lien next l'emporte, les filtres d'origine restent", () => {
  const base = new URLSearchParams({ oldest_time: "A", newest_time: "B", limit: "100", order: "ascending" });
  const q = new URLSearchParams(nextPageQuery("limit=100&oldest_ref=XYZ&order=ascending", base));
  assert.equal(q.get("oldest_ref"), "XYZ");
  assert.equal(q.get("newest_time"), "B");
  const q2 = new URLSearchParams(nextPageQuery("https://api.sumup.com/v2.1/merchants/M/transactions/history?newest_ref=Q", base));
  assert.equal(q2.get("newest_ref"), "Q");
  assert.equal(q2.get("oldest_time"), "A");
});
