import { decimalFr, rateLabel } from "./format.ts";
import type { ComptaView } from "./types.ts";

export function toCsv(v: ComptaView): string {
  const rates = v.vat.map((x) => x.rate);
  const known = rates.filter((r): r is number => r !== null);
  const hasUnknown = rates.includes(null);

  const header = [
    "Date",
    "Nombre de ventes",
    "Ventes TTC",
    "Remboursements",
    "CA TTC net",
    ...known.flatMap((r) => [`Base HT ${rateLabel(r)}`, `TVA ${rateLabel(r)}`]),
    ...(hasUnknown ? ["TTC sans taux renseigné"] : []),
    "Total HT",
    "Total TVA",
    "Frais SumUp",
    "Net encaissé",
  ];

  const row = (
    label: string,
    d: { count: number; sales: number; refunds: number; net: number; fees: number; vat: ComptaView["vat"] },
  ) => {
    const byRate = new Map(d.vat.map((x) => [x.rate, x]));
    const ht = d.vat.reduce((s, x) => s + x.ht, 0);
    const tva = d.vat.reduce((s, x) => s + x.tva, 0);
    return [
      label,
      String(d.count),
      decimalFr(d.sales),
      decimalFr(d.refunds),
      decimalFr(d.net),
      ...known.flatMap((r) => [decimalFr(byRate.get(r)?.ht ?? 0), decimalFr(byRate.get(r)?.tva ?? 0)]),
      ...(hasUnknown ? [decimalFr(byRate.get(null)?.ttc ?? 0)] : []),
      decimalFr(ht),
      decimalFr(tva),
      decimalFr(d.fees),
      decimalFr(d.net - d.fees),
    ];
  };

  const lines = [
    header,
    ...v.days.map((d) => row(d.date.split("-").reverse().join("/"), d)),
    row("TOTAL", { count: v.count, sales: v.sales, refunds: v.refunds, net: v.net, fees: v.fees, vat: v.vat }),
    [],
    ["Paiements carte encaissés via SumUp uniquement — hors espèces."],
    ["TVA ventilée d'après les taux transmis par SumUp, calculée sur les ventes avant remboursements."],
    ["Net encaissé = CA TTC net − frais SumUp."],
  ];

  const esc = (c: string) => (/[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  // BOM UTF-8 + point-virgule : s'ouvre proprement dans Excel en français.
  return "﻿" + lines.map((l) => l.map(esc).join(";")).join("\r\n") + "\r\n";
}
