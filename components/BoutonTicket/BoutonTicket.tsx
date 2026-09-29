'use client';

import type { ReactNode } from 'react';
import { LienPage } from '@/components/Transition/Transition';
import styles from './BoutonTicket.module.css';

type Props = {
  href?: string;
  children: ReactNode;
  numero?: string;
  taille?: 'petit' | 'grand';
  ton?: 'papier' | 'croute';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
};

/**
 * Le ticket de file d'attente : bords crantés, perforation, petit numéro.
 * Lien (href) ou bouton (onClick).
 */
export function BoutonTicket({ href, children, numero = '36', taille = 'petit', ton = 'papier', className = '', onClick, type = 'button' }: Props) {
  const contenu = (
    <>
      <span className={styles.souche} aria-hidden="true">
        <span className={styles.no}>N°</span>
        <span className={`${styles.numero} num`}>{numero}</span>
      </span>
      <span className={styles.texte}>{children}</span>
    </>
  );
  const classes = `${styles.ticket} ${styles[taille]} ${styles[ton]} ${className}`;
  if (href) {
    return (
      <LienPage href={href} className={classes} onClick={onClick}>
        {contenu}
      </LienPage>
    );
  }
  return (
    <button type={type} className={classes} onClick={onClick}>
      {contenu}
    </button>
  );
}
