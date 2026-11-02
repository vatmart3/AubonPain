/**
 * Outils de dates dans le fuseau de la boutique (Europe/Paris par défaut).
 * Une "date locale" est une chaîne "AAAA-MM-JJ" ; un instant est un Date (UTC).
 * Aucune dépendance : module pur, testé dans tests/time.test.ts.
 */

export type LocalDate = string;

export interface LocalParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = lundi … 6 = dimanche */
  weekday: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(tz: string): Intl.DateTimeFormat {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    });
    formatters.set(tz, f);
  }
  return f;
}

const WEEKDAYS: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export function localParts(date: Date, tz: string): LocalParts {
  const out: Record<string, string> = {};
  for (const p of formatter(tz).formatToParts(date)) out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: WEEKDAYS[out.weekday] ?? 0,
  };
}

/** Décalage du fuseau à cet instant, en millisecondes (Paris l'été : +2 h). */
export function tzOffsetMs(date: Date, tz: string): number {
  const p = localParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const truncated = Math.floor(date.getTime() / 1000) * 1000;
  return asUtc - truncated;
}

/** Instant correspondant à une heure murale dans le fuseau (gère les changements d'heure). */
export function zonedTime(ld: LocalDate, hour: number, minute: number, tz: string): Date {
  const [y, m, d] = ld.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  let t = guess - tzOffsetMs(new Date(guess), tz);
  // Deuxième passe : l'offset peut différer de part et d'autre d'un changement d'heure.
  const off2 = tzOffsetMs(new Date(t), tz);
  t = guess - off2;
  return new Date(t);
}

export function startOfLocalDay(ld: LocalDate, tz: string): Date {
  return zonedTime(ld, 0, 0, tz);
}

export function localDateOf(date: Date, tz: string): LocalDate {
  const p = localParts(date, tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Arithmétique calendaire pure (sans fuseau). */
export function addDays(ld: LocalDate, n: number): LocalDate {
  const [y, m, d] = ld.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** 0 = lundi … 6 = dimanche */
export function weekdayOf(ld: LocalDate): number {
  const [y, m, d] = ld.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export function startOfWeek(ld: LocalDate): LocalDate {
  return addDays(ld, -weekdayOf(ld));
}

export function monthOf(ld: LocalDate): string {
  return ld.slice(0, 7);
}

export function monthStart(month: string): LocalDate {
  return `${month}-01`;
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`;
}

/** Liste des dates de `from` à `to` incluses. */
export function dayRange(from: LocalDate, to: LocalDate): LocalDate[] {
  const out: LocalDate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function diffDays(a: LocalDate, b: LocalDate): number {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export function isLocalDate(s: unknown): s is LocalDate {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function isMonth(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}
