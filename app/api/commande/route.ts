import { NextResponse } from 'next/server';
import { boutique } from '@/content/boutique';
import { messageWhatsApp, numeroCommande, validerCommande } from '@/lib/commande';
import { destinataires, envoyerWhatsApp } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DUREE_MIN_MS = 4000;
const FENETRE_MS = 10 * 60 * 1000;
const ENVOIS_MAX = 3;

/** Limite par IP, en mémoire : au mieux, une instance serverless à la fois. */
const envoisParIp = new Map<string, number[]>();

function tropDEnvois(ip: string, maintenant = Date.now()): boolean {
  const recents = (envoisParIp.get(ip) ?? []).filter((t) => maintenant - t < FENETRE_MS);
  envoisParIp.set(ip, recents);
  if (envoisParIp.size > 5000) {
    for (const [cle, ts] of envoisParIp) if (!ts.some((t) => maintenant - t < FENETRE_MS)) envoisParIp.delete(cle);
  }
  return recents.length >= ENVOIS_MAX;
}

function noterEnvoi(ip: string) {
  envoisParIp.set(ip, [...(envoisParIp.get(ip) ?? []), Date.now()]);
}

const erreur = (status: number, message: string, erreurs?: Record<string, string>) =>
  NextResponse.json({ ok: false, message, erreurs }, { status });

export async function POST(req: Request) {
  let donnees: unknown;
  try {
    donnees = await req.json();
  } catch {
    return erreur(400, 'Commande illisible.');
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'inconnue';

  const resultat = validerCommande(donnees);
  if (!resultat.ok) return erreur(422, 'Il manque quelque chose sur le bon.', resultat.erreurs);
  const commande = resultat.commande;

  // Anti-robots : champ piège rempli, ou formulaire rempli en moins de 4 secondes.
  // On répond « ok » sans rien envoyer, pour ne pas renseigner le robot.
  if (commande.site || commande.duree < DUREE_MIN_MS) {
    return NextResponse.json({ ok: true, id: numeroCommande(), total: commande.total });
  }

  if (tropDEnvois(ip)) {
    return erreur(429, `Plusieurs commandes viennent d’être envoyées. Appelez-nous au ${boutique.telephone.affiche}.`);
  }

  const id = numeroCommande();
  const message = messageWhatsApp(commande, id);
  const { principal, secours } = destinataires();

  if (!principal) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[commande] CallMeBot non configuré, message non envoyé :\n${message}`);
      noterEnvoi(ip);
      return NextResponse.json({ ok: true, id, total: commande.total, test: true });
    }
    console.error('[commande] CALLMEBOT_PHONE / CALLMEBOT_APIKEY manquants');
    return erreur(503, 'La commande n’a pas pu partir.');
  }

  const [envoye] = await Promise.all([
    envoyerWhatsApp(principal, message),
    secours ? envoyerWhatsApp(secours, message) : Promise.resolve(false),
  ]);

  if (!envoye) return erreur(502, 'La commande n’a pas pu partir.');

  noterEnvoi(ip);
  return NextResponse.json({ ok: true, id, total: commande.total });
}
