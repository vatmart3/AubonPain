# Au Bon Pain — Sète

Site vitrine de la boulangerie **Au Bon Pain**, 36 rue Paul Bousquet, 34200 Sète.

Site statique multi-pages : aucun build, aucune dépendance hors les deux
fontes Google. Ouvrir `index.html`, ou servir le dossier :

```bash
python3 -m http.server 8000
```

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : hero animé, atouts, spécialités, la maison en bref |
| `carte.html` | La carte complète, par rayon, avec ancres et prix |
| `maison.html` | La maison : présentation, moments de la journée, galerie |
| `avis.html` | Note globale et avis Google |
| `contact.html` | Adresse, téléphone, horaires, **plan intégré** et accès |
| `styles.css` | Feuille de style commune |
| `script.js` | Interactions communes |
| `images/` | Photographies du site — voir `images/README.md` |
| `build-pages.py` | Génère les cinq pages depuis une coquille commune |

L'en-tête et le pied de page sont identiques sur toutes les pages. Pour
éviter de les modifier cinq fois, elles sont générées par `build-pages.py` :

```bash
python3 build-pages.py
```

Les pages HTML sont versionnées telles quelles — le script n'est utile que
pour les regénérer après une modification de la coquille.

## Photos

Le site affiche un panneau d'attente tant qu'une photo est absente. Dès
qu'un fichier est déposé dans `images/` avec le bon nom, il apparaît
automatiquement et le panneau disparaît. La liste des fichiers attendus est
dans `images/README.md`.

## Plan d'accès

La page contact intègre un plan OpenStreetMap (iframe). Les coordonnées
utilisées sont approximatives (43.4045, 3.6985) : à ajuster avec la position
exacte de la boutique dans `contact.html` et `build-pages.py`.

## Direction

Crème chaude et quatre couleurs de rayon — terre cuite (pains), miel
(viennoiseries), olive (le midi), prune (café et douceurs). Titres en
Fraunces, texte en Jost. Bords festonnés entre les sections.

### Animations

| Élément | Effet |
| --- | --- |
| Titre de l'accueil | Le dernier mot change en boucle |
| Compte à rebours | Temps réel jusqu'à la prochaine fournée de 06h30 |
| Fond | Trois taches de couleur floutées qui dérivent |
| Ruban | Bandeau de produits qui défile |
| Collage | Parallaxe douce au défilement |
| Compteurs | 4,3 et 79 comptent depuis zéro |
| Cartes | Soulèvement au survol, zoom de la photo |

Tout est désactivé sous `prefers-reduced-motion`.

## Informations reprises de la fiche Google

- Adresse : 36 rue Paul Bousquet, 34200 Sète
- Téléphone : 04 67 53 59 31
- Prix par personne : 1–10 €
- Note : 4,3 / 5 (79 avis Google)
- Ouverture : 06h30

## À compléter avant mise en ligne

1. **Photos** — voir `images/README.md`.
2. **Horaires complets** — seule l'ouverture (06h30) est connue ; la page
   contact l'indique explicitement.
3. **Prix** — indicatifs, cohérents avec la fourchette 1–10 € annoncée.
4. **Coordonnées du plan** — à ajuster précisément.
5. **Mentions légales / RGPD** — à ajouter si le site est publié.

Les avis affichés sont des extraits publics de la fiche Google (Sandrine
Preaud, Mattéo Vandenberghe, Jérémy Vatuone), attribués et signalés comme
non vérifiés.
