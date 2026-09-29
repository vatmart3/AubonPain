'use client';

import { useEffect, useRef } from 'react';
import { maison } from '@/content/maison';
import styles from './Maison.module.css';

/** Ce qu'on fait ici : une liste typographique, soulignée à la main quand elle arrive. */
export function Familles() {
  const liste = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = liste.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.vu = 'true';
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -20% 0px' },
    );
    el.querySelectorAll('li').forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  return (
    <section className={`${styles.familles} section-kraft sur-clair`} aria-labelledby="titre-familles">
      <h2 id="titre-familles" className={styles.famillesTitre}>
        Ce qu’on fait ici
      </h2>
      <ol ref={liste} role="list" className={styles.famillesListe}>
        {maison.familles.map((f, i) => (
          <li key={f.nom} className={styles.famille}>
            <span className={styles.familleNom}>
              {f.nom}
              <svg className={styles.souligne} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                <path d={i % 2 ? 'M4 12 C 60 4, 140 16, 200 9 S 280 6, 296 11' : 'M3 9 C 70 15, 130 5, 190 11 S 270 15, 297 8'} pathLength={1} />
              </svg>
            </span>
            <span className={styles.familleDetail}>{f.detail}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
