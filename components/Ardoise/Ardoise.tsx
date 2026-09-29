'use client';

import { useEffect, useRef } from 'react';
import { ardoise } from '@/content/ardoise';
import { gsap } from '@/lib/gsap';
import { mouvementReduit } from '@/lib/defilement';
import styles from './Ardoise.module.css';

/** L'ardoise du jour : le texte s'écrit à la craie, ligne après ligne, au défilement. */
export function Ardoise() {
  const planche = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = planche.current;
    if (!el) return;
    const lignes = el.querySelectorAll<HTMLElement>('[data-craie]');
    if (mouvementReduit()) {
      lignes.forEach((l) => l.style.setProperty('--r', '1'));
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
      });
      lignes.forEach((l, i) => {
        // Les lignes longues prennent plus de temps à écrire.
        const duree = Math.max(0.4, (l.textContent?.length ?? 10) / 22);
        tl.fromTo(l, { '--r': 0 }, { '--r': 1, duration: duree, ease: 'none' }, i === 0 ? 0 : '>-0.05');
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className={`${styles.section} section-four`} aria-labelledby="titre-ardoise">
      <h2 id="titre-ardoise" className={styles.titre}>
        L’ardoise
      </h2>
      <div className={styles.cadre}>
        <div ref={planche} className={styles.ardoise}>
          <svg className={styles.traces} aria-hidden="true">
            <filter id="craie-effacee">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="3" seed="11" />
              <feColorMatrix values="0 0 0 0 0.95  0 0 0 0 0.94  0 0 0 0 0.9  0 0 0 0.9 -0.38" />
            </filter>
            <rect width="100%" height="100%" filter="url(#craie-effacee)" />
          </svg>
          <svg width="0" height="0" aria-hidden="true" className={styles.defs}>
            <filter id="grain-craie">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="b" />
              <feDisplacementMap in="SourceGraphic" in2="b" scale="2.5" result="d" />
              <feComposite in="d" in2="b" operator="in" />
            </filter>
          </svg>

          <p className={styles.date} data-craie>
            {ardoise.titre}
          </p>
          <div className={styles.lignes}>
            {ardoise.lignes.map((l, i) => (
              <p key={i} className={styles.ligne} data-craie>
                {l}
              </p>
            ))}
          </div>
          {ardoise.annonce && (
            <p className={styles.annonce} data-craie>
              {ardoise.annonce}
            </p>
          )}
          <p className={styles.signature} data-craie>
            — {ardoise.signature}
          </p>
        </div>
        <div className={styles.rebord} aria-hidden="true">
          <span className={styles.craie} />
          <span className={styles.brosse} />
        </div>
      </div>
    </section>
  );
}
