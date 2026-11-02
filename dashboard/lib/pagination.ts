/**
 * Le href d'un lien "next" SumUp est une chaîne de requête à rejouer sur
 * l'endpoint d'historique. On accepte aussi une URL complète ou relative.
 */
/** Fusionne les paramètres d'origine avec ceux du lien "next" (le lien l'emporte). */
export function nextPageQuery(href: string, base: URLSearchParams): string {
  const q = href.includes("?") ? href.slice(href.indexOf("?") + 1) : href;
  const merged = new URLSearchParams(base);
  const fromLink = new URLSearchParams(q);
  for (const key of new Set(fromLink.keys())) {
    merged.delete(key);
    for (const v of fromLink.getAll(key)) merged.append(key, v);
  }
  return merged.toString();
}
