'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { defilerVers, lenis, mouvementReduit } from '@/lib/defilement';
import { ScrollTrigger } from '@/lib/gsap';
import styles from './Transition.module.css';

const nomsPages: Record<string, string> = {
  '/': 'Au Bon Pain',
  '/la-maison': 'La maison',
  '/commander': 'Commander',
  '/mentions-legales': 'Mentions légales',
  '/confidentialite': 'Confidentialité',
};

type Etat = 'repos' | 'descend' | 'baisse' | 'remonte';

const Ctx = createContext<(href: string) => void>(() => {});

const DUREE = 260; // ms par mouvement : descente + remontée ≤ 0,6 s

/**
 * Rideau de fer entre les pages : il descend, la page change derrière,
 * il remonte avec le nom de la page qui passe au centre.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const chemin = usePathname();
  const [etat, setEtat] = useState<Etat>('repos');
  const [nom, setNom] = useState('');
  const cible = useRef<string | null>(null);
  const cheminCourant = useRef(chemin);
  cheminCourant.current = chemin;

  const aller = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const memePage = url.pathname === cheminCourant.current;
      if (memePage) {
        if (url.hash) defilerVers(url.hash, { decalage: -40 });
        else defilerVers(0);
        return;
      }
      if (mouvementReduit()) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }
      cible.current = url.pathname + url.search + url.hash;
      setNom(nomsPages[url.pathname] ?? '');
      setEtat('descend');
      window.setTimeout(() => {
        setEtat('baisse');
        router.push(cible.current!, { scroll: false });
      }, DUREE);
    },
    [router],
  );

  // La nouvelle page est là : on remonte en haut (ou à l'ancre), puis le rideau.
  useEffect(() => {
    lenis()?.resize();
    const hash = window.location.hash;
    if (hash) requestAnimationFrame(() => defilerVers(hash, { immediat: true, decalage: -40 }));
    else if (etat === 'baisse') defilerVers(0, { immediat: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    if (etat !== 'baisse') return;
    const t1 = window.setTimeout(() => setEtat('remonte'), 40);
    const t2 = window.setTimeout(() => setEtat('repos'), 40 + DUREE + 40);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chemin]);

  // Filet de sécurité : si la page tarde vraiment, on ne laisse pas le rideau baissé.
  useEffect(() => {
    if (etat !== 'baisse') return;
    const t = window.setTimeout(() => setEtat('repos'), 4000);
    return () => window.clearTimeout(t);
  }, [etat]);

  return (
    <Ctx.Provider value={aller}>
      {children}
      <div className={styles.rideau} data-etat={etat} aria-hidden="true">
        <span className={styles.nom}>{nom}</span>
      </div>
    </Ctx.Provider>
  );
}

export function useAller() {
  return useContext(Ctx);
}

/** Lien interne avec rideau. Garde le comportement natif (nouvel onglet, etc.). */
export function LienPage({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const aller = useAller();
  const clic = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target === '_blank') return;
    e.preventDefault();
    aller(href);
  };
  return <Link href={href} onClick={clic} {...props} />;
}
