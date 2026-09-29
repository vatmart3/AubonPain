'use client';

import type Lenis from 'lenis';

/** Instance Lenis courante (null si mouvement réduit ou pas encore montée). */
let instance: Lenis | null = null;

export function definirLenis(l: Lenis | null) {
  instance = l;
}

export function lenis() {
  return instance;
}

export function mouvementReduit(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fait défiler vers un élément, un sélecteur ou une position, avec ou sans douceur. */
export function defilerVers(cible: string | HTMLElement | number, options: { immediat?: boolean; decalage?: number } = {}) {
  const immediat = options.immediat || mouvementReduit();
  if (instance) {
    instance.scrollTo(cible, { immediate: immediat, offset: options.decalage ?? 0, duration: 1.2, force: true });
    return;
  }
  let y: number;
  if (typeof cible === 'number') y = cible;
  else {
    const el = typeof cible === 'string' ? document.querySelector<HTMLElement>(cible) : cible;
    if (!el) return;
    y = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: y + (options.decalage ?? 0), behavior: immediat ? 'instant' : 'smooth' });
}

/** Lecture / écriture de stockage qui ne casse jamais (navigation privée, blocage…). */
export const stockage = {
  lire(zone: 'session' | 'local', cle: string): string | null {
    try {
      return (zone === 'session' ? window.sessionStorage : window.localStorage).getItem(cle);
    } catch {
      return null;
    }
  },
  ecrire(zone: 'session' | 'local', cle: string, valeur: string) {
    try {
      (zone === 'session' ? window.sessionStorage : window.localStorage).setItem(cle, valeur);
    } catch {
      /* rien : c'est un confort */
    }
  },
};
