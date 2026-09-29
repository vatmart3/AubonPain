'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { boutique } from '@/content/boutique';
import { LienPage } from '@/components/Transition/Transition';
import { liensNav } from '@/components/Nav/liens';
import { usePanier } from '@/components/Panier/Panier';
import styles from './BarreMobile.module.css';

/**
 * Mobile : pas de burger. Un distributeur « Prenez un ticket » en bas d'écran ;
 * un tap tire un ticket qui se déroule vers le haut. « Commander » reste
 * toujours sous le pouce.
 */
export function BarreMobile() {
  const chemin = usePathname();
  const { nbArticles } = usePanier();
  const [ouvert, setOuvert] = useState(false);
  const ticket = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  useEffect(() => setOuvert(false), [chemin]);

  useEffect(() => {
    if (!ouvert) return;
    ticket.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOuvert(false);
        bouton.current?.focus();
      }
    };
    const dehors = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!ticket.current?.contains(t) && !bouton.current?.contains(t)) setOuvert(false);
    };
    document.addEventListener('keydown', touche);
    document.addEventListener('pointerdown', dehors);
    return () => {
      document.removeEventListener('keydown', touche);
      document.removeEventListener('pointerdown', dehors);
    };
  }, [ouvert]);

  return (
    <div className={styles.barre} data-ouvert={ouvert}>
      <div ref={ticket} id="ticket-nav" className={styles.ticket} inert={!ouvert} aria-hidden={!ouvert}>
        <p className={`${styles.numero} num`} aria-hidden="true">
          Ticket N° 36
        </p>
        <nav aria-label="Navigation">
          <ul role="list" className={styles.liens}>
            <li>
              <LienPage href="/" className={styles.lien}>
                Accueil
              </LienPage>
            </li>
            {liensNav.map((l) => (
              <li key={l.href}>
                <LienPage href={l.href} className={styles.lien}>
                  {l.label}
                </LienPage>
              </li>
            ))}
          </ul>
        </nav>
        <a className={styles.tel} href={`tel:${boutique.telephone.lien}`}>
          <span>Appeler la boutique</span>
          <span className="num">{boutique.telephone.affiche}</span>
        </a>
      </div>

      <div className={styles.distributeur}>
        <button
          ref={bouton}
          type="button"
          className={styles.tirer}
          aria-expanded={ouvert}
          aria-controls="ticket-nav"
          onClick={() => setOuvert((o) => !o)}
        >
          <span className={styles.fente} aria-hidden="true" />
          <span>{ouvert ? 'Rendre le ticket' : 'Prenez un ticket'}</span>
        </button>
        <LienPage href="/commander" className={styles.commander} aria-current={chemin === '/commander' ? 'page' : undefined}>
          Commander
          {nbArticles > 0 && (
            <span className={`${styles.pastille} num`} aria-label={`${nbArticles} article${nbArticles > 1 ? 's' : ''} dans le sac`}>
              {nbArticles}
            </span>
          )}
        </LienPage>
      </div>
    </div>
  );
}
