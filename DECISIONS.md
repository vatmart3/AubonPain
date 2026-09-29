# DECISIONS — Au Bon Pain

Les décisions prises sans demander, et pourquoi. En bas : **tout ce qui reste [À VALIDER]**.

## Structure et technique

- **Next.js 16.3 (App Router) + TypeScript 6**, CSS Modules et variables CSS. Pas de Tailwind ni de kit d’interface : chaque composant est dessiné pour ce site. TypeScript 7 (natif) n’est pas encore pris en charge par Next : on reste en 6.
- **L’ancien site statique** (index.html / styles.css / script.js) a été retiré du dépôt : le brief partait d’un dossier vide. Il reste dans l’historique Git.
- **Dépôt et déploiement** : le brief demandait un nouveau dépôt `au-bon-pain-sete` et un `vercel --prod`. Cette session n’a accès ni à `gh` ni au CLI Vercel, et ne peut créer ni dépôt ni projet Vercel. Le code est donc poussé sur le dépôt existant `vatmart3/AubonPain` (branche `claude/intelligent-sagan-oflgri`). Pour la mise en ligne : importer ce dépôt dans Vercel (équipe « crm mjagency », qui n’a aucun projet pour l’instant). La procédure est dans le README.
- **Épinglage de l’intro** : `position: sticky` dans une section haute, avec ScrollTrigger qui ne sert qu’à lire la progression, au lieu de `pin: true`. Même rendu, mais plus solide avec Lenis et l’hydratation React (pas de pin-spacer à recalculer). La section qui suit remonte de 100svh sous l’intro : quand la vitre glisse vers le haut, le comptoir est déjà là.
- **Géométrie de la porte** (`components/Intro/geometrie.ts`) posée en variables CSS pour les deux formats. Le bon format est choisi par media query et pas en JavaScript, ce qui évite un décalage de mise en page à l’hydratation.
- **Format des images de l’intro** : 16:9 pour un écran plus large que haut, 9:16 (recadré au centre, sur la porte) pour un écran en hauteur (`max-aspect-ratio: 5/6`).
- **three.js** (react-three-fiber + drei `PerformanceMonitor`) ne se charge qu’au premier geste (défilement, doigt, souris, clavier) ou après 6 s, et jamais en mouvement réduit. Il est coupé sous 400 px de large sur un appareil à 4 cœurs ou moins. La façade s’affiche d’abord, la farine arrive ensuite.
- **Le « bam »** (flash de 0,15 s, bouffée de farine, nom qui s’écrit) est minuté et non lié au défilement : un flash de 0,15 s ne peut pas dépendre de la vitesse du doigt. Seule la vitre qui remonte (0,965 → 1) suit le défilement.
- **Clochette** : synthétisée en Web Audio (trois coups de cloche en laiton), sans fichier son. Elle est coupée par défaut et se joue quand on passe 0,30 en avançant.
- **Préchargement** : on ne précharge que la version AVIF de la première image, avec une media query par format. Précharger aussi le WebP ferait télécharger deux fichiers aux navigateurs qui lisent l’AVIF. Le WebP reste la solution de repli dans `<picture>`.
- **Mouvement réduit** : ni séquence, ni Lenis, ni three.js. La façade, puis un fondu (opacité seule) vers le comptoir et le nom. La règle globale met `transition-duration: 0s` et non 0,01 ms : avec 0,01 ms, chaque changement de style mettait une image à s’appliquer, ce qui faussait les mesures de ScrollTrigger.
- **Commandes** : aucune base de données. La route `/api/commande` revalide tout avec zod, recalcule le total côté serveur et envoie via CallMeBot, avec 8 s de délai maximum et une copie au numéro de secours. En local sans clés, le message s’affiche dans le terminal (mode test). En production sans clés, c’est une erreur 503 et le client voit « Appelez-nous ».
- **Réussite de l’envoi** = le numéro principal a reçu le message. Si seul le numéro de secours le reçoit, on renvoie une erreur pour que le client appelle : c’est la boulangère qui doit avoir la commande.
- **Anti-robots** : un champ piège ou un envoi en moins de 4 s reçoit une réponse « ok » sans que rien ne parte, pour ne pas renseigner le robot. Au-delà de 3 envois par IP en 10 min, la route répond 429 (mémoire de l’instance, au mieux).
- **Numéro de commande** : `AB-` suivi de 4 caractères, sans 0/O/1/I/L pour éviter les confusions au téléphone. Il est généré côté serveur.
- **Tests** : vitest, 33 tests sur l’heure de Sète, le calendrier, les créneaux, la validation, le format et la longueur du message, et la route (envoi, copie de secours, robots, limite par IP, échec, délai dépassé).

