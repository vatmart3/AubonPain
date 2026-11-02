import { handle } from "@/lib/api";
import { affluenceView } from "@/lib/views";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const w = Number.parseInt(new URL(req.url).searchParams.get("weeks") ?? "4", 10);
  const weeks = [4, 8, 12].includes(w) ? w : 4;
  return handle(() => affluenceView(weeks));
}
