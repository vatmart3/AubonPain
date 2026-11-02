import "server-only";
import { NextResponse } from "next/server";
import { SumUpError } from "./sumup";
import { isAuthenticated } from "./auth";
import type { ApiErrorBody } from "./types";

/**
 * Traduit toute erreur en message lisible pour le commerçant.
 * Le détail technique reste dans les journaux serveur (Vercel → Logs),
 * jamais dans la réponse : aucune fuite de clé ou de corps SumUp.
 */
export function errorResponse(e: unknown): NextResponse<ApiErrorBody> {
  if (e instanceof SumUpError) {
    console.error(`[sumup] ${e.kind}: ${e.message}`);
    const map: Record<string, [number, string, string, string?]> = {
      no_key: [
        500,
        "Clé SumUp manquante",
        "Le tableau de bord n'a pas encore de clé pour lire vos ventes.",
        "Sur Vercel : Settings → Environment Variables → ajouter SUMUP_API_KEY, puis redéployer.",
      ],
      key_format: [
        500,
        "Ce n'est pas la bonne clé",
        "La clé enregistrée est une clé publique (sup_pk_…). Il faut la clé secrète, qui commence par sup_sk_.",
        "SumUp → Paramètres → Développeurs → Clés API.",
      ],
      unauthorized: [
        502,
        "SumUp refuse la clé",
        "La clé API est invalide, expirée ou a été supprimée.",
        "Créez une nouvelle clé secrète dans SumUp (Paramètres → Développeurs → Clés API) et remplacez SUMUP_API_KEY sur Vercel.",
      ],
      forbidden: [
        502,
        "Accès refusé par SumUp",
        "La clé est valide mais n'a pas le droit de lire l'historique de ce commerce.",
        "Vérifiez que SUMUP_MERCHANT_CODE correspond bien au compte de la clé.",
      ],
      not_found: [
        502,
        "Commerce introuvable",
        "SumUp ne connaît pas ce code commerçant.",
        "Vérifiez SUMUP_MERCHANT_CODE (il commence souvent par M, ex. MC4X7ZPQ).",
      ],
      no_merchant: [
        502,
        "Code commerçant introuvable",
        "Impossible de retrouver le code commerçant à partir de la clé.",
        "Renseignez SUMUP_MERCHANT_CODE sur Vercel.",
      ],
      rate_limited: [
        503,
        "SumUp demande de patienter",
        "Trop de demandes en peu de temps. Les chiffres reviennent d'eux-mêmes dans une minute.",
      ],
      unavailable: [
        503,
        "SumUp ne répond pas",
        "Le service SumUp est momentanément indisponible. Nouvel essai automatique dans une minute.",
      ],
      bad_response: [
        502,
        "Réponse inattendue de SumUp",
        "SumUp a renvoyé des données que le tableau de bord ne sait pas lire.",
        "Réessayez plus tard ; si cela persiste, consultez les journaux Vercel.",
      ],
    };
    const [status, title, message, hint] = map[e.kind] ?? map.bad_response;
    return NextResponse.json({ error: { kind: e.kind, title, message, hint } }, { status });
  }
  console.error("[dashboard]", e);
  return NextResponse.json(
    {
      error: {
        kind: "internal",
        title: "Un souci est survenu",
        message: "Le tableau de bord n'a pas pu calculer ces chiffres.",
        hint: "Nouvel essai automatique dans une minute.",
      },
    },
    { status: 500 },
  );
}

/** Enveloppe commune : session obligatoire, pas de cache navigateur, erreurs lisibles. */
export async function handle<T>(fn: () => Promise<T>): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: { kind: "auth", title: "Session expirée", message: "Reconnectez-vous pour voir vos ventes." } },
      { status: 401 },
    );
  }
  try {
    const data = await fn();
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return errorResponse(e);
  }
}

export function badRequest(message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { kind: "bad_request", title: "Demande invalide", message } }, { status: 400 });
}