## Direction artistique

- **Images de l’intro provisoires** : 4 illustrations « papier découpé » dessinées en SVG d’après la photo de la vitrine (devanture brun foncé, lettrage doré, autocollants en rubans, lampes en osier, balcons en fer forgé, mur rose et descente d’eau), puis converties en WebP/AVIF (`npm run placeholders`). Elles assument d’être des dessins : pas de fausse photo. Porte ouverte et façade partagent le même cadrage, pour que les battants découpés tombent pile.
- **Produits** : pas de photos fournies, donc 12 dessins dans le même style (`components/Illustrations/dessins.ts`). Chaque produit bascule tout seul sur sa photo dès que `photo` est renseigné.
- **Portrait de Béatrice** : silhouette en papier découpé derrière le comptoir, jamais une photo de banque d’images.
- **Tomette (3 usages)** : le point du statut « ouvert » sur la vitre, le repère « maintenant » de la frise, et le tampon (l’encre « COMMANDÉ » sur le bon, le tampon « C’est ici » sur le plan, la semelle du tampon). Les contours de focus sur fond clair sont passés en encre pour ne pas créer de 4e usage.
- **Couleurs dérivées** (matières, pas de nouvelles teintes d’interface) : `--kraft` et `--kraft-fonce` (papier kraft), `--bois`, `--ligne-carnet` (lignes bleu pâle du carnet, demandées par le brief), `--croute-texte` et `--croute-sombre` (la croûte assombrie pour tenir le contraste AA sur fond clair et sur kraft).
- **Police du ticket** : IBM Plex Mono, seulement pour le pied de page en ticket de caisse. Nanum Pen Script ne sert que pour l’ardoise, « Faites défiler pour entrer », les deux annotations de l’intro et le compte écrit sur le sac (tous demandés par le brief).
- **Avis « griffonnés »** : pour respecter la règle « pas de manuscrit pour du texte » (§3), les avis sont imprimés en Gloock sur les sachets et les sacs, pas écrits en Nanum. Deux papiers ne sont pas des avis inventés : la note (4,4 sur 5, plus de 50 avis) et la liste de ce que les clients citent (§1).
- **Plan du quartier** : sans données cartographiques accessibles d’ici (OpenStreetMap bloqué), le plan ne montre que ce qui est certain : la rue Paul Bousquet, des façades, la boutique au n°36 et son tampon. Pas de rues voisines, pas de nord, avec la mention « dessiné à la main · pas à l’échelle ». Le bouton « Itinéraire » ouvre Apple Plans sur iPhone, iPad et Mac, Google Maps ailleurs.
- **Navigation** : les 3 liens sont Le comptoir, La maison et Nous trouver. Le ticket « Commander » n’apparaît sur l’accueil qu’après l’intro. Sur les autres pages, la bande de navigation est toujours pleine (certaines pages commencent sur fond clair).
- **Mobile** : pas de burger, mais le distributeur « Prenez un ticket » avec « Commander » toujours sous le pouce (avec le nombre d’articles du sac). Sur /commander, un petit sac kraft suit en bas de l’écran.
- **Frise du four sur téléphone** : elle devient une liste en flux, car les étiquettes se chevauchaient. Le repère « maintenant » s’insère entre deux fournées.
- **Paiements** : le §1 cite CB, sans contact et Pluxee, le §7 ajoute les espèces. Les espèces sont affichées partout (en France, le refus des espèces est l’exception), mais c’est à confirmer.

