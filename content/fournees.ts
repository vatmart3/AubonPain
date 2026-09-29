/**
 * Ce qui sort du four, et à quelle heure (heure de Sète).
 * Sert à la frise « L'heure du four » de la page d'accueil.
 *
 * [À VALIDER] TOUTES LES HEURES sont à confirmer avec Madame Vatuone :
 * elles ont été posées pour faire fonctionner la frise.
 * `phrase` est la fin de « Il est 9h42. … sortis il y a 12 minutes. »
 */

export type Fournee = {
  heure: string; // "HH:MM"
  quoi: string;
  /** Sujet de la phrase d'en-tête : « Les croissants sont sortis… » */
  sujet: string;
  /** « sortis », « sorties », « sorti »… accordé au sujet. */
  participe: string;
  detail?: string;
  /** Jours concernés (0 = dimanche … 6 = samedi). Absent = tous les jours d'ouverture. */
  jours?: number[];
};

export const fournees: Fournee[] = [
  { heure: '06:15', quoi: 'Première fournée de baguettes', sujet: 'Les premières baguettes', participe: 'sorties', detail: 'Pour ceux qui passent avant le travail.' },
  { heure: '06:30', quoi: 'Croissants et pains au chocolat', sujet: 'Les croissants', participe: 'sortis', detail: 'Le rideau se lève, ils sont déjà sur le comptoir.' },
  { heure: '07:15', quoi: 'Pains aux raisins géants', sujet: 'Les pains aux raisins', participe: 'sortis', detail: 'Ils ne passent généralement pas 10h.' },
  { heure: '08:00', quoi: 'Deuxième fournée de baguettes', sujet: 'Les baguettes de la deuxième fournée', participe: 'sorties' },
  { heure: '09:30', quoi: 'Plaques de pizza', sujet: 'La pizza', participe: 'sortie', detail: 'À la part ou à la plaque.' },
  { heure: '10:30', quoi: 'Baguettes du midi', sujet: 'Les baguettes du midi', participe: 'sorties', detail: 'Pour les sandwichs et le déjeuner.' },
  { heure: '11:30', quoi: 'Plaques de tartes et gaufres', sujet: 'Les tartes', participe: 'sorties' },
];
