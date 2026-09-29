import type { Metadata } from 'next';
import { boutique } from '@/content/boutique';
import { EnTetePage } from '@/components/EnTetePage/EnTetePage';
import styles from '@/components/Prose/Prose.module.css';

export const metadata: Metadata = {
  title: 'Confidentialité',
  description: 'Ce que devient votre nom et votre numéro quand vous commandez sur le site d’Au Bon Pain : rien n’est stocké sur le site.',
  alternates: { canonical: '/confidentialite' },
};

export default function Confidentialite() {
  return (
    <>
      <EnTetePage titre="Confidentialité" chapeau="En deux mots : on ne garde rien sur le site, et on ne vous suit pas." />
      <article className={`${styles.prose} sur-clair`}>
        <div className={styles.colonne}>
          <h2>Quand vous commandez</h2>
          <p>Pour préparer votre commande, le formulaire nous transmet :</p>
          <ul>
            <li>votre prénom et votre nom ;</li>
            <li>votre numéro de téléphone ;</li>
            <li>votre commande (produits, jour et heure de retrait) et votre remarque éventuelle.</li>
          </ul>
          <p>
            Ces informations partent directement sur le téléphone de la boulangerie, par un message WhatsApp envoyé grâce à un service tiers,{' '}
            <a href="https://www.callmebot.com" rel="noopener">
              CallMeBot
            </a>
            . Elles ne sont <strong>pas enregistrées sur le site</strong> : il n’y a pas de base de données, pas de compte client.
          </p>
          <p>
            Elles servent uniquement à préparer votre commande et à vous appeler s’il y a un souci (un produit qui manque, un retard). Jamais
            à autre chose, jamais revendues, jamais utilisées pour de la publicité.
          </p>
          <p>
            Base légale : votre demande de commande (mesures précontractuelles) et votre accord, que vous donnez en cochant la case du
            formulaire.
          </p>

          <h2>Combien de temps</h2>
          <p>
            Le message reste sur le téléphone de la boulangerie le temps de préparer et de remettre la commande.{' '}
            <span className={styles.aValider}>[À VALIDER] durée de conservation des messages avec Madame Vatuone</span>
          </p>
          <p>
            Pour limiter les abus, l’adresse IP de l’envoi est gardée en mémoire par le serveur pendant dix minutes au plus, puis oubliée.
            L’hébergeur du site (Vercel) peut conserver des journaux techniques de connexion pour la sécurité.
          </p>

          <h2>Cookies</h2>
          <p>
            Aucun cookie de suivi, aucune mesure d’audience, aucune publicité : c’est pour ça qu’il n’y a pas de bandeau. Le site utilise
            seulement la mémoire de votre navigateur pour deux conforts : garder votre sac pendant la visite, et ne pas vous remontrer toute
            l’animation d’entrée si vous l’avez déjà vue. Ces données ne quittent pas votre appareil.
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous pouvez demander à consulter, corriger ou effacer les informations d’une commande : appelez-nous au{' '}
            <a href={`tel:${boutique.telephone.lien}`}>{boutique.telephone.affiche}</a> ou passez en boutique, {boutique.adresse.rue} à{' '}
            {boutique.adresse.ville}. En cas de désaccord, vous pouvez saisir la{' '}
            <a href="https://www.cnil.fr/fr/plaintes" rel="noopener">
              CNIL
            </a>
            .
          </p>

          <p className={styles.maj}>Responsable du traitement : {boutique.gerante}, {boutique.nom}.</p>
        </div>
      </article>
    </>
  );
}
