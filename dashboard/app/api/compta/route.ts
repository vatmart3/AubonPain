import { badRequest, handle } from "@/lib/api";
import { comptaView } from "@/lib/views";
import { today } from "@/lib/data";
import { isMonth, monthOf } from "@/lib/time";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const m = new URL(req.url).searchParams.get("month") ?? monthOf(today());
  if (!isMonth(m) || m > monthOf(today())) return badRequest("Mois invalide.");
  return handle(() => comptaView(m));
}
