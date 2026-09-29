'use client';

import { useEffect, useRef } from 'react';
import { maison } from '@/content/maison';
import { enMinutes, heureLisible } from '@/lib/temps';
import { gsap } from '@/lib/gsap';
import { mouvementReduit } from '@/lib/defilement';
import { VisuelProduit, type Illustration } from '@/components/Illustrations/Illustrations';
import styles from './Maison.module.css';

const dessinsEtapes: Illustration[] = ['campagne', 'croissant', 'baguette', 'painChocolat', 'pizza', 'sables'];

/** Une journée au fournil : défilement horizontal épinglé, heure par heure. */
export function Journee() {
  const section = useRef<HTMLElement>(null);
  const piste = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sec = section.current;
    const pi = piste.current;
    if (!sec || !pi || mouvementReduit()) return;
    sec.dataset.horizontal = 'true';
    const ctx = gsap.context(() => {
      const distance = () => pi.scrollWidth - window.innerWidth;
      const regler = () => {
        sec.style.height = `${distance() + window.innerHeight}px`;
      };
      regler();
      gsap.to(pi, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.4, invalidateOnRefresh: true, onRefreshInit: regler },
      });
    }, sec);
    return () => {
      ctx.revert();
      delete sec.dataset.horizontal;
      sec.style.height = '';
    };
  }, []);

  return (
    <section ref={section} className={`${styles.journee} section-four`} aria-labelledby="titre-journee">
      <div className={styles.journeeScene}>
        <h2 id="titre-journee" className={styles.journeeTitre}>
          Une journée au fournil
        </h2>
        <ol ref={piste} role="list" className={styles.piste}>
          {maison.journee.map((e, i) => (
            <li key={e.heure} className={styles.etape}>
              <p className={`${styles.etapeHeure} num`}>{heureLisible(enMinutes(e.heure))}</p>
              <div className={styles.etapeCorps}>
                <h3 className={styles.etapeTitre}>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
              <figure className={styles.etapePhoto}>
                {e.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.photo} alt={e.titre} loading="lazy" />
                ) : (
                  <>
                    <VisuelProduit nom={dessinsEtapes[i % dessinsEtapes.length]} alt="" />
                    <figcaption>photo à venir</figcaption>
                  </>
                )}
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
