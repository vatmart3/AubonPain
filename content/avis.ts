/**
 * Avis clients affichés sur la page d'accueil (section « Ce qu'on en dit »).
 *
 * [À VALIDER] Ne publier que des avis réels, recopiés depuis Google, avec
 * l'accord de Madame Vatuone. Pour chaque avis, renseigner `auteur` au format
 * « Prénom I. ». Tant que l'auteur n'est pas renseigné, le site affiche
 * « Avis Google ». Idéalement 4 à 6 avis.
 */

export type Avis = {
  texte: string;
  auteur?: string;
  support: 'sachet' | 'sac';
};

export const avis: Avis[] = [
  // Amorces relevées en ligne. [À VALIDER] texte intégral + prénom et initiale.
  { texte: 'Les meilleurs croissants et croissants au chocolat de Sète.', support: 'sachet' },
  { texte: 'Bon pain de boulanger, sourire et petits sablés.', support: 'sac' },
];

/** Ce qui revient le plus souvent dans les avis en ligne (relevé, pas inventé). */
export const citesSouvent = [
  'le pain très moelleux',
  'les croissants',
  'les pains aux raisins géants',
  'les petits sablés',
  'les plaques de pizza',
  'les prix raisonnables',
  'l’accueil souriant',
];
