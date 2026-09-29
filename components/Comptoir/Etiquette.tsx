'use client';

import { useState } from 'react';
import type { Produit } from '@/content/produits';
import { prixLisible } from '@/lib/commande';
import { VisuelProduit } from '@/components/Illustrations/Illustrations';
import { usePanier } from '@/components/Panier/Panier';
import { useAller } from '@/components/Transition/Transition';
import styles from './Comptoir.module.css';

/** Un produit posé sur l'étagère, avec son étiquette de prix piquée dedans. */
export function ProduitEtagere({ produit, index }: { produit: Produit; index: number }) {
  const [retournee, setRetournee] = useState(false);
  const { ajouter } = usePanier();
  const aller = useAller();
  const inclinaison = [-3, 2.5, -1.5, 3.5, -2.5, 1.5][index % 6];

  return (
    <li className={styles.produit} style={{ ['--incl' as string]: `${inclinaison}deg` }}>
      <div className={styles.etiquette} data-retournee={retournee}>
        <div className={styles.carte}>
          <button
            type="button"
            className={styles.recto}
            aria-expanded={retournee}
            aria-controls={`verso-${produit.id}`}
            onClick={() => setRetournee((r) => !r)}
          >
            <span className={styles.nom}>{produit.nom}</span>
            <span className={`${styles.prix} num`}>{prixLisible(produit.prix)}</span>
            <span className={styles.unite}>{produit.unite}</span>
            <span className="sr-only">, voir le détail</span>
          </button>
          <div id={`verso-${produit.id}`} className={styles.verso}>
            <p className={styles.description}>{produit.description}</p>
            <button
              type="button"
              className={styles.deCote}
              onClick={() => {
                ajouter(produit.id, 1);
                aller(`/commander?ajout=${produit.id}`);
              }}
            >
              Mettre de côté
            </button>
          </div>
        </div>
        <span className={styles.pique} aria-hidden="true" />
      </div>
      <div className={styles.pose}>
        <VisuelProduit nom={produit.illustration} photo={produit.photo} alt={produit.nom} className={styles.visuel} sizes="(max-width: 760px) 170px, 240px" />
        <span className={styles.ombre} aria-hidden="true" />
      </div>
    </li>
  );
}
