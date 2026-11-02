import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../lib/csv.ts";
import type { ComptaView } from "../lib/types.ts";

test("export CSV : séparateur ;, virgule décimale, BOM, colonnes par taux", () => {
  const vat = [
    { rate: 5.5, ht: 94.79, tva: 5.21, ttc: 100 },
    { rate: 10, ht: 18.18, tva: 1.82, ttc: 20 },
  ];
  const v = {
    month: "2026-10",
    monthLabel: "Octobre 2026",
    isCurrentMonth: false,
    currency: "EUR",
    coverage: { analyzed: 3, total: 3, complete: true, throttled: false },
    count: 3,
    sales: 120,
    refunds: 0,
    net: 120,
    vat,
    totalHt: 112.97,
    totalTva: 7.03,
    fees: 1.2,
    netCashed: 118.8,
    days: [{ date: "2026-10-01", count: 3, sales: 120, refunds: 0, net: 120, vat, fees: 1.2 }],
    months: [],
  } satisfies ComptaView;
  const csv = toCsv(v);
  assert.ok(csv.startsWith("﻿"));
  const lines = csv.slice(1).split("\r\n");
  assert.equal(
    lines[0],
    "Date;Nombre de ventes;Ventes TTC;Remboursements;CA TTC net;Base HT 5,5 %;TVA 5,5 %;Base HT 10 %;TVA 10 %;Total HT;Total TVA;Frais SumUp;Net encaissé",
  );
  assert.equal(lines[1], "01/10/2026;3;120,00;0,00;120,00;94,79;5,21;18,18;1,82;112,97;7,03;1,20;118,80");
  assert.ok(lines[2].startsWith("TOTAL;3;120,00"));
});
