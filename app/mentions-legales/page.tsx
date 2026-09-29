import type { Metadata } from 'next';
import { boutique } from '@/content/boutique';
import { EnTetePage } from '@/components/EnTetePage/EnTetePage';
import styles from '@/components/Prose/Prose.module.css';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site d’Au Bon Pain, boulangerie-pâtisserie au 36 rue Paul Bousquet à Sète.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegales() {
  const { adresse, telephone } = boutique;
  return (
    <>
      <EnTetePage titre="Mentions légales" />
      <article className={`${styles.prose} sur-clair`}>
        <div className={styles.colonne}>
          <h2>Éditeur du site</h2>
          <p>
            {boutique.gerante} — {boutique.nom}
            <br />
            {boutique.activite}
            <br />
            {adresse.rue}, {adresse.codePostal} {adresse.ville}
            <br />
            Téléphone : <a href={`tel:${telephone.lien}`}>{telephone.affiche}</a>
            <br />
            SIRET : <span className={boutique.siret.includes('VALIDER') ? styles.aValider : undefined}>{boutique.siret}</span>
            <br />
            Directrice de la publication : {boutique.gerante}
          </p>

          <h2>Hébergement</h2>
          <p>
            Vercel Inc.
            <br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
            <br />
            <a href="https://vercel.com" rel="noopener">
              vercel.com
            </a>
          </p>

          <h2>Conception et réalisation</h2>
          <p>
            MJAGENCY —{' '}
            <a href="https://mjagency.eu" rel="noopener">
              mjagency.eu
            </a>
          </p>

          <h2>Contenus</h2>
          <p>
            Textes : {boutique.nom}. Les illustrations du site sont des dessins provisoires, en attendant les photographies de la boutique.
            Les prix affichés sont indicatifs ; seul le prix payé en boutique fait foi.
          </p>
          <p>
            Polices de caractères : Gloock, Karla, Nanum Pen Script et IBM Plex Mono, sous licence SIL Open Font License.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Voir la page <a href="/confidentialite">Confidentialité</a>.
          </p>
        </div>
      </article>
    </>
  );
}
