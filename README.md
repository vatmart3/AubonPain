# Au Bon Pain — Sète

Site vitrine de la boulangerie **Au Bon Pain**, 36 rue Paul Bousquet, 34200 Sète.

Site statique : aucune dépendance, aucun build, aucun script tiers. Ouvrir
`index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
```

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page unique : hero, carte, la maison, avis, infos pratiques, pied |
| `styles.css` | Papier clair, filets fins, typographie Instrument Serif / Instrument Sans |
| `script.js` | Menu mobile, apparitions au défilement, lien de navigation actif |

## Direction

Crème chaude et quatre couleurs de rayon — terre cuite (pains), miel
(viennoiseries), olive (le midi), prune (café et douceurs) — reprises sur les
pastilles, les numéros, les étiquettes de prix et les liserés de cartes.
Titres en Fraunces, texte en Jost. Bords festonnés entre les sections, comme
une croûte.

### Animations

| Élément | Effet |
| --- | --- |
| Titre du hero | Le dernier mot change en boucle : croissant chaud, pain frais, chocolat fondu, café serré, beurre fondu |
| Compte à rebours | Temps réel jusqu'à la prochaine fournée de 06h30 |
| Fond du hero | Trois taches de couleur floutées qui dérivent lentement |
| Vapeur | Filets de vapeur qui montent sur la photo principale |
| Ruban | Bandeau de produits qui défile en continu |
| Collage | Parallaxe douce des photos au défilement |
| Compteurs | 4,3 et 79 comptent depuis zéro à l'entrée dans l'écran |
| Cartes | Soulèvement au survol, zoom de la photo, flèche qui glisse |

Tout est désactivé si le visiteur a demandé moins d'animations
(`prefers-reduced-motion`).

### Emplacements photo

Le site est construit autour de photographies qui ne sont pas encore
fournies. Chaque emplacement est un bloc `.photo` avec une légende
(`data-legende`) indiquant ce qu'il doit accueillir. Pour insérer une photo,
remplacer le bloc par une balise `img`, ou ajouter en CSS :

```css
.photo[data-legende="Photo — viennoiseries"]{
  background:url("images/viennoiseries.jpg") center/cover no-repeat;
}
.photo[data-legende="Photo — viennoiseries"]::before,
.photo[data-legende="Photo — viennoiseries"]::after{ content:none; }
```

Emplacements attendus : vitrine du matin et viennoiseries (hero), pains,
viennoiseries, sandwichs et café (spécialités), la boutique, vitrine et
fournée (collage), plus une photo par produit du carrousel.

## Informations reprises de la fiche Google

- Adresse : 36 rue Paul Bousquet, 34200 Sète
- Téléphone : 04 67 53 59 31
- Prix par personne : 1–10 €
- Note : 4,3 / 5 (79 avis Google)
- Ouverture : 06h30
- Service au comptoir : soupes, salades, sandwichs, pains et viennoiseries

## À compléter avant mise en ligne

1. **Horaires complets** — seule l'ouverture (06h30) est connue. La section
   Infos affiche une note invitant à appeler ; la remplacer par le détail
   jour par jour.
2. **Prix des produits** — indicatifs, cohérents avec la fourchette 1–10 €
   annoncée, à corriger.
3. **Photos** — indispensables : la mise en page est faite pour elles. Voir
   « Emplacements photo » ci-dessus. Utiliser des photos dont vous détenez les
   droits, ou des banques libres de droits (Unsplash, Pexels).
4. **Mentions légales / RGPD** — à ajouter si le site est publié.

Les avis affichés sont des extraits publics de la fiche Google (Sandrine
Preaud, Mattéo Vandenberghe, Jérémy Vatuone), attribués et signalés comme non
vérifiés.
