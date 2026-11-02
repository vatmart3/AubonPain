import { NextResponse } from "next/server";
import { badRequest, errorResponse } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { today } from "@/lib/data";
import { toCsv } from "@/lib/csv";
import { isMonth, monthOf } from "@/lib/time";
import { comptaView } from "@/lib/views";
import type { ComptaView } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Export CSV mensuel pour le comptable : une ligne par jour + total. */
export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: { kind: "auth", title: "Session expirée", message: "Reconnectez-vous." } }, { status: 401 });
  }
  const m = new URL(req.url).searchParams.get("month") ?? "";
  if (!isMonth(m) || m > monthOf(today())) return badRequest("Mois invalide.");

  let view: ComptaView;
  try {
    view = await comptaView(m);
  } catch (e) {
    return errorResponse(e);
  }

  if (!view.coverage.complete) {
    return NextResponse.json(
      {
        error: {
          kind: "incomplete",
          title: "Analyse pas encore terminée",
          message: `${view.coverage.analyzed} tickets analysés sur ${view.coverage.total}. L'export sera disponible dès que tout le mois est lu.`,
        },
      },
      { status: 409 },
    );
  }

  return new NextResponse(toCsv(view), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="au-bon-pain_ventes-carte_${m}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
