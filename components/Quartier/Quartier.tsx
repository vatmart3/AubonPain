'use client';

import { useEffect, useState } from 'react';
import { boutique } from '@/content/boutique';
import { aSete, enMinutes, heureLisible, plagesDuJour, statutBoutique, statutCourt } from '@/lib/temps';
import { Plan } from './Plan';
import styles from './Quartier.module.css';

export function Quartier() {
  const [itineraire, setItineraire] = useState<string>(boutique.liens.googleMaps);
  const [aujourdhui, setAujourdhui] = useState<{ texte: string; statut: string } | null>(null);

  useEffect(() => {
    // Apple Plans sur iPhone, iPad et Mac ; Google Maps partout ailleurs.
    if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) setItineraire(boutique.liens.appleMaps);
    const i = aSete();
    const plages = plagesDuJour(i.iso);
    const s = statutCourt(statutBoutique(i));
    setAujourdhui({
      texte: plages.length
        ? `Aujourd’hui : ${plages.map(([a, b]) => `${heureLisible(enMinutes(a))} – ${heureLisible(enMinutes(b))}`).join(', ')}`
        : 'Aujourd’hui : fermé',
      statut: `${s.etat === 'OUVERT' ? 'Ouvert' : 'Fermé'}, ${s.suite}`,
    });
  }, []);

  return (
    <section id="quartier" className={`${styles.section} section-kraft sur-clair`} aria-labelledby="titre-quartier">
      <div className={styles.texte}>
        <h2 id="titre-quartier" className={styles.titre}>
          Le quartier
        </h2>
        <address className={styles.adresse}>
          {boutique.adresse.rue}
          <br />
          {boutique.adresse.codePostal} {boutique.adresse.ville}
        </address>
        <p className={styles.jour} aria-live="polite">
          {aujourdhui ? (
            <>
              {aujourdhui.texte}
              <span className={styles.statut}>{aujourdhui.statut}</span>
            </>
          ) : (
            ' '
          )}
        </p>
        <div className={styles.actions}>
          <a className={styles.itineraire} href={itineraire} target="_blank" rel="noopener">
            Itinéraire
          </a>
          <a className={styles.appeler} href={`tel:${boutique.telephone.lien}`}>
            <span>Appeler</span> <span className="num">{boutique.telephone.affiche}</span>
          </a>
        </div>
        <p className={`${styles.gps} num`}>
          {boutique.geo.lat.toFixed(4)}° N · {boutique.geo.lng.toFixed(5)}° E
        </p>
      </div>
      <div className={styles.carnet}>
        <Plan />
      </div>
    </section>
  );
}
