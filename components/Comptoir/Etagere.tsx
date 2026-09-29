'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Comptoir.module.css';

/**
 * Une étagère qui défile à l'horizontale : glisser à la souris (avec inertie),
 * au doigt (défilement natif), ou au clavier (tabulation d'étiquette en étiquette).
 */
export function Etagere({ children, label }: { children: ReactNode; label: string }) {
  const zone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    let actif = false;
    let a_glisse = false;
    let dernierX = 0;
    let dernierT = 0;
    let vitesse = 0;
    let elan = 0;

    const bas = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      actif = true;
      a_glisse = false;
      dernierX = e.clientX;
      dernierT = performance.now();
      vitesse = 0;
      cancelAnimationFrame(elan);
    };
    const bouge = (e: PointerEvent) => {
      if (!actif) return;
      const dx = e.clientX - dernierX;
      if (!a_glisse && Math.abs(dx) < 4) return;
      if (!a_glisse) {
        a_glisse = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.glisse = 'true';
      }
      const t = performance.now();
      el.scrollLeft -= dx;
      vitesse = (dx / Math.max(1, t - dernierT)) * 16;
      dernierX = e.clientX;
      dernierT = t;
    };
    const haut = (e: PointerEvent) => {
      if (!actif) return;
      actif = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      delete el.dataset.glisse;
      // L'inertie : ça continue un peu, puis ça s'arrête doucement.
      const glisser = () => {
        vitesse *= 0.94;
        el.scrollLeft -= vitesse;
        if (Math.abs(vitesse) > 0.3) elan = requestAnimationFrame(glisser);
      };
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) elan = requestAnimationFrame(glisser);
    };
    // Un glisser n'est pas un clic.
    const clic = (e: MouseEvent) => {
      if (a_glisse) {
        e.preventDefault();
        e.stopPropagation();
        a_glisse = false;
      }
    };

    el.addEventListener('pointerdown', bas);
    el.addEventListener('pointermove', bouge);
    el.addEventListener('pointerup', haut);
    el.addEventListener('pointercancel', haut);
    el.addEventListener('click', clic, true);
    return () => {
      cancelAnimationFrame(elan);
      el.removeEventListener('pointerdown', bas);
      el.removeEventListener('pointermove', bouge);
      el.removeEventListener('pointerup', haut);
      el.removeEventListener('pointercancel', haut);
      el.removeEventListener('click', clic, true);
    };
  }, []);

  return (
    <div className={styles.etagere}>
      <div ref={zone} className={styles.defile} role="region" aria-label={label} tabIndex={-1}>
        <ul role="list" className={styles.rang}>
          {children}
        </ul>
      </div>
      <div className={styles.planche} aria-hidden="true" />
    </div>
  );
}
