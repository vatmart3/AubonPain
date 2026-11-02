/**
 * Jeton de session signé (HMAC-SHA256, Web Crypto) — utilisable dans proxy.ts
 * comme dans les routes. Format : base64url(payload).base64url(signature).
 * La clé dérive de SESSION_SECRET, à défaut de DASHBOARD_PASSWORD : changer
 * le mot de passe déconnecte donc tous les appareils.
 */

export const SESSION_COOKIE = "abp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

const enc = new TextEncoder();

function secretMaterial(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  const password = process.env.DASHBOARD_PASSWORD?.trim();
  if (secret) return `secret:${secret}`;
  if (password) return `password:${password}`;
  return null;
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

async function hmacKey(material: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(`abp-session-v1|${material}`), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionToken(nowMs = Date.now()): Promise<string> {
  const material = secretMaterial();
  if (!material) throw new Error("DASHBOARD_PASSWORD manquant");
  const payload = b64url(enc.encode(JSON.stringify({ v: 1, exp: Math.floor(nowMs / 1000) + SESSION_MAX_AGE })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(material), enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySessionToken(token: string | undefined, nowMs = Date.now()): Promise<boolean> {
  const material = secretMaterial();
  if (!material || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(material), fromB64url(sig) as BufferSource, enc.encode(payload));
    if (!ok) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { exp?: number };
    return typeof data.exp === "number" && data.exp * 1000 > nowMs;
  } catch {
    return false;
  }
}

/** Comparaison à durée constante (évite de deviner le mot de passe au chronomètre). */
export async function passwordMatches(candidate: string): Promise<boolean> {
  const expected = process.env.DASHBOARD_PASSWORD?.trim();
  if (!expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(candidate)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
