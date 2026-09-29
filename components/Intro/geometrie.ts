/**
 * Géométrie des images de l'intro (images 16:9 de 1920×1080, recadrées en
 * 9:16 au centre pour le mobile). Sert à découper les deux battants de la
 * porte et à placer le zoom de caméra et les annotations.
 *
 * Si les vraies images n'ont pas la porte au même endroit : mesurer le
 * rectangle de la porte (en pixels, sur l'image 1920×1080) et le reporter ici.
 */

export const IMAGE = { w: 1920, h: 1080 } as const;

/** Porte vitrée double de la boutique, en pixels sur l'image desktop. */
export const PORTE = { x: 870, y: 420, w: 180, h: 510 } as const;

/** Largeur de l'image desktop gardée pour le recadrage mobile (9:16). */
export const LARGEUR_MOBILE = Math.round((IMAGE.h * 9) / 16);

/** Rectangle en % de l'image, pour le format donné. */
export function enPourcents(r: { x: number; y: number; w: number; h: number }, format: 'desktop' | 'mobile') {
  if (format === 'desktop') {
    return { x: (r.x / IMAGE.w) * 100, y: (r.y / IMAGE.h) * 100, w: (r.w / IMAGE.w) * 100, h: (r.h / IMAGE.h) * 100 };
  }
  const gauche = IMAGE.w / 2 - LARGEUR_MOBILE / 2;
  return { x: ((r.x - gauche) / LARGEUR_MOBILE) * 100, y: (r.y / IMAGE.h) * 100, w: (r.w / LARGEUR_MOBILE) * 100, h: (r.h / IMAGE.h) * 100 };
}

/** Ratio largeur / hauteur de l'image selon le format. */
export const ratio = (format: 'desktop' | 'mobile') => (format === 'desktop' ? IMAGE.w / IMAGE.h : 9 / 16);

/** Points visés par les annotations manuscrites, sur l'image « intérieur » (pixels 1920×1080). */
export const CIBLES = {
  painsRaisins: { x: 1205, y: 552 },
  ardoise: { x: 700, y: 372 },
  /** Centre du comptoir : là où la caméra se dirige dans la boutique. */
  comptoir: { x: 960, y: 640 },
} as const;
