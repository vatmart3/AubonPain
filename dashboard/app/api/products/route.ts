import { handle } from "@/lib/api";
import { isProductRange, productsView } from "@/lib/views";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const r = new URL(req.url).searchParams.get("range") ?? "7d";
  return handle(() => productsView(isProductRange(r) ? r : "7d"));
}
