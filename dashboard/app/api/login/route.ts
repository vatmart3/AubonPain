import { NextResponse } from "next/server";
import { createSessionToken, passwordMatches, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.DASHBOARD_PASSWORD?.trim()) {
    return NextResponse.json(
      {
        error: {
          kind: "no_password",
          title: "Mot de passe non configuré",
          message: "Ajoutez la variable DASHBOARD_PASSWORD sur Vercel puis redéployez.",
        },
      },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* corps vide ou invalide */
  }

  if (!(await passwordMatches(password))) {
    await new Promise((r) => setTimeout(r, 700)); // freine les essais en rafale
    return NextResponse.json(
      { error: { kind: "bad_password", title: "Mot de passe incorrect", message: "Vérifiez et réessayez." } },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
