'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { produitParId } from '@/content/produits';
import { QTE_MAX, totalCentimes, type Ligne } from '@/lib/commande';
import { stockage } from '@/lib/defilement';

type Panier = {
  lignes: Ligne[];
  quantite: (id: string) => number;
  ajouter: (id: string, n?: number) => void;
  fixer: (id: string, qte: number) => void;
  vider: () => void;
  nbArticles: number;
  total: number;
};

const Ctx = createContext<Panier | null>(null);
const CLE = 'abp-panier';

export function PanierProvider({ children }: { children: ReactNode }) {
  const [quantites, setQuantites] = useState<Record<string, number>>({});

  // Confort : on retrouve le panier si l'onglet est rechargé.
  useEffect(() => {
    const brut = stockage.lire('local', CLE);
    if (!brut) return;
    try {
      const lu = JSON.parse(brut) as Record<string, number>;
      const propre = Object.fromEntries(
        Object.entries(lu).filter(([id, q]) => produitParId.has(id) && Number.isInteger(q) && q > 0 && q <= QTE_MAX),
      );
      setQuantites(propre);
    } catch {
      /* panier illisible : on repart de zéro */
    }
  }, []);

  useEffect(() => {
    stockage.ecrire('local', CLE, JSON.stringify(quantites));
  }, [quantites]);

  const fixer = useCallback((id: string, qte: number) => {
    setQuantites((q) => {
      const suivant = { ...q };
      const n = Math.max(0, Math.min(QTE_MAX, Math.round(qte)));
      if (n === 0) delete suivant[id];
      else suivant[id] = n;
      return suivant;
    });
  }, []);

  const ajouter = useCallback((id: string, n = 1) => {
    setQuantites((q) => ({ ...q, [id]: Math.min(QTE_MAX, (q[id] ?? 0) + n) }));
  }, []);

  const vider = useCallback(() => setQuantites({}), []);

  const valeur = useMemo<Panier>(() => {
    const lignes = Object.entries(quantites).map(([id, qte]) => ({ id, qte }));
    return {
      lignes,
      quantite: (id) => quantites[id] ?? 0,
      ajouter,
      fixer,
      vider,
      nbArticles: lignes.reduce((n, l) => n + l.qte, 0),
      total: totalCentimes(lignes),
    };
  }, [quantites, ajouter, fixer, vider]);

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function usePanier() {
  const p = useContext(Ctx);
  if (!p) throw new Error('usePanier hors de PanierProvider');
  return p;
}
