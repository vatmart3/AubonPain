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
| `index.html` | Accueil : hero, four en direct, collection, fournil, la maison |
| `collection.html` | Les pièces du four — douze produits avec prix |
| `reservation.html` | Pré-commande à emporter : formulaire et créneaux de retrait |
| `fournil.html` | Le feu, la nuit — le fournil et la première fournée |
| `contact.html` | Adresse, téléphone, horaires et plan |

## Direction

Fond nuit (`#0A0908`), or (`#C08A5A`), crème. Playfair Display pour les
titres, JetBrains Mono pour tout le reste — libellés en capitales espacées,
chiffres tabulaires, angles vifs et filets d'un pixel.

## Ce qui bouge

| Élément | Comportement |
| --- | --- |
| Four en direct | Pendule à la seconde, dernière sortie du four barrée, prochaine fournée calculée sur le planning des cuissons |
| Horaires | Le jour courant est mis en évidence automatiquement |
| Curseur | Anneau qui suit le pointeur et s'élargit sur les liens |
| Sections | Apparition douce au défilement |
| Créneaux | Boutons d'heure de 06:30 à 13:00, un seul sélectionné |

Le planning des fournées se règle dans `script.js` (`FOURNEES`).

## Réservation

Le formulaire valide les champs obligatoires puis affiche un récapitulatif.
**Il n'envoie rien pour l'instant** : il n'y a pas de serveur. Deux options :

- renseigner `EMAIL_BOULANGERIE` en haut de `script.js` — le récapitulatif
  propose alors un envoi par email préparé ;
- ou brancher un service de formulaire (Formspree, Basin, Netlify Forms) en
  remplaçant le `submit` par un `fetch` vers leur adresse.

Sans cela, le bouton du récapitulatif propose d'appeler la boulangerie.

## Images

Chaque emplacement superpose trois couches, déclarées dans `images.css` :

1. **`--img`** — la photographie. Dix-huit photos **Pexels** (licence Pexels :
   usage gratuit, y compris commercial, sans attribution obligatoire), page
   source en commentaire. À remplacer par les photos de la boutique.
2. **`--dessin`** — l'illustration du produit, dessinée en SVG doré et
   intégrée au fichier. Elle s'affiche dès que la photo ne charge pas.
3. **`--teinte`** — le fond profond.

Pour changer une photo, ne modifiez que `--img`. Pour héberger les images
vous-même : `./fetch-photos.sh`, puis activez le bloc en fin de `images.css`.

## Regénérer

```bash
python3 build-pages.py    # les cinq pages depuis la coquille commune
python3 build-images.py   # images.css depuis les dessins et la liste de photos
```

Les illustrations sont dans `build_illustrations.py` (jeu clair et jeu sombre).

## Informations

- 36 rue Paul Bousquet, 34200 Sète
- 04 67 53 59 31
- Lundi – Samedi : 06:30 – 19:30 · Dimanche : 07:00 – 13:00
- 1 à 10 € par personne · 4,3 / 5 sur 79 avis Google
- Service au comptoir : soupes, salades, sandwichs, pains et viennoiseries

## À vérifier avant mise en ligne

1. **Photos** — remplacer les photos d'illustration par celles de la boutique.
2. **Prix** — indicatifs hors des quatre pièces confirmées (croissant 1,30 €,
   pain au chocolat 1,50 €, mille-feuille 4,20 €, baguette tradition 1,20 €).
3. **Planning des fournées** — les horaires de cuisson affichés par « Four en
   direct » sont à caler sur la réalité.
4. **Envoi du formulaire** — voir « Réservation ».
5. **Coordonnées du plan** — affiner le point exact (43.4045, 3.6985).
6. **Mentions légales / RGPD** — obligatoires pour un site commercial.
