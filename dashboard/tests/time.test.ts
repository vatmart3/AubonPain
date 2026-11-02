import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, addMonths, dayRange, daysInMonth, localDateOf, localParts, startOfLocalDay, startOfWeek, weekdayOf, zonedTime } from "../lib/time.ts";

const TZ = "Europe/Paris";

test("minuit à Paris, heure d'hiver et d'été", () => {
  assert.equal(startOfLocalDay("2026-01-15", TZ).toISOString(), "2026-01-14T23:00:00.000Z");
  assert.equal(startOfLocalDay("2026-07-15", TZ).toISOString(), "2026-07-14T22:00:00.000Z");
});

test("jours de changement d'heure", () => {
  // 29 mars 2026 : passage à l'heure d'été (journée de 23 h)
  const a = startOfLocalDay("2026-03-29", TZ).getTime();
  const b = startOfLocalDay("2026-03-30", TZ).getTime();
  assert.equal((b - a) / 3_600_000, 23);
  // 25 octobre 2026 : retour à l'heure d'hiver (journée de 25 h)
  const c = startOfLocalDay("2026-10-25", TZ).getTime();
  const d = startOfLocalDay("2026-10-26", TZ).getTime();
  assert.equal((d - c) / 3_600_000, 25);
  assert.equal(zonedTime("2026-10-25", 7, 30, TZ).toISOString(), "2026-10-25T06:30:00.000Z");
});

test("date locale d'un instant tardif en UTC", () => {
  // 23h30 UTC le 2 nov. = 0h30 le 3 nov. à Paris
  assert.equal(localDateOf(new Date("2026-11-02T23:30:00Z"), TZ), "2026-11-03");
  assert.equal(localParts(new Date("2026-11-02T23:30:00Z"), TZ).hour, 0);
});

test("calendrier", () => {
  assert.equal(weekdayOf("2026-11-02"), 0); // lundi
  assert.equal(weekdayOf("2026-11-08"), 6); // dimanche
  assert.equal(startOfWeek("2026-11-08"), "2026-11-02");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(daysInMonth("2028-02"), 29);
  assert.equal(addMonths("2026-01", -1), "2025-12");
  assert.deepEqual(dayRange("2026-10-30", "2026-11-02"), ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
});
