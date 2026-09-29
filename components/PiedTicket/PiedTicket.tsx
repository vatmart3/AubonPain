import { boutique, joursSemaine } from '@/content/boutique';
import { LienPage } from '@/components/Transition/Transition';
import { enMinutes, heureLisible } from '@/lib/temps';
import styles from './PiedTicket.module.css';

const ordre = [1, 2, 3, 4, 5, 6, 0] as const;

function horairesDuJour(j: (typeof ordre)[number]) {
  const plages = boutique.horaires[j];
  if (!plages.length) return 'FERMÉ';
  return plages.map(([a, b]) => `${heureLisible(enMinutes(a))}–${heureLisible(enMinutes(b))}`).join(' / ');
}

/** Le pied de page : un ticket de caisse thermique, bord déchiré en bas. */
export function PiedTicket() {
  const { adresse, telephone } = boutique;
  return (
    <footer className={styles.pied}>
      <div className={styles.ticket}>
        <div className={styles.papier}>
          <p className={styles.enseigne}>AU BON PAIN</p>
          <p className={styles.centre}>
            BOULANGERIE · PÂTISSERIE
            <br />
            {adresse.rue.toUpperCase()}
            <br />
            {adresse.codePostal} {adresse.ville.toUpperCase()}
            <br />
            TÉL.{' '}
            <a href={`tel:${telephone.lien}`} className={styles.tel}>
              {telephone.affiche}
            </a>
          </p>

          <p className={styles.tirets} aria-hidden="true" />

          <h2 className={styles.titre}>HORAIRES</h2>
          <dl className={styles.lignes}>
            {ordre.map((j) => (
              <div key={j} className={styles.ligne}>
                <dt>{joursSemaine[j].toUpperCase()}</dt>
                <dd>{horairesDuJour(j)}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.tirets} aria-hidden="true" />

          <h2 className={styles.titre}>RÈGLEMENT</h2>
          <p className={styles.gauche}>{boutique.paiements.join(' · ').toUpperCase()}</p>

          <p className={styles.tirets} aria-hidden="true" />

          <nav aria-label="Pied de page">
            <ul role="list" className={styles.liens}>
              <li>
                <LienPage href="/">Accueil</LienPage>
              </li>
              <li>
                <LienPage href="/la-maison">La maison</LienPage>
              </li>
              <li>
                <LienPage href="/commander">Commander</LienPage>
              </li>
              <li>
                <LienPage href="/mentions-legales">Mentions légales</LienPage>
              </li>
              <li>
                <LienPage href="/confidentialite">Confidentialité</LienPage>
              </li>
            </ul>
          </nav>

          <p className={styles.egal} aria-hidden="true" />
          <p className={styles.total}>
            <span>TOTAL</span>
            <span>UN BON MOMENT</span>
          </p>
          <p className={styles.egal} aria-hidden="true" />

          <p className={styles.merci}>MERCI ET À DEMAIN</p>

          <p className={styles.code} aria-hidden="true" />

          <p className={styles.credit}>
            Site réalisé par{' '}
            <a href="https://mjagency.eu" rel="noopener">
              MJAGENCY
            </a>
          </p>
        </div>
        <svg className={styles.dechirure} viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 H400 V4 L390 13 L380 5 L370 12 L360 4 L350 13 L340 6 L330 12 L320 4 L310 13 L300 5 L290 12 L280 4 L270 13 L260 6 L250 12 L240 4 L230 13 L220 5 L210 12 L200 4 L190 13 L180 6 L170 12 L160 4 L150 13 L140 5 L130 12 L120 4 L110 13 L100 6 L90 12 L80 4 L70 13 L60 5 L50 12 L40 4 L30 13 L20 6 L10 12 L0 4 Z" />
        </svg>
      </div>
    </footer>
  );
}