## Performance mesurée (Lighthouse mobile, simulation, dans le conteneur de build)

| Page | Perf | Accessibilité | Bonnes pratiques | SEO | CLS |
| --- | --- | --- | --- | --- | --- |
| /commander | 92 | 96 | 100 | 100 | 0 |
| /la-maison | 94 | 100 | 100 | 100 | 0 |
| / (avec l’intro) | 75 | 100 | 100 | 100 | 0 |

L’accueil est sous 90 à cause de l’intro, comme le brief l’autorise. Le conteneur n’a pas de GPU : la mise en page initiale et le rendu logiciel de la scène pèsent plus que sur un vrai téléphone. Mesuré dans Chrome avec le processeur ralenti ×4 : premier affichage à 0,2 s, **LCP 0,6 s**, CLS 0, three.js absent du chargement initial. À refaire sur l’URL Vercel avec PageSpeed Insights une fois en ligne.

---

## [À VALIDER] — liste complète

À confirmer avec Madame Vatuone avant la mise en ligne. Chaque point est aussi marqué dans le fichier concerné.

**Boutique (`content/boutique.ts`)**
1. Horaires : semaine 6h30–13h, samedi 7h–13h, dimanche fermé. Certaines fiches en ligne indiquent aussi **16h–19h en semaine**.
2. Fermetures exceptionnelles et congés annuels (liste vide pour l’instant).
3. Règles de commande : lendemain au plus tôt, **avant 18h la veille**, 14 jours proposés, créneaux de 30 min.
4. Espèces acceptées (affichées dans les moyens de paiement).
5. Note et nombre d’avis (4,4 / plus de 50) : à tenir à jour.
6. Lien direct vers la fiche Google (aujourd’hui une recherche Google Maps), et le même lien dans `sameAs` du JSON-LD (`lib/jsonld.ts`).
7. **SIRET** (mentions légales), et la forme juridique si elle doit apparaître.
8. Nom de domaine définitif (`aubonpain-sete.fr` supposé).

**Produits (`content/produits.ts`)**
9. **Tous les prix** : posés pour que le site fonctionne, pas relevés en boutique.
10. Produits supposés : baguette tradition, pain de campagne, pain de mie, chausson aux pommes.
11. Détails : garnitures des sandwichs, fruits des tartes, prix et délai des **plaques entières**, jours de fabrication de chaque produit.
12. Photos détourées de chaque produit.

**Fournées (`content/fournees.ts`)**
13. Toutes les heures de sortie du four (6h15, 6h30, 7h15, 8h, 9h30, 10h30, 11h30).

**Ardoise (`content/ardoise.ts`)**
14. Contenu d’exemple (« Plaque de pizza tomate-olive… ») à remplacer par le vrai « du jour ».

**Avis (`content/avis.ts`)**
15. Texte intégral des deux avis relevés, prénom et initiale des auteurs, **accord de la boulangère**, et 2 à 4 avis réels de plus.

**La maison (`content/maison.ts`)**
16. Le récit à la première personne : aucun fait inventé, mais la voix doit être la sienne. Ajouter avec elle ce qu’elle voudra dire (depuis quand, d’où elle vient…).
17. « Une journée au fournil » : les heures et les étapes réelles (3h30, 5h, 6h15, 6h30, 10h, 13h sont supposées), plus une photo par étape.
18. Le portrait de Béatrice derrière son comptoir.

**Intro**
19. Les 4 vraies images (façade sans personne, porte ouverte, intérieur, comptoir), puis la vidéo découpée en frames (annexe du brief). Il faut une ou deux photos réelles de l’intérieur et du comptoir pour qu’elles soient fidèles.

**Confidentialité**
20. Durée de conservation des messages WhatsApp de commande sur le téléphone de la boutique.

**Mise en ligne**
21. Numéro WhatsApp et clé CallMeBot de la boulangère (et un numéro de secours éventuel), `TEST_SECRET`, `NEXT_PUBLIC_SITE_URL` sur Vercel.
