/* Version artefact : mêmes réglages, images embarquées (WebP seulement, pour le poids). */
export * from '../components/Intro/intro.config';
import facadeD from '../public/intro/placeholder/desktop/facade.webp';
import porteD from '../public/intro/placeholder/desktop/porte-ouverte.webp';
import interieurD from '../public/intro/placeholder/desktop/interieur.webp';
import comptoirD from '../public/intro/placeholder/desktop/comptoir.webp';
import facadeM from '../public/intro/placeholder/mobile/facade.webp';
import porteM from '../public/intro/placeholder/mobile/porte-ouverte.webp';
import interieurM from '../public/intro/placeholder/mobile/interieur.webp';
import comptoirM from '../public/intro/placeholder/mobile/comptoir.webp';

const images: Record<string, string> = {
  'desktop/facade': facadeD,
  'desktop/porte-ouverte': porteD,
  'desktop/interieur': interieurD,
  'desktop/comptoir': comptoirD,
  'mobile/facade': facadeM,
  'mobile/porte-ouverte': porteM,
  'mobile/interieur': interieurM,
  'mobile/comptoir': comptoirM,
};

export function srcPlaceholder(format: 'desktop' | 'mobile', nom: string, ext: 'avif' | 'webp'): string | null {
  return ext === 'avif' ? null : images[`${format}/${nom}`];
}
