/**
 * Textes de la page « La maison ».
 *
 * [À VALIDER] Tout ce fichier est à relire avec Madame Vatuone : le texte est
 * écrit à la première personne, il doit sonner comme elle. Il ne contient
 * volontairement aucune date, aucune histoire inventée : à compléter avec
 * elle (depuis quand, d'où elle vient, ce qu'elle préfère faire…).
 */

export const maison = {
  /** [À VALIDER] photo de Béatrice derrière son comptoir, format portrait. */
  portrait: undefined as string | undefined,

  intro: [
    'Le matin, rue Paul Bousquet, il y a ceux qui prennent « comme d’habitude », ceux qui hésitent devant les pains aux raisins, et ceux qui repartent avec un sachet de sablés qu’ils n’avaient pas prévu.',
    'Je les connais presque tous. Je sais qui veut sa baguette bien cuite, qui prend six croissants le samedi, et qui va me demander des nouvelles du quartier.',
    'Ici, rien de compliqué : du pain, des viennoiseries, des gâteaux simples, des plaques de pizza et de tarte, à des prix qui permettent de revenir le lendemain.',
  ],

  /**
   * Une journée au fournil. [À VALIDER] heures et étapes réelles,
   * + une photo par étape (public/photos/journee/…).
   */
  journee: [
    { heure: '03:30', titre: 'La rue dort', texte: 'Les pétrins tournent. Le four monte en température.', photo: undefined as string | undefined },
    { heure: '05:00', titre: 'Façonnage', texte: 'Les pâtons sont pesés, façonnés, posés sur les couches.', photo: undefined as string | undefined },
    { heure: '06:15', titre: 'Première fournée', texte: 'L’odeur passe sous le rideau. Les premières baguettes refroidissent en chantant.', photo: undefined as string | undefined },
    { heure: '06:30', titre: 'On lève le rideau', texte: 'Les croissants sont sur le comptoir, les premiers clients aussi.', photo: undefined as string | undefined },
    { heure: '10:00', titre: 'Le coup de feu', texte: 'Plus de pains aux raisins. Les plaques de pizza prennent le relais.', photo: undefined as string | undefined },
    { heure: '13:00', titre: 'Rideau', texte: 'On range, on nettoie, on prépare demain.', photo: undefined as string | undefined },
  ],

  familles: [
    { nom: 'Les pains', detail: 'baguettes, pains de campagne, et le moelleux dont tout le monde parle' },
    { nom: 'Les viennoiseries', detail: 'croissants, pains au chocolat, pains aux raisins géants' },
    { nom: 'Les pâtisseries', detail: 'tartes, petits gâteaux, petits sablés au sachet' },
    { nom: 'Les sandwichs', detail: 'sur la baguette du matin' },
    { nom: 'Les plaques', detail: 'pizza et tartes, à la part ou entières sur commande' },
    { nom: 'Les gaufres', detail: 'pour le goûter, ou avant' },
  ],

  quartier: [
    'Une boulangerie, dans une rue, ça sert à plus que vendre du pain. C’est l’endroit où l’on se croise sans s’être donné rendez-vous, où l’on apprend que la voisine est rentrée de l’hôpital, où les enfants comptent leurs pièces pour un pain au chocolat.',
    'Si vous êtes pressé, commandez la veille : votre pain sera mis de côté, à votre nom. Et si vous avez le temps, passez quand même dire bonjour.',
  ],
};
