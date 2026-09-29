import 'server-only';

/**
 * Envoi via CallMeBot. Chaque numéro a sa propre clé.
 * Les clés ne quittent jamais le serveur.
 */

type Destinataire = { phone: string; apikey: string };

export function destinataires(): { principal: Destinataire | null; secours: Destinataire | null } {
  const principal =
    process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY
      ? { phone: process.env.CALLMEBOT_PHONE, apikey: process.env.CALLMEBOT_APIKEY }
      : null;
  const secours =
    process.env.CALLMEBOT_PHONE_BACKUP && process.env.CALLMEBOT_APIKEY_BACKUP
      ? { phone: process.env.CALLMEBOT_PHONE_BACKUP, apikey: process.env.CALLMEBOT_APIKEY_BACKUP }
      : null;
  return { principal, secours };
}

export async function envoyerWhatsApp(d: Destinataire, texte: string): Promise<boolean> {
  const url =
    'https://api.callmebot.com/whatsapp.php' +
    `?phone=${encodeURIComponent(d.phone)}` +
    `&text=${encodeURIComponent(texte)}` +
    `&apikey=${encodeURIComponent(d.apikey)}`;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const corps = await res.text();
    // CallMeBot répond 200 même pour certaines erreurs : on lit le corps.
    if (res.ok && /message (queued|sent)/i.test(corps)) return true;
    if (!res.ok || /error|invalid|not allowed|not active/i.test(corps)) {
      console.error('[callmebot] refus', res.status, corps.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[callmebot] échec', e instanceof Error ? e.message : e);
    return false;
  }
}
