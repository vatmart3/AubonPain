'use client';

import { useEffect, useRef } from 'react';
import { avis, citesSouvent } from '@/content/avis';
import { boutique } from '@/content/boutique';
import { gsap } from '@/lib/gsap';
import { mouvementReduit } from '@/lib/defilement';
import styles from './Avis.module.css';

type Papier = {
  cle: string;
  support: 'sachet' | 'sac' | 'petitSac';
  contenu: React.ReactNode;
};

/** Ce qu'on en dit : des sachets et des sacs posés en vrac, avec les mots des clients dessus. */
export function Avis() {
  const vrac = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = vrac.current;
    if (!el || mouvementReduit()) return;
    const ctx = gsap.context(() => {
      // Chaque papier glisse à sa propre vitesse : ils se superposent au défilement.
      const amplitude = window.innerWidth < 860 ? 30 : 120;
      el.querySelectorAll<HTMLElement>('[data-vitesse]').forEach((p) => {
        const v = Number(p.dataset.vitesse);
        gsap.fromTo(
          p,
          { y: v * amplitude },
          { y: -v * amplitude, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.4 } },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const papiers: Papier[] = [
    ...avis.map((a, i) => ({
      cle: `avis-${i}`,
      support: a.support,
      contenu: (
        <figure className={styles.citation}>
          <blockquote>
            <p>« {a.texte} »</p>
          </blockquote>
          <figcaption>{a.auteur ?? 'Avis Google'}</figcaption>
        </figure>
      ),
    })),
    {
      cle: 'note',
      support: 'petitSac',
      contenu: (
        <p className={styles.note}>
          <span className={`${styles.chiffre} num`}>{String(boutique.reputation.note).replace('.', ',')}</span>
          <span className={styles.sur}>sur 5</span>
          <span className={styles.nb}>{boutique.reputation.nombreAvis} avis en ligne</span>
        </p>
      ),
    },
    {
      cle: 'cites',
      support: 'sachet',
      contenu: (
        <div className={styles.cites}>
          <p className={styles.citesTitre}>Ce qui revient le plus dans les avis</p>
          <ul role="list">
            {citesSouvent.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ),
    },
  ];

  // Placement « en vrac » (desktop) : position, rotation, vitesse de parallaxe.
  const places = [
    { x: 4, y: 6, r: -7, v: 0.5 },
    { x: 34, y: 20, r: 4, v: -0.35 },
    { x: 64, y: 2, r: -3, v: 0.8 },
    { x: 58, y: 44, r: 9, v: 0.15 },
    { x: 20, y: 52, r: -4, v: -0.6 },
  ];

  return (
    <section className={`${styles.section} section-mie sur-clair`} aria-labelledby="titre-avis">
      <h2 id="titre-avis" className={styles.titre}>
        Ce qu’on en dit
      </h2>
      <div ref={vrac} className={styles.vrac}>
        {papiers.map((p, i) => {
          const pl = places[i % places.length];
          return (
            <div
              key={p.cle}
              className={`${styles.papier} ${styles[p.support]}`}
              data-vitesse={pl.v}
              style={{ ['--x' as string]: `${pl.x}%`, ['--y' as string]: `${pl.y}%`, ['--r' as string]: `${pl.r}deg`, zIndex: i + 1 }}
            >
              <div className={styles.imprime} aria-hidden="true">
                <span>Au Bon Pain</span>
                <span className={styles.imprimeRue}>rue Paul Bousquet · Sète</span>
              </div>
              {p.contenu}
            </div>
          );
        })}
      </div>
      <p className={styles.lien}>
        <a href={boutique.liens.ficheGoogle} target="_blank" rel="noopener">
          Lire tous les avis sur Google <span aria-hidden="true">→</span>
        </a>
      </p>
    </section>
  );
}
