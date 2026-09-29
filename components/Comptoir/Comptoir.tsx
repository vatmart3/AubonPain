import { produits } from '@/content/produits';
import { Etagere } from './Etagere';
import { ProduitEtagere } from './Etiquette';
import styles from './Comptoir.module.css';

export function Comptoir() {
  const surComptoir = produits.filter((p) => p.surComptoir);
  const haut = surComptoir.filter((p) => p.categorie === 'pains' || p.categorie === 'viennoiseries');
  const bas = surComptoir.filter((p) => p.categorie !== 'pains' && p.categorie !== 'viennoiseries');

  return (
    <section id="comptoir" className={`${styles.comptoir} section-four`} aria-labelledby="titre-comptoir">
      <div className={styles.tete}>
        <h2 id="titre-comptoir" className={styles.titre}>
          Ce matin sur le comptoir
        </h2>
        <p className={styles.chapeau}>
          Tout sort du fournil, ici, derrière. Retournez une étiquette pour lire le détail, et mettez de côté ce qui vous fait envie&nbsp;: vous le retirez quand vous voulez.
        </p>
      </div>

      <div className={styles.vitrine}>
        <Etagere label="Étagère du haut : pains et viennoiseries">
          {haut.map((p, i) => (
            <ProduitEtagere key={p.id} produit={p} index={i} />
          ))}
        </Etagere>
        <Etagere label="Étagère du bas : douceurs et salé">
          {bas.map((p, i) => (
            <ProduitEtagere key={p.id} produit={p} index={i + 3} />
          ))}
        </Etagere>
        <p className={styles.glisser} aria-hidden="true">
          <span className={styles.trait} /> faites glisser <span className={styles.trait} />
        </p>
      </div>
    </section>
  );
}
