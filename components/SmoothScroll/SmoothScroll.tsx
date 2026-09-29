'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { definirLenis, mouvementReduit } from '@/lib/defilement';

/** Défilement doux (Lenis) branché sur GSAP. Rien du tout si mouvement réduit. */
export function SmoothScroll() {
  useEffect(() => {
    if (mouvementReduit()) return;
    const l = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false });
    definirLenis(l);
    l.on('scroll', ScrollTrigger.update);
    const tic = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tic);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tic);
      l.destroy();
      definirLenis(null);
    };
  }, []);
  return null;
}
