import { test } from "node:test";
import assert from "node:assert/strict";

process.env.DASHBOARD_PASSWORD = "fournil";
const { createSessionToken, verifySessionToken, passwordMatches, SESSION_MAX_AGE } = await import("../lib/session.ts");

test("jeton valide 30 jours, puis refusé", async () => {
  const now = Date.now();
  const t = await createSessionToken(now);
  assert.equal(await verifySessionToken(t, now), true);
  assert.equal(await verifySessionToken(t, now + (SESSION_MAX_AGE - 60) * 1000), true);
  assert.equal(await verifySessionToken(t, now + (SESSION_MAX_AGE + 60) * 1000), false);
});

test("jeton falsifié ou mot de passe changé : refusé", async () => {
  const t = await createSessionToken();
  const [p, s] = t.split(".");
  assert.equal(await verifySessionToken(`${p}x.${s}`), false);
  assert.equal(await verifySessionToken("n'importe-quoi"), false);
  assert.equal(await verifySessionToken(undefined), false);
  process.env.DASHBOARD_PASSWORD = "autre";
  assert.equal(await verifySessionToken(t), false);
  process.env.DASHBOARD_PASSWORD = "fournil";
});

test("mot de passe", async () => {
  assert.equal(await passwordMatches("fournil"), true);
  assert.equal(await passwordMatches("Fournil"), false);
  assert.equal(await passwordMatches(""), false);
});
