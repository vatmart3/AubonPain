import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

/**
 * Garde d'accès : tout est privé sauf la page de connexion, le manifeste
 * et les icônes (nécessaires pour « Ajouter à l'écran d'accueil »).
 * Les routes /api vérifient aussi la session elles-mêmes (double verrou).
 */
export async function proxy(req: NextRequest) {
  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { kind: "auth", title: "Session expirée", message: "Reconnectez-vous pour voir vos ventes." } },
      { status: 401 },
    );
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!login|api/login|api/logout|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|sw.js|offline.html|robots.txt).*)",
  ],
};
