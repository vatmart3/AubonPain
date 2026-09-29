import type { ReactNode } from 'react';
import styles from './EnTetePage.module.css';

/** En-tête des pages intérieures : grand titre en Gloock, un chapeau, parfois une note. */
export function EnTetePage({ titre, chapeau, note }: { titre: ReactNode; chapeau?: ReactNode; note?: ReactNode }) {
  return (
    <header className={styles.entete}>
      <h1 className={styles.titre}>{titre}</h1>
      {chapeau && <p className={styles.chapeau}>{chapeau}</p>}
      {note && <p className={styles.note}>{note}</p>}
    </header>
  );
}
