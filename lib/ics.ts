import { boutique } from '@/content/boutique';
import { produitParId } from '@/content/produits';
import { ajouterJours, enMinutes } from '@/lib/temps';
import type { Ligne } from '@/lib/commande';

const echapper = (s: string) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

/**
 * Fichier .ics pour « Ajouter à mon agenda ». Heure flottante en Europe/Paris
 * (TZID), ce que comprennent Google Agenda, Apple Calendrier et Outlook.
 */
export function fichierIcs(o: { id: string; date: string; creneau: string; lignes: Ligne[] }): string {
  const jour = o.date.replace(/-/g, '');
  const debut = enMinutes(o.creneau);
  const fin = debut + 15;
  const hh = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}00`;
  const liste = o.lignes.map((l) => `${l.qte} × ${produitParId.get(l.id)?.nom ?? l.id}`).join('\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const adresse = `${boutique.adresse.rue}, ${boutique.adresse.codePostal} ${boutique.adresse.ville}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Au Bon Pain Sete//Commande//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${o.id}-${jour}@aubonpain-sete`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Paris:${jour}T${hh(debut)}`,
    `DTEND;TZID=Europe/Paris:${fin >= 1440 ? ajouterJours(o.date, 1).replace(/-/g, '') : jour}T${hh(fin % 1440)}`,
    `SUMMARY:${echapper(`Retrait commande Au Bon Pain (${o.id})`)}`,
    `LOCATION:${echapper(adresse)}`,
    `DESCRIPTION:${echapper(`${liste}\n\nPaiement en boutique. Tél. ${boutique.telephone.affiche}`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Commande à retirer chez Au Bon Pain',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
