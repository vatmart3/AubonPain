# Au Bon Pain — Sète

Site vitrine pour la boulangerie **Au Bon Pain**, 36 Rue Paul Bousquet, 34200 Sète.

Site statique : aucun build. Seule dépendance externe, chargée par CDN :
three.js r128 pour la scène 3D du hero (repli automatique en illustration
vectorielle si WebGL ou le CDN sont indisponibles). Ouvrir `index.html` dans un
navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
```

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page unique (hero 3D, vitrine filtrable, la maison, avis, nous trouver, pied) |
| `styles.css` | Palette nuit/ambre, mise en page responsive, animations |
| `script.js` | Scène 3D WebGL, apparitions au défilement, filtres, cartes 3D, menu mobile |

## Informations reprises de la fiche Google

- Adresse : 36 Rue Paul Bousquet, 34200 Sète
- Téléphone : 04 67 53 59 31
- Prix par personne : 1–10 €
- Note : 4,3/5 (79 avis Google)
- Ouverture : 06h30
- Description : chaîne de cafés avec service au comptoir proposant des soupes,
  salades, sandwichs, pains et viennoiseries.

## À compléter avant mise en ligne

Ces éléments ne figuraient pas dans les informations fournies et sont des
placeholders à valider :

1. **Horaires complets** — seule l'heure d'ouverture (06h30) est connue. La
   section Contact affiche une note invitant à appeler ; remplacez-la par le
   détail jour par jour dans `index.html` (section `#contact`, bloc `.hours`).
2. **Prix des produits** — les tarifs du carrousel (`#carte`) sont indicatifs et
   cohérents avec la fourchette 1–10 €, mais doivent être corrigés.
3. **Photos** — le site fonctionne aujourd'hui sans photographie : scène 3D,
   icônes au trait et typographie. De vraies photos de la vitrine renforceraient
   la vitrine (`.plaque`) et la section « La maison ».
4. **Plan d'accès** — le bloc `.plan` est une carte stylisée qui ouvre Google
   Maps. Pour une carte réelle intégrée, remplacer par une iframe
   OpenStreetMap ou Google Maps avec les coordonnées exactes.
5. **Mentions légales / RGPD** — à ajouter si le site est publié.

Les avis affichés sont des extraits publics de la fiche Google (Jérémy Vatuone,
Sandrine Preaud, Mattéo Vandenberghe), attribués et signalés comme non vérifiés.
