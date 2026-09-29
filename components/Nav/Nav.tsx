'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoTampon } from '@/components/Logo/Logo';
import { BoutonTicket } from '@/components/BoutonTicket/BoutonTicket';
import { LienPage } from '@/components/Transition/Transition';
import { liensNav } from './liens';
import styles from './Nav.module.css';

/** En-tête desktop : logo-tampon à gauche, trois liens et le ticket à droite. */
export function Nav() {
  const chemin = usePathname();
  const [bande, setBande] = useState(false);

  useEffect(() => {
    const surveiller = () => {
      // Sur l'accueil, la bande n'apparaît qu'une fois l'intro passée.
      const intro = document.getElementById('intro');
      const seuil = intro ? intro.offsetTop + intro.offsetHeight - window.innerHeight * 1.05 : 40;
      setBande(window.scrollY > seuil);
    };
    surveiller();
    window.addEventListener('scroll', surveiller, { passive: true });
    window.addEventListener('resize', surveiller);
    return () => {
      window.removeEventListener('scroll', surveiller);
      window.removeEventListener('resize', surveiller);
    };
  }, [chemin]);

  return (
    <header className={styles.entete} data-bande={bande}>
      <LienPage href="/" className={styles.logo} aria-label="Au Bon Pain, retour à l’accueil">
        <LogoTampon className={styles.tampon} />
      </LienPage>
      <nav aria-label="Navigation principale" className={styles.nav}>
        <ul role="list" className={styles.liens}>
          {liensNav.map((l) => (
            <li key={l.href}>
              <LienPage href={l.href} className={styles.lien} aria-current={l.href === chemin ? 'page' : undefined}>
                {l.label}
              </LienPage>
            </li>
          ))}
        </ul>
        {chemin !== '/commander' && (
          <BoutonTicket href="/commander" className={styles.ticket} ton="croute">
            Commander
          </BoutonTicket>
        )}
      </nav>
    </header>
  );
}
