import { boutique } from '@/content/boutique';

/** Adresse publique du site. [À VALIDER] domaine définitif. */
export const urlSite = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : `https://${boutique.domaine}`)
).replace(/\/$/, '');
