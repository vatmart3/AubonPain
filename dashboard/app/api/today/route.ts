import { handle } from "@/lib/api";
import { todayView } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(todayView);
}
