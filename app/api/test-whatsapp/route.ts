import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { destinataires, envoyerWhatsApp } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function memeSecret(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** GET /api/test-whatsapp?secret=… — envoie « Test Au Bon Pain ✅ » aux numéros configurés. */
export async function GET(req: Request) {
  const attendu = process.env.TEST_SECRET;
  const secret = new URL(req.url).searchParams.get('secret') ?? '';
  if (!attendu || !memeSecret(secret, attendu)) return new NextResponse('Not found', { status: 404 });

  const { principal, secours } = destinataires();
  if (!principal) return NextResponse.json({ ok: false, message: 'CALLMEBOT_PHONE / CALLMEBOT_APIKEY manquants.' }, { status: 503 });

  const texte = 'Test Au Bon Pain ✅';
  const [ok, okSecours] = await Promise.all([
    envoyerWhatsApp(principal, texte),
    secours ? envoyerWhatsApp(secours, texte) : Promise.resolve(null),
  ]);
  return NextResponse.json({ ok, secours: okSecours }, { status: ok ? 200 : 502 });
}
