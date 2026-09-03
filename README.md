# Au Bon Pain — Sète

Site vitrine pour la boulangerie **Au Bon Pain**, 36 Rue Paul Bousquet, 34200 Sète.

Site statique : aucune dépendance, aucun build. Ouvrir `index.html` dans un
navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
```

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page unique (hero, carte, rayons, la maison, top produits, avis, contact, footer) |
| `styles.css` | Palette chaude, mise en page responsive, animations |
| `script.js` | Menu mobile, carrousel de la carte, lien de navigation actif |

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
3. **Photos** — les visuels sont pour l'instant des emojis sur fonds dégradés.
   Remplacez-les par de vraies photos de la vitrine (`.pcard-photo`,
   `.hero-disc`, `.tile`, `.disc-yellow`).
4. **Coordonnées de la carte** — l'iframe OpenStreetMap utilise un point
   approximatif du quartier. Ajustez `marker=` et `bbox=` avec les coordonnées
   exactes.
5. **Mentions légales / RGPD** — à ajouter si le site est publié.

Les avis affichés sont des extraits publics de la fiche Google (Jérémy Vatuone,
Sandrine Preaud, Mattéo Vandenberghe), attribués et signalés comme non vérifiés.
