/**
 * Règles de commande, partagées entre le formulaire (navigateur) et la route
 * serveur. Le serveur refait toujours tous les contrôles et tous les calculs.
 */

import { z } from 'zod';
import { boutique } from '@/content/boutique';
import { produitParId, type Produit } from '@/content/produits';
import {
  aSete,
  ajouterJours,
  enHHMM,
  enMinutes,
  fermetureExceptionnelle,
  heureLisible,
  jourDeLaSemaine,
  jourLisible,
  plagesDuJour,
  type Instant,
} from '@/lib/temps';

export const QTE_MAX = 50;

// ── Prix ───────────────────────────────────────────────────────────────────

export function prixLisible(centimes: number): string {
  const euros = Math.floor(centimes / 100);
  const cts = String(centimes % 100).padStart(2, '0');
  return `${euros},${cts} €`;
}

export type Ligne = { id: string; qte: number };

export function totalCentimes(lignes: Ligne[]): number {
  return lignes.reduce((t, l) => t + (produitParId.get(l.id)?.prix ?? 0) * l.qte, 0);
}

// ── Jours et créneaux ──────────────────────────────────────────────────────

export function produitDisponible(produit: Produit, iso: string): boolean {
  return !produit.jours || produit.jours.includes(jourDeLaSemaine(iso));
}

export function premierJourCommandable(maintenant: Instant = aSete()): string {
  const { delaiMinJours, heureLimiteVeille } = boutique.commande;
  const enRetard = maintenant.minutes >= enMinutes(heureLimiteVeille);
  return ajouterJours(maintenant.iso, delaiMinJours + (enRetard ? 1 : 0));
}

export type JourCalendrier = {
  iso: string;
  ouvert: boolean;
  /** Pourquoi le jour est grisé. */
  raison?: string;
};

export function joursCalendrier(maintenant: Instant = aSete()): JourCalendrier[] {
  const premier = premierJourCommandable(maintenant);
  const debut = ajouterJours(maintenant.iso, 1);
  const jours: JourCalendrier[] = [];
  for (let n = 0; n < boutique.commande.joursProposes; n++) {
    const iso = ajouterJours(debut, n);
    const exception = fermetureExceptionnelle(iso);
    if (iso < premier) jours.push({ iso, ouvert: false, raison: `trop tard, commande avant ${heureLisible(enMinutes(boutique.commande.heureLimiteVeille))} la veille` });
    else if (exception) jours.push({ iso, ouvert: false, raison: exception.motif ?? 'fermeture exceptionnelle' });
    else if (plagesDuJour(iso).length === 0) jours.push({ iso, ouvert: false, raison: 'fermé' });
    else jours.push({ iso, ouvert: true });
  }
  return jours;
}

export function creneauxDuJour(iso: string): string[] {
  const pas = boutique.commande.pasCreneau;
  const creneaux: string[] = [];
  for (const [debut, fin] of plagesDuJour(iso)) {
    for (let m = enMinutes(debut); m + pas <= enMinutes(fin); m += pas) creneaux.push(enHHMM(m));
  }
  return creneaux;
}

// ── Téléphone ──────────────────────────────────────────────────────────────

/** Accepte 06 12 34 56 78, 06.12.34.56.78, +33 6 12 34 56 78, 0033… Renvoie « 06 12 34 56 78 » ou null. */
export function telephoneFR(saisie: string): string | null {
  const brut = saisie.replace(/[\s.\-()]/g, '');
  const m = brut.match(/^(?:(?:\+|00)33|0)([1-9]\d{8})$/);
  if (!m) return null;
  return `0${m[1]}`.replace(/(\d{2})(?=\d)/g, '$1 ');
}

// ── Schéma ─────────────────────────────────────────────────────────────────

const texte = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    // pas de caractères de contrôle ni de mise en forme WhatsApp détournée
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s{2,}/g, ' '));

export const commandeSchema = z.object({
  lignes: z
    .array(z.object({ id: z.string().max(60), qte: z.number().int().min(1).max(QTE_MAX) }))
    .min(1, 'Le bon est vide.')
    .max(30),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  creneau: z.string().regex(/^\d{2}:\d{2}$/),
  prenom: texte(40).pipe(z.string().min(1, 'Votre prénom, s’il vous plaît.')),
  nom: texte(60).pipe(z.string().min(1, 'Votre nom, s’il vous plaît.')),
  telephone: z.string().max(30),
  remarque: texte(200).optional().default(''),
  speciale: z.boolean().optional().default(false),
  demandeSpeciale: texte(400).optional().default(''),
  consentement: z.literal(true, { error: 'Merci de cocher la case pour que l’on puisse vous rappeler.' }),
  /** Champ piège, invisible pour les humains. */
  site: z.string().max(200).optional().default(''),
  /** Temps passé sur le formulaire, en millisecondes. */
  duree: z.number().nonnegative().optional().default(0),
});

