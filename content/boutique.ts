/**
 * Tout ce qui décrit la boutique. C'est le fichier à modifier en premier.
 *
 * Les éléments suivis de [À VALIDER] sont à confirmer avec Madame Vatuone
 * avant la mise en ligne.
 */

export type Plage = readonly [ouverture: string, fermeture: string]; // "HH:MM"

/** 0 = dimanche, 1 = lundi … 6 = samedi (comme Date.getDay()). */
export type Semaine = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, readonly Plage[]>;

export const boutique = {
  nom: 'Au Bon Pain',
  activite: 'Boulangerie-pâtisserie de quartier',
  gerante: 'Béatrice Marty Vatuone',
  appellation: 'Madame Vatuone',

  adresse: {
    rue: '36 rue Paul Bousquet',
    codePostal: '34200',
    ville: 'Sète',
    pays: 'FR',
  },
  geo: { lat: 43.4113, lng: 3.68912 },

  telephone: {
    affiche: '04 67 53 59 31',
    lien: '+33467535931',
  },

  /**
   * Horaires d'ouverture, heure de Sète.
   * [À VALIDER] certaines fiches en ligne indiquent aussi 16h–19h en semaine.
   * Pour l'ajouter : ['06:30', '13:00'], ['16:00', '19:00'] sur les jours concernés.
   */
  horaires: {
    1: [['06:30', '13:00']],
    2: [['06:30', '13:00']],
    3: [['06:30', '13:00']],
    4: [['06:30', '13:00']],
    5: [['06:30', '13:00']],
    6: [['07:00', '13:00']],
    0: [],
  } satisfies Semaine as Semaine,

  /**
   * Jours de fermeture exceptionnelle (congés, jours fériés…), format AAAA-MM-JJ.
   * Ils sont grisés dans le calendrier de commande et le site affiche « fermé ».
   * [À VALIDER] congés annuels, jours fériés travaillés ou non.
   */
  fermeturesExceptionnelles: [
    // { date: '2026-12-25', motif: 'Noël' },
  ] as { date: string; motif?: string }[],

  /**
   * Règles de commande en ligne.
   * [À VALIDER] délai et heure limite avec la boulangère.
   */
  commande: {
    /** Commande au plus tôt pour J + delaiMinJours… */
    delaiMinJours: 1,
    /** …à condition de commander avant cette heure la veille. Sinon J + 2. */
    heureLimiteVeille: '18:00',
    /** Nombre de jours proposés dans le calendrier. */
    joursProposes: 14,
    /** Durée d'un créneau de retrait, en minutes. */
    pasCreneau: 30,
  },

  /** Espèces : acceptées de droit en France, mais [À VALIDER] pour l'affichage. */
  paiements: ['CB', 'sans contact', 'espèces', 'titres-restaurant Pluxee'],
  services: ['Vente à emporter', 'Commande en ligne, retrait en boutique'],

  reputation: {
    /** [À VALIDER] à mettre à jour de temps en temps. */
    note: 4.4,
    nombreAvis: 'plus de 50',
  },

  liens: {
    /** [À VALIDER] lien direct vers la fiche Google (bouton « Partager » de Google Maps). */
    ficheGoogle:
      'https://www.google.com/maps/search/?api=1&query=Au%20Bon%20Pain%2036%20rue%20Paul%20Bousquet%2034200%20S%C3%A8te',
    googleMaps:
      'https://www.google.com/maps/dir/?api=1&destination=43.4113,3.68912&travelmode=walking',
    appleMaps: 'https://maps.apple.com/?daddr=43.4113,3.68912&dirflg=w&q=Au%20Bon%20Pain',
  },

  /** [À VALIDER] SIRET pour les mentions légales. */
  siret: '[À VALIDER]',
  /** [À VALIDER] nom de domaine définitif. */
  domaine: 'aubonpain-sete.fr',
} as const;

export const joursSemaine = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const;
