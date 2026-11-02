# Ventes — Au Bon Pain

Tableau de bord des ventes carte de la boulangerie, branché en direct sur
l'API SumUp. Pensé pour le téléphone : on l'ouvre le matin et en fin de
journée, on peut l'ajouter à l'écran d'accueil.

Projet Vercel **séparé** du site vitrine : il vit dans le dossier `dashboard/`
du dépôt.

## Écrans

| Onglet | Contenu |
| --- | --- |
| **Aujourd'hui** | CA carte du jour (rafraîchi toutes les 60 s), comparé au **même jour de la semaine précédente à la même heure**, clients, panier moyen, courbe heure par heure 6h–20h avec la semaine dernière en fond, saisie facultative des espèces, dernières ventes |
| **Semaine / Mois** | CA par jour, meilleur et pire jour, évolution vs période précédente (à périmètre égal pour la période en cours), navigation dans le passé |
| **Affluence** | Heatmap jour × heure sur 4, 8 ou 12 semaines, en clients ou en euros, avec le « gros rush » mis en avant |
| **Produits** | Top 10 en quantité ou en CA (jour, 7 j, 30 j, mois). Si les ventes sont encaissées sans article, un message explique comment utiliser le catalogue SumUp |
| **Compta** | CA TTC, TVA collectée par taux, frais SumUp, net encaissé, détail par jour, **export CSV** du mois pour le comptable |

## Règles de calcul

- **Vente** : opération `PAYMENT` au statut `SUCCESSFUL`. Une vente remboursée
  ensuite passe au statut `REFUNDED` : elle reste comptée comme vente, et le
  remboursement est déduit séparément (sinon il serait retiré deux fois).
- **Remboursement** : opération `REFUND` (ou `CHARGE_BACK`) au statut
  `SUCCESSFUL`, déduite le jour où elle a eu lieu. À défaut, on utilise le
  `refunded_amount` de la vente.
- `FAILED`, `CANCELLED`, `PENDING` sont ignorés.
- **Clients** = nombre de ventes. **Panier moyen** = ventes ÷ nombre de ventes.
- Toutes les journées, heures et semaines sont calculées en heure de Paris
  (changements d'heure compris).
- Le liquide saisi à la main reste dans le navigateur du téléphone
  (`localStorage`) ; il n'est jamais envoyé ni mélangé au CA carte.

### Produits, TVA, frais

L'historique SumUp ne contient ni les articles, ni la TVA, ni les frais :
ils figurent seulement dans la **fiche détaillée** de chaque transaction
(`GET /v2.1/merchants/{code}/transactions?id=…`). Sans base de données,
chaque fiche est lue une fois puis gardée 30 jours dans le cache de Vercel.
La première ouverture d'un mois chargé peut donc demander quelques passages :
l'écran affiche « Lecture des tickets en cours… » et se complète tout seul.
L'export CSV n'est proposé qu'une fois tout le mois lu.

## Cache (pas de base de données)

Les données sont lues jour par jour via le cache `fetch` de Next.js :

| Journée | Relue au plus tous les… |
| --- | --- |
| aujourd'hui | 60 s |
| hier | 5 min |
| 2 à 7 jours | 1 h |
| plus ancienne | 24 h |
| fiche détaillée d'une vente | 30 jours |

Seules les réponses 200 sont mises en cache : une erreur SumUp n'est jamais
figée.

## Déploiement sur Vercel

1. Vérifier la clé avant tout (affiche le nom du commerce via `GET /v0.1/me`) :
   ```bash
   cd dashboard && npm install && SUMUP_API_KEY=sup_sk_... npm run check:sumup
   ```
2. Sur Vercel : **Add New → Project**, importer ce dépôt, puis
   **Root Directory = `dashboard`** (framework détecté : Next.js).
3. **Settings → Environment Variables** : `SUMUP_API_KEY`,
   `SUMUP_MERCHANT_CODE`, `DASHBOARD_PASSWORD` (voir `.env.example`).
4. Déployer. Sur le téléphone : ouvrir l'adresse, se connecter, puis
   « Partager → Sur l'écran d'accueil » (iPhone) ou « Installer l'application »
   (Android).

## Sécurité

- La clé SumUp n'est lue que dans `lib/env.ts`, marqué `server-only` : un
  import depuis le navigateur ferait échouer le build.
- Les messages d'erreur montrés au commerçant sont rédigés à part ; le détail
  technique reste dans les journaux Vercel.
- `proxy.ts` protège toutes les pages et routes `/api` ; chaque route vérifie
  aussi la session. Cookie `httpOnly`, `Secure`, `SameSite=Lax`, signé
  HMAC-SHA256, valable 30 jours. Changer `DASHBOARD_PASSWORD` déconnecte tous
  les appareils.
- Site non indexé (`robots.txt`, `noindex`).

## Développement

```bash
cp .env.example .env.local   # puis remplir
npm run dev                  # http://localhost:3000
npm test                     # calculs, dates, sessions, CSV
npm run typecheck
```

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `lib/sumup.ts` | Client SumUp serveur : `/v0.1/me`, historique paginé (`links` → `next`), fiche détaillée, erreurs typées |
| `lib/data.ts` | Chargement jour par jour, durée de cache, lecture des fiches dans un budget de temps |
| `lib/ledger.ts` | Calculs purs : CA, remboursements, heures, heatmap, produits, TVA, frais |
| `lib/views.ts` | Un modèle par onglet |
| `lib/time.ts` | Dates dans le fuseau de la boutique |
| `lib/session.ts`, `proxy.ts` | Connexion par mot de passe |
| `app/api/*` | Routes JSON (+ `export` en CSV) |
| `components/*` | Interface |
| `scripts/check-sumup.mjs` | Test de connexion en ligne de commande |
