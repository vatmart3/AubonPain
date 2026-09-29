import type { Metadata } from 'next';
import Image from 'next/image';
import { maison } from '@/content/maison';
import { boutique } from '@/content/boutique';
import { Silhouette } from '@/components/Maison/Silhouette';
import { Journee } from '@/components/Maison/Journee';
import { Familles } from '@/components/Maison/Familles';
import { BoutonTicket } from '@/components/BoutonTicket/BoutonTicket';
import styles from '@/components/Maison/Maison.module.css';

export const metadata: Metadata = {
  title: 'La maison : Madame Vatuone, boulangère rue Paul Bousquet',
  description:
    'Au Bon Pain, boulangerie de quartier à Sète tenue par Béatrice Marty Vatuone. Une journée au fournil, ce qu’on fait ici, et pourquoi une boulangerie compte dans une rue.',
  alternates: { canonical: '/la-maison' },
};

export default function LaMaison() {
  return (
    <>
      <section className={`${styles.ouverture} section-mie sur-clair`} aria-labelledby="titre-maison">
        <figure className={styles.portrait}>
          {maison.portrait ? (
            <Image src={maison.portrait} alt={`${boutique.gerante} derrière son comptoir`} width={900} height={1080} priority sizes="(max-width: 860px) 100vw, 45vw" />
          ) : (
            <Silhouette />
          )}
          <figcaption>{maison.portrait ? boutique.gerante : 'Le portrait arrive bientôt.'}</figcaption>
        </figure>
        <div className={styles.ouvertureTexte}>
          <p className={styles.rubrique}>La maison</p>
          <h1 className={styles.titreMaison}>
            Madame Vatuone,
            <br />
            <span>rue Paul Bousquet</span>
          </h1>
          <div className={styles.recit}>
            {maison.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className={styles.signature}>— {boutique.gerante}</p>
        </div>
      </section>

      <Journee />
      <Familles />

      <section className={`${styles.quartier} section-four`} aria-labelledby="titre-quartier-maison">
        <h2 id="titre-quartier-maison" className={styles.quartierTitre}>
          «&nbsp;Comme d’habitude&nbsp;?&nbsp;»
        </h2>
        <div className={styles.quartierTexte}>
          {maison.quartier.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <BoutonTicket href="/commander" taille="grand" numero="02">
            Commander
          </BoutonTicket>
        </div>
      </section>
    </>
  );
}
