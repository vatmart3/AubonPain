import { handle } from "@/lib/api";
import { env } from "@/lib/env";
import { getMe } from "@/lib/sumup";
import type { StatusView } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Valide la connexion SumUp (GET /v0.1/me) et renvoie le nom du commerce. */
export async function GET() {
  return handle<StatusView>(async () => {
    const me = await getMe();
    const key = env.sumupApiKey ?? "";
    return {
      merchantName: me.name,
      merchantCode: env.sumupMerchantCode ?? me.merchantCode,
      currency: me.currency ?? "EUR",
      timeZone: env.timeZone,
      keyWarning: key && !key.startsWith("sup_sk_") ? "La clé ne commence pas par sup_sk_ : vérifiez qu'il s'agit bien de la clé secrète." : null,
    };
  });
}
