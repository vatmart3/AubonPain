import { useSyncExternalStore } from 'react';

/** Routeur minimal en mémoire : l'artefact est une seule page, sans serveur. */
let chemin = '/';
const abonnes = new Set<() => void>();

export function naviguer(url: string) {
  const u = new URL(url, `https://artefact.local${chemin}`);
  chemin = u.pathname.replace(/\/$/, '') || '/';
  try {
    window.history.replaceState(null, '', window.location.pathname + u.search + u.hash);
  } catch {
    /* rien */
  }
  abonnes.forEach((f) => f());
}

const abonner = (f: () => void) => {
  abonnes.add(f);
  return () => abonnes.delete(f);
};

export function usePathname() {
  return useSyncExternalStore(abonner, () => chemin, () => chemin);
}

export function useRouter() {
  return { push: naviguer, replace: naviguer, prefetch() {}, back() {}, forward() {}, refresh() {} };
}

export function useSearchParams() {
  return new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
}
