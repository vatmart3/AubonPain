'use client';

import { forwardRef } from 'react';
import styles from './Commander.module.css';

/** Le sac kraft : il gonfle un peu à chaque article, le compte est écrit dessus à la main. */
export const Sac = forwardRef<HTMLDivElement, { nb: number; compact?: boolean }>(function Sac({ nb, compact = false }, ref) {
  const gonfle = 1 + Math.min(nb, 24) * 0.012;
  return (
    <div ref={ref} className={compact ? styles.sacCompact : styles.sac} style={{ ['--gonfle' as string]: gonfle }} aria-hidden="true">
      <svg viewBox="0 0 220 260" className={styles.sacDessin}>
        {/* soufflets */}
        <path d="M30 60 L20 250 L200 250 L190 60 Z" fill="var(--kraft)" />
        <path d="M30 60 L20 250 L44 250 L50 70 Z" fill="var(--kraft-fonce)" opacity=".75" />
        <path d="M190 60 L200 250 L176 250 L170 70 Z" fill="var(--kraft-fonce)" opacity=".75" />
        {/* haut replié en dents */}
        <path d="M30 60 L40 42 L50 60 L60 42 L70 60 L80 42 L90 60 L100 42 L110 60 L120 42 L130 60 L140 42 L150 60 L160 42 L170 60 L180 42 L190 60 Z" fill="var(--kraft-fonce)" />
        <path d="M20 250 L200 250" stroke="rgb(42 34 29 / .35)" strokeWidth="2" />
        <path d="M60 110 Q110 100 160 110" stroke="rgb(42 34 29 / .12)" strokeWidth="2" fill="none" />
        {/* ce qui dépasse du sac */}
        {nb > 0 && <rect x="120" y="-6" width="16" height="80" rx="8" fill="#b8763f" transform="rotate(14 128 60)" />}
        {nb > 2 && <rect x="92" y="-14" width="16" height="84" rx="8" fill="#a8662e" transform="rotate(-8 100 60)" />}
        <text x="110" y="200" textAnchor="middle" className={styles.sacTampon}>
          Au Bon Pain
        </text>
      </svg>
      <span className={`${styles.sacCompte} num`}>{nb === 0 ? 'vide' : nb === 1 ? '1 article' : `${nb} articles`}</span>
    </div>
  );
});
