# Photos du site

Les photos sont déclarées dans **`../images.css`**, une règle par emplacement.
Pour en changer une, modifiez seulement l'adresse dans ce fichier — soit une
autre URL, soit un fichier local déposé ici.

## D'où viennent les photos actuelles

De **Pexels** — licence Pexels : utilisation gratuite, y compris commerciale,
sans attribution obligatoire, modification autorisée. La page source de chaque
photo est indiquée en commentaire dans `images.css`, pour que vous puissiez la
vérifier ou en choisir une autre.

Ce sont des photos d'illustration, pas des photos de la boutique : à remplacer
par les vôtres dès que possible.

## Héberger les photos vous-même

Le site charge actuellement les images depuis Pexels. Pour les servir depuis
votre propre serveur (plus rapide, aucune dépendance extérieure) :

```bash
./fetch-photos.sh
```

Les fichiers arrivent dans ce dossier, puis décommentez le bloc
« version locale » à la fin de `images.css`.

## Utiliser vos propres photos

Déposez vos fichiers ici et pointez-les dans `images.css` :

```css
[data-photo="croissant"]{ --img:url("images/croissant.jpg"); }
```

| Clé | Où elle apparaît | Format conseillé |
| --- | --- | --- |
| `vitrine` | Accueil (grande image), collage, galerie | portrait, 1200 × 1600 |
| `viennoiseries` | Accueil (petite image), spécialités | carré, 1200 × 1200 |
| `pains` | Spécialités, carte (pains spéciaux) | paysage, 1600 × 1200 |
| `sandwichs` | Spécialités | paysage |
| `cafe` | Spécialités, carte (café) | paysage |
| `boutique` | Collage, page La maison | paysage |
| `fournee` | Collage, galerie | paysage |
| `comptoir` | Galerie | paysage |
| `croissant`, `pain-chocolat`, `brioche` | Carte — viennoiseries | carré |
| `baguette`, `campagne` | Carte — pains | carré |
| `sandwich`, `salade`, `soupe` | Carte — le midi | carré |
| `cafe-formule`, `patisserie` | Carte — café & douceurs | carré |

Conseils de prise de vue : lumière du jour près de la vitrine, cadrage assez
serré, pas de flash. Compressez à moins de 300 Ko (par exemple avec
squoosh.app).

Tant qu'une photo ne charge pas, le site affiche automatiquement un panneau
d'attente : rien ne casse.
