import { BoutonTicket } from '@/components/BoutonTicket/BoutonTicket';
import styles from './AppelCommande.module.css';

export function AppelCommande() {
  return (
    <section className={`${styles.section} section-four`} aria-labelledby="titre-appel">
      <p className={styles.rappel}>Commandé = mis de côté, même si le comptoir est vide à 11h.</p>
      <h2 id="titre-appel" className={styles.phrase}>
        Demain matin, <span className={styles.retrait}>votre pain vous attend.</span>
      </h2>
      <div className={styles.bas}>
        <BoutonTicket href="/commander" taille="grand" numero="01">
          Réserver ma commande
        </BoutonTicket>
        <p className={styles.sous}>Vous commandez ici, vous payez en boutique.</p>
      </div>
    </section>
  );
}
