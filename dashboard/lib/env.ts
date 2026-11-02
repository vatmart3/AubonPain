import "server-only";

/**
 * Lecture centralisée des variables d'environnement côté serveur.
 * Ce module est marqué "server-only" : l'importer depuis un composant client
 * fait échouer le build. SUMUP_API_KEY ne peut donc jamais partir dans le
 * bundle navigateur.
 */

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

function int(name: string, fallback: number, min: number, max: number): number {
  const raw = read(name);
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export const env = {
  get sumupApiKey() {
    return read("SUMUP_API_KEY");
  },
  get sumupMerchantCode() {
    return read("SUMUP_MERCHANT_CODE");
  },
  /** Surchargeable uniquement pour les tests (serveur SumUp simulé en local). */
  get sumupBaseUrl() {
    return (read("SUMUP_API_BASE") ?? "https://api.sumup.com").replace(/\/+$/, "");
  },
  get dashboardPassword() {
    return read("DASHBOARD_PASSWORD");
  },
  /** Facultatif : sinon la clé de session est dérivée du mot de passe. */
  get sessionSecret() {
    return read("SESSION_SECRET");
  },
  /** Fuseau de la boutique : journées, heures et semaines sont calculées dedans. */
  get timeZone() {
    return read("DASHBOARD_TIMEZONE") ?? "Europe/Paris";
  },
  /** Plage horaire affichée sur les courbes et la heatmap. */
  get openHour() {
    return int("OPEN_HOUR", 6, 0, 23);
  },
  get closeHour() {
    return int("CLOSE_HOUR", 20, 1, 24);
  },
};
