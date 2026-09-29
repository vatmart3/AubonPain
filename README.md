# Au Bon Pain — Sète

Site de la boulangerie-pâtisserie **Au Bon Pain**, 36 rue Paul Bousquet, 34200 Sète.
Next.js (App Router) + TypeScript, CSS Modules, GSAP/ScrollTrigger, Lenis, three.js (react-three-fiber) pour la farine de l’intro.
Aucune base de données : le contenu vit dans `content/`, les commandes partent sur WhatsApp.

- Choix et arbitrages : [`DECISIONS.md`](./DECISIONS.md) (dont la liste des **[À VALIDER]**).

---

## Pour la boulangère

### Recevoir les commandes sur WhatsApp (à faire une seule fois)

1. Dans le téléphone, enregistrez le contact **+34 611 021 695** (c’est le service CallMeBot).
2. Envoyez-lui sur WhatsApp ce message, exactement :
   `I allow callmebot to send me messages`
3. Vous recevez en réponse un message avec votre **APIKEY** (une suite de chiffres). Si rien n’arrive au bout de 2 minutes, réessayez 24 h plus tard.
4. Donnez votre numéro (format `+336…`) et cette APIKEY à la personne qui s’occupe du site : elle les met dans Vercel (voir plus bas).

Ensuite, chaque commande arrive sur WhatsApp comme ceci :

```
🥖 *NOUVELLE COMMANDE* — AB-7K2Q
👤 Marie Dupont — 06 12 34 56 78
📅 Retrait : samedi 4 octobre, vers 9h

2 × Baguette
6 × Croissant

💬 « Bien cuites svp »
💶 Total indicatif : 8,80 € — paiement en boutique
```

Le client paie en boutique. Si vous ne pouvez pas honorer une commande, rappelez le numéro indiqué.

### Changer ce qui s’affiche sur le site

Tout se modifie dans le dossier `content/` (fichiers texte, un par sujet) :

| Fichier | Ce qu’il contient |
| --- | --- |
| `content/boutique.ts` | Horaires, **fermetures exceptionnelles** (congés), téléphone, règles de commande |
| `content/produits.ts` | Les produits commandables : nom, prix, unité, jours où ils sont faits, photo |
| `content/fournees.ts` | Les heures de sortie du four (frise « L’heure du four ») |
| `content/ardoise.ts` | L’ardoise du jour |
| `content/avis.ts` | Les avis clients affichés |
| `content/maison.ts` | Les textes de la page « La maison » |

Chaque modification poussée sur GitHub est remise en ligne automatiquement par Vercel en une minute environ.

---

## Pour le développeur

```bash
npm install
cp .env.example .env.local   # facultatif en local : sans CallMeBot, la commande s'affiche dans le terminal
npm run dev                  # http://localhost:3000
npm test                     # règles de commande + route API (vitest)
npm run lint                 # vérification TypeScript
npm run build
```

### Variables d’environnement (Vercel → Settings → Environment Variables, Production + Preview)

| Variable | Rôle |
| --- | --- |
| `CALLMEBOT_PHONE` | Numéro WhatsApp de la boulangère, `+336…` |
| `CALLMEBOT_APIKEY` | Sa clé CallMeBot |
| `CALLMEBOT_PHONE_BACKUP` / `CALLMEBOT_APIKEY_BACKUP` | Facultatif : un 2e numéro qui reçoit une copie (sa propre clé) |
| `TEST_SECRET` | Mot de passe de la route de test |
| `NEXT_PUBLIC_SITE_URL` | URL publique définitive (sitemap, partages, JSON-LD) |

Aucune de ces clés n’est exposée au navigateur (pas de `NEXT_PUBLIC_` sauf l’URL du site).

### Tester l’envoi WhatsApp

`https://<le-site>/api/test-whatsapp?secret=<TEST_SECRET>` → envoie « Test Au Bon Pain ✅ » aux numéros configurés.
Puis passer une vraie commande de bout en bout sur `/commander`.

### Déploiement (GitHub → Vercel)

1. Sur vercel.com : **Add New → Project → Import** le dépôt GitHub. Next.js est détecté, rien à régler.
2. Ajouter les variables ci-dessus (Production + Preview), puis **Redeploy**.
3. Tester `/api/test-whatsapp?secret=…`, puis une commande réelle.

### Brancher le nom de domaine (ex. `aubonpain-sete.fr`, [À VALIDER])

1. Vercel → Project → Settings → **Domains** → ajouter `aubonpain-sete.fr` et `www.aubonpain-sete.fr`.
2. Chez le registrar : enregistrement `A` de `@` vers `76.76.21.21`, et `CNAME` de `www` vers `cname.vercel-dns.com` (Vercel affiche les valeurs exactes).
3. Mettre `NEXT_PUBLIC_SITE_URL=https://aubonpain-sete.fr` et redéployer.

### L’intro « On pousse la porte »

- **Mode actuel : images provisoires** (`public/intro/placeholder/`), dessinées d’après la photo de la vitrine, avec une porte en deux battants découpés en calques.
- **Séquence réelle** : déposer `public/intro/desktop/0001.webp … 0160.webp` et `public/intro/mobile/0001.webp … 0090.webp` (voir l’annexe du brief pour les fabriquer avec ffmpeg). Au build suivant, le site bascule tout seul sur la séquence (`components/Intro/intro.config.ts`, `mode: 'auto'`).
- Si les 4 vraies images fixes remplacent les dessins, garder les mêmes noms et formats, et reporter la position de la porte dans `components/Intro/geometrie.ts`. Les images provisoires se régénèrent avec `npm run placeholders` (polices Gloock et Karla installées localement).

### Photos des produits

Déposer les photos détourées (fond transparent, ~800 px de large, `.webp`) dans `public/photos/produits/` et renseigner `photo: '/photos/produits/xxx.webp'` dans `content/produits.ts`. Sans photo, le site affiche un dessin.