export type CommandeBrute = z.input<typeof commandeSchema>;

export type CommandeValide = Omit<z.output<typeof commandeSchema>, 'telephone'> & {
  telephone: string;
  total: number;
};

export type Resultat =
  | { ok: true; commande: CommandeValide }
  | { ok: false; erreurs: Record<string, string> };

/**
 * Validation complète : forme des champs, produits existants et disponibles
 * ce jour-là, jour ouvert et commandable, créneau dans les horaires, téléphone.
 */
export function validerCommande(donnees: unknown, maintenant: Instant = aSete()): Resultat {
  const analyse = commandeSchema.safeParse(donnees);
  if (!analyse.success) {
    const erreurs: Record<string, string> = {};
    for (const issue of analyse.error.issues) {
      const cle = String(issue.path[0] ?? 'formulaire');
      erreurs[cle] ??= issue.message;
    }
    return { ok: false, erreurs };
  }
  const c = analyse.data;
  const erreurs: Record<string, string> = {};

  const ids = new Set<string>();
  for (const l of c.lignes) {
    const p = produitParId.get(l.id);
    if (!p) erreurs.lignes = 'Un produit du bon n’existe plus. Rechargez la page.';
    else if (!produitDisponible(p, c.date)) erreurs.lignes = `${p.nom} : pas ce jour-là.`;
    if (ids.has(l.id)) erreurs.lignes = 'Un produit apparaît deux fois.';
    ids.add(l.id);
  }

  const jour = joursCalendrier(maintenant).find((j) => j.iso === c.date);
  if (!jour || !jour.ouvert) erreurs.date = 'Ce jour-là, on ne peut pas préparer de commande.';
  else if (!creneauxDuJour(c.date).includes(c.creneau)) erreurs.creneau = 'Ce créneau est en dehors des horaires.';

  const tel = telephoneFR(c.telephone);
  if (!tel) erreurs.telephone = 'Ce numéro ne ressemble pas à un numéro français.';

  if (c.speciale && !c.demandeSpeciale) erreurs.demandeSpeciale = 'Dites-nous en deux mots ce qu’il vous faut.';

  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return {
    ok: true,
    commande: { ...c, telephone: tel!, demandeSpeciale: c.speciale ? c.demandeSpeciale : '', total: totalCentimes(c.lignes) },
  };
}

// ── Numéro et message ──────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function numeroCommande(): string {
  const octets = crypto.getRandomValues(new Uint8Array(4));
  return 'AB-' + Array.from(octets, (o) => ALPHABET[o % ALPHABET.length]).join('');
}

const LIMITE_MESSAGE = 1000;

function couper(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

/** Message WhatsApp, formaté pour être lu d'un coup d'œil derrière le comptoir. */
export function messageWhatsApp(c: CommandeValide, id: string): string {
  const retrait = `${jourLisible(c.date)}, vers ${heureLisible(enMinutes(c.creneau))}`;
  const lignes = c.lignes.map((l) => `${l.qte} × ${produitParId.get(l.id)!.nom}`);
  const tete = [
    `🥖 *NOUVELLE COMMANDE* — ${id}`,
    `👤 ${c.prenom} ${c.nom} — ${c.telephone}`,
    `📅 Retrait : ${retrait}`,
    '',
  ];
  const pied = [`💶 Total indicatif : ${prixLisible(c.total).replace(' ', ' ')} — paiement en boutique`];

  const notes: string[] = [];
  if (c.remarque) notes.push(`💬 « ${c.remarque} »`);
  if (c.demandeSpeciale) notes.push(`⭐ Commande spéciale : ${c.demandeSpeciale}`);

  const assembler = (corps: string[], n: string[]) =>
    [...tete, ...corps, '', ...n, ...pied].join('\n').replace(/\n{3,}/g, '\n\n');

  let message = assembler(lignes, notes);
  if (message.length > LIMITE_MESSAGE) {
    // On raccourcit d'abord les notes, puis la liste.
    const place = Math.max(40, LIMITE_MESSAGE - assembler(lignes, []).length - 4);
    message = assembler(lignes, [couper(notes.join('\n'), place)]);
  }
  if (message.length > LIMITE_MESSAGE) {
    const garde: string[] = [];
    for (const l of lignes) {
      if (assembler([...garde, l, '… (liste coupée, rappeler le client)'], []).length > LIMITE_MESSAGE) break;
      garde.push(l);
    }
    message = assembler([...garde, '… (liste coupée, rappeler le client)'], []);
  }
  return message;
}
