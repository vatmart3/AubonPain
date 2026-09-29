/**
 * Le catalogue commandable.
 *
 * [À VALIDER] TOUS LES PRIX sont provisoires : ils ont été posés pour que le
 * site fonctionne, pas relevés en boutique. Les produits marqués aValider
 * sont supposés (classiques d'une boulangerie) et non confirmés.
 *
 * Pour ajouter une vraie photo : déposer le fichier détouré (fond transparent,
 * .webp ou .png, environ 800 px de large) dans public/photos/produits/ et
 * renseigner `photo: '/photos/produits/nom-du-fichier.webp'`. Tant qu'il n'y a
 * pas de photo, le site affiche un dessin.
 */

import type { Illustration } from '@/components/Illustrations/Illustrations';

export type Categorie = 'pains' | 'viennoiseries' | 'douceurs' | 'sale' | 'plaques';

export const categories: { id: Categorie; nom: string; court: string }[] = [
  { id: 'pains', nom: 'Les pains', court: 'Pains' },
  { id: 'viennoiseries', nom: 'Les viennoiseries', court: 'Viennoiseries' },
  { id: 'douceurs', nom: 'Les douceurs', court: 'Douceurs' },
  { id: 'sale', nom: 'Le salé', court: 'Salé' },
  { id: 'plaques', nom: 'Les plaques entières', court: 'Plaques' },
];

export type Produit = {
  id: string;
  nom: string;
  categorie: Categorie;
  /** Prix en centimes. [À VALIDER] */
  prix: number;
  /** « pièce », « les 6 », « la plaque »… */
  unite: string;
  /** Une ligne, montrée au dos de l'étiquette. */
  description: string;
  illustration: Illustration;
  photo?: string;
  /** Jours où le produit est fait (0 = dimanche … 6 = samedi). Absent = tous les jours d'ouverture. */
  jours?: number[];
  /** Posé sur le comptoir de la page d'accueil. */
  surComptoir?: boolean;
  /** Produit supposé, à confirmer. */
  aValider?: boolean;
};

export const produits: Produit[] = [
  // ── Pains ──────────────────────────────────────────────────────────────
  {
    id: 'baguette',
    nom: 'Baguette',
    categorie: 'pains',
    prix: 110,
    unite: 'pièce',
    description: 'Croûte qui chante, mie moelleuse. Celle de tous les jours.',
    illustration: 'baguette',
    surComptoir: true,
  },
  {
    id: 'baguette-tradition',
    nom: 'Baguette tradition',
    categorie: 'pains',
    prix: 130,
    unite: 'pièce',
    description: 'Farine de tradition, pousse plus longue.', // [À VALIDER]
    illustration: 'baguette',
    aValider: true,
  },
  {
    id: 'pain-campagne',
    nom: 'Pain de campagne',
    categorie: 'pains',
    prix: 320,
    unite: 'pièce',
    description: 'Une grosse miche qui tient la semaine.', // [À VALIDER]
    illustration: 'campagne',
    surComptoir: true,
    aValider: true,
  },
  {
    id: 'pain-mie',
    nom: 'Pain de mie',
    categorie: 'pains',
    prix: 290,
    unite: 'pièce',
    description: 'Tranché sur demande, pour les tartines du dimanche.', // [À VALIDER]
    illustration: 'mie',
    aValider: true,
  },

  // ── Viennoiseries ──────────────────────────────────────────────────────
  {
    id: 'croissant',
    nom: 'Croissant',
    categorie: 'viennoiseries',
    prix: 110,
    unite: 'pièce',
    description: 'Feuilleté au beurre. Les habitués les prennent par six.',
    illustration: 'croissant',
    surComptoir: true,
  },
  {
    id: 'pain-au-chocolat',
    nom: 'Pain au chocolat',
    categorie: 'viennoiseries',
    prix: 120,
    unite: 'pièce',
    description: 'Deux barres de chocolat, pas une de moins.',
    illustration: 'painChocolat',
    surComptoir: true,
  },
  {
    id: 'pain-aux-raisins',
    nom: 'Pain aux raisins',
    categorie: 'viennoiseries',
    prix: 160,
    unite: 'pièce',
    description: 'Le géant. Il part en général avant 10h.',
    illustration: 'painRaisins',
    surComptoir: true,
  },
  {
    id: 'chausson-pommes',
    nom: 'Chausson aux pommes',
    categorie: 'viennoiseries',
    prix: 170,
    unite: 'pièce',
    description: 'Compote maison, pâte feuilletée.', // [À VALIDER]
    illustration: 'chausson',
    aValider: true,
  },

  // ── Douceurs ───────────────────────────────────────────────────────────
  {
    id: 'sables',
    nom: 'Petits sablés',
    categorie: 'douceurs',
    prix: 450,
    unite: 'le sachet',
    description: 'Ceux qu’on grignote sur le chemin du retour.',
    illustration: 'sables',
    surComptoir: true,
  },
  {
    id: 'gaufre',
    nom: 'Gaufre',
    categorie: 'douceurs',
    prix: 250,
    unite: 'pièce',
    description: 'Dorée, sucre glace à la demande.',
    illustration: 'gaufre',
    surComptoir: true,
  },
  {
    id: 'part-tarte',
    nom: 'Part de tarte',
    categorie: 'douceurs',
    prix: 280,
    unite: 'la part',
    description: 'Selon les fruits du moment.', // [À VALIDER]
    illustration: 'tarte',
    surComptoir: true,
    aValider: true,
  },

  // ── Salé ───────────────────────────────────────────────────────────────
  {
    id: 'sandwich',
    nom: 'Sandwich',
    categorie: 'sale',
    prix: 450,
    unite: 'pièce',
    description: 'Sur baguette du matin. Garnitures du jour en boutique.', // [À VALIDER]
    illustration: 'sandwich',
    jours: [1, 2, 3, 4, 5, 6],
    surComptoir: true,
    aValider: true,
  },
  {
    id: 'part-pizza',
    nom: 'Part de pizza',
    categorie: 'sale',
    prix: 250,
    unite: 'la part',
    description: 'Découpée dans la plaque, à manger tiède.',
    illustration: 'pizza',
    surComptoir: true,
  },

  // ── Plaques entières ───────────────────────────────────────────────────
  {
    id: 'plaque-pizza',
    nom: 'Plaque de pizza entière',
    categorie: 'plaques',
    prix: 2400,
    unite: 'la plaque',
    description: 'Pour un anniversaire, un apéro, une équipe de foot.', // [À VALIDER]
    illustration: 'pizza',
    aValider: true,
  },
  {
    id: 'plaque-tarte',
    nom: 'Plaque de tarte entière',
    categorie: 'plaques',
    prix: 2600,
    unite: 'la plaque',
    description: 'Fruits de saison, à préciser dans la remarque.', // [À VALIDER]
    illustration: 'tarte',
    aValider: true,
  },
];

export const produitParId = new Map(produits.map((p) => [p.id, p]));
