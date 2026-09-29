/**
 * Réglages de l'intro « On pousse la porte ».
 *
 * Deux modes :
 *  - « frames »      : séquence d'images (technique Apple) dessinée sur un canvas.
 *                      Déposer public/intro/desktop/0001.webp … 0160.webp
 *                      et public/intro/mobile/0001.webp … 0090.webp (voir l'annexe du brief).
 *  - « placeholder » : 4 images fixes + caméra + portes en calques.
 *
 * Avec mode: 'auto', le site passe tout seul sur la séquence dès que les
 * fichiers 0001.webp existent (desktop ET mobile) au moment du build.
 */

export type ModeIntro = 'frames' | 'placeholder';

export const introConfig = {
  mode: 'auto' as 'auto' | ModeIntro,

  frames: {
    desktop: { dossier: '/intro/desktop', nombre: 160 },
    mobile: { dossier: '/intro/mobile', nombre: 90 },
    extension: 'webp',
    /** 0001.webp → 4 chiffres */
    chiffres: 4,
    /** Taille des paquets de préchargement. */
    paquet: 20,
  },

  placeholder: { dossier: '/intro/placeholder' },

  /** Hauteur de défilement de l'intro, en % de la hauteur d'écran. */
  defilement: { desktop: 450, mobile: 320 },

  /** Particules de farine (three.js). Divisées par 3 sur mobile. */
  particules: 600,

  /** Clé de sessionStorage : intro déjà vue dans la session → on démarre à 0.85. */
  cleVue: 'abp-intro-vue',
  reprise: 0.85,
} as const;

/** Chemin de la frame n (1-indexé). */
export function cheminFrame(format: 'desktop' | 'mobile', n: number) {
  const f = introConfig.frames;
  return `${f[format].dossier}/${String(n).padStart(f.chiffres, '0')}.${f.extension}`;
}

/**
 * Adresse d'une image provisoire (facade, porte-ouverte, interieur, comptoir).
 * null = format non fourni (la balise <source> correspondante est omise).
 */
export function srcPlaceholder(format: 'desktop' | 'mobile', nom: string, ext: 'avif' | 'webp'): string | null {
  return `${introConfig.placeholder.dossier}/${format}/${nom}.${ext}`;
}
