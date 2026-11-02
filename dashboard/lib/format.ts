/** Formatage en français, partagé entre serveur et navigateur. */

const moneyCache = new Map<string, Intl.NumberFormat>();

export function money(n: number, currency = "EUR", decimals: 0 | 2 = 2): string {
  const key = `${currency}:${decimals}`;
  let f = moneyCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    moneyCache.set(key, f);
  }
  return f.format(n);
}

/** 1 234,5 → "1 234,50" (sans symbole), pour l'export CSV. */
export function decimalFr(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export function integer(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
}

export function pct(n: number | null, withSign = true): string {
  if (n === null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: abs < 10 ? 1 : 0 }).format(abs);
  if (!withSign) return `${s} %`;
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${s} %`;
}

export function rateLabel(rate: number | null): string {
  if (rate === null) return "Taux non renseigné";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(rate)} %`;
}

function utcDate(ld: string): Date {
  const [y, m, d] = ld.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...opts });
const F_WEEKDAY = fmt({ weekday: "long" });
const F_LONG = fmt({ weekday: "long", day: "numeric", month: "long" });
const F_SHORT = fmt({ day: "numeric", month: "short" });
const F_WD_SHORT = fmt({ weekday: "short", day: "numeric" });
const F_MONTH = fmt({ month: "long", year: "numeric" });
const F_MONTH_ONLY = fmt({ month: "long" });

const cap = (s: string) => s.charAt(0).toLocaleUpperCase("fr") + s.slice(1);

/** "mardi" */
export const weekdayName = (ld: string) => F_WEEKDAY.format(utcDate(ld));
/** "Mardi 3 novembre" */
export const longDate = (ld: string) => cap(F_LONG.format(utcDate(ld)));
/** "3 nov." */
export const shortDate = (ld: string) => F_SHORT.format(utcDate(ld));
/** "mar. 3" */
export const weekdayShort = (ld: string) => F_WD_SHORT.format(utcDate(ld));
/** "Novembre 2026" */
export const monthLabel = (month: string) => cap(F_MONTH.format(utcDate(`${month}-01`)));
/** "novembre" */
export const monthName = (month: string) => F_MONTH_ONLY.format(utcDate(`${month}-01`));

export const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const WEEKDAYS_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

export function hourLabel(h: number): string {
  return `${h}h`;
}
