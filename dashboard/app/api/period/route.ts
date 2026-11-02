import { badRequest, handle } from "@/lib/api";
import { periodView } from "@/lib/views";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const kind = sp.get("kind") === "month" ? "month" : "week";
  const offset = Number.parseInt(sp.get("offset") ?? "0", 10);
  if (!Number.isFinite(offset) || offset > 0 || offset < -60) return badRequest("Période hors limites.");
  return handle(() => periodView(kind, offset));
}
