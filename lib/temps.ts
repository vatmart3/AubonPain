/**
 * L'heure de Sète, quelle que soit l'heure du téléphone ou du serveur.
 * Tout ce qui dépend de l'heure (ouvert/fermé, frise du four, calendrier de
 * commande, validation serveur) passe par ici.
 */

import { boutique, joursSemaine, type Plage } from '@/content/boutique';

const FUSEAU = 'Europe/Paris';

const moisNoms = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

export type Instant = {
  /** AAAA-MM-JJ, date à Sète. */
  iso: string;
  /** 0 = dimanche … 6 = samedi. */
  jour: number;
  /** Minutes depuis minuit, heure de Sète. */
  minutes: number;
};

const formateur = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSEAU,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function aSete(date: Date = new Date()): Instant {
  const parts = Object.fromEntries(formateur.formatToParts(date).map((p) => [p.type, p.value]));
  const iso = `${parts.year}-${parts.month}-${parts.day}`;
  return { iso, jour: jourDeLaSemaine(iso), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function jourDeLaSemaine(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function ajouterJours(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function enMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function enHHMM(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** 390 → « 6h30 », 780 → « 13h ». */
export function heureLisible(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** « 2026-10-03 » → « samedi 3 octobre ». */
export function jourLisible(iso: string, avecJourSemaine = true): string {
  const [, m, d] = iso.split('-').map(Number);
  const base = `${d === 1 ? '1er' : d} ${moisNoms[m - 1]}`;
  return avecJourSemaine ? `${joursSemaine[jourDeLaSemaine(iso)]} ${base}` : base;
}

export function moisCourt(iso: string): string {
  return moisNoms[Number(iso.slice(5, 7)) - 1];
}

export function fermetureExceptionnelle(iso: string) {
  return boutique.fermeturesExceptionnelles.find((f) => f.date === iso);
}

export function plagesDuJour(iso: string): readonly Plage[] {
  if (fermetureExceptionnelle(iso)) return [];
  return boutique.horaires[jourDeLaSemaine(iso) as 0 | 1 | 2 | 3 | 4 | 5 | 6];
}

export type Statut =
  | { ouvert: true; fermeA: number }
  | { ouvert: false; prochaine: { iso: string; minutes: number; dansJours: number } | null };

export function statutBoutique(maintenant: Instant = aSete()): Statut {
  for (const [debut, fin] of plagesDuJour(maintenant.iso)) {
    if (maintenant.minutes >= enMinutes(debut) && maintenant.minutes < enMinutes(fin)) {
      return { ouvert: true, fermeA: enMinutes(fin) };
    }
  }
  for (let n = 0; n < 30; n++) {
    const iso = ajouterJours(maintenant.iso, n);
    for (const [debut] of plagesDuJour(iso)) {
      const m = enMinutes(debut);
      if (n > 0 || m > maintenant.minutes) return { ouvert: false, prochaine: { iso, minutes: m, dansJours: n } };
    }
  }
  return { ouvert: false, prochaine: null };
}

/** « aujourd'hui », « demain », « lundi »… */
export function quandLisible(iso: string, dansJours: number): string {
  if (dansJours === 0) return 'aujourd’hui';
  if (dansJours === 1) return 'demain';
  if (dansJours < 7) return joursSemaine[jourDeLaSemaine(iso)];
  return `le ${jourLisible(iso, false)}`;
}

/** Texte court pour la vitre et les bandeaux. */
export function statutCourt(s: Statut): { etat: 'OUVERT' | 'FERMÉ'; suite: string } {
  if (s.ouvert) return { etat: 'OUVERT', suite: `jusqu’à ${heureLisible(s.fermeA)}` };
  if (!s.prochaine) return { etat: 'FERMÉ', suite: 'appelez-nous' };
  const quand = quandLisible(s.prochaine.iso, s.prochaine.dansJours);
  const verbe = s.prochaine.dansJours === 0 ? 'on ouvre' : 'on rouvre';
  return { etat: 'FERMÉ', suite: `${verbe} ${quand} ${heureLisible(s.prochaine.minutes)}` };
}
