'use client';

import { useEffect, useState } from 'react';
import { fournees, type Fournee } from '@/content/fournees';
import { boutique } from '@/content/boutique';
import { aSete, enMinutes, heureLisible, jourDeLaSemaine, quandLisible, statutBoutique, type Instant } from '@/lib/temps';
import styles from './HeureDuFour.module.css';

const DEBUT = 6 * 60; // la frise va de 6h…
const FIN = 13 * 60; // …à 13h

const duJour = (iso: string) => fournees.filter((f) => !f.jours || f.jours.includes(jourDeLaSemaine(iso)));

function depuis(minutes: number) {
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (minutes < 75) return 'il y a une heure';
  return `il y a ${heureLisible(minutes).replace(/^0h/, '')}`;
}

type Phrase = { heure?: string; texte: string; suite?: string };

function phraseDuMoment(i: Instant): Phrase {
  const s = statutBoutique(i);
  const heure = `Il est ${heureLisible(i.minutes)}.`;
  if (!s.ouvert) {
    if (!s.prochaine) return { texte: 'Le four dort.' };
    const quand = s.prochaine.dansJours <= 1 ? '' : `${quandLisible(s.prochaine.iso, s.prochaine.dansJours)} `;
    if (s.prochaine.dansJours === 0 && s.prochaine.minutes - i.minutes < 180) {
      return { heure, texte: 'Le four chauffe déjà.', suite: `On lève le rideau à ${heureLisible(s.prochaine.minutes)}.` };
    }
    return { texte: `Le four dort. Réveil ${quand}à ${heureLisible(s.prochaine.minutes)}.` };
  }
  const liste = duJour(i.iso);
  const derniere = [...liste].reverse().find((f) => enMinutes(f.heure) <= i.minutes);
  const prochaine = liste.find((f) => enMinutes(f.heure) > i.minutes);
  const suite = prochaine ? `Prochaine fournée à ${heureLisible(enMinutes(prochaine.heure))} : ${prochaine.quoi.toLowerCase()}.` : 'Plus de fournée aujourd’hui : premiers arrivés, premiers servis.';
  if (!derniere) return { heure, texte: 'La première fournée arrive.', suite };
  return { heure, texte: `${derniere.sujet} sont ${derniere.participe} ${depuis(i.minutes - enMinutes(derniere.heure))}.`.replace(/^La (\S+) sont/, 'La $1 est'), suite };
}

const position = (f: Fournee) => ((enMinutes(f.heure) - DEBUT) / (FIN - DEBUT)) * 100;

/** Les étiquettes ne se chevauchent pas : chacune au moins ECART % sous la précédente. */
const ECART = 8.5;
function placer(liste: Fournee[]) {
  const tops: number[] = [];
  liste.forEach((f, i) => tops.push(i ? Math.max(position(f), tops[i - 1] + ECART) : position(f)));
  return tops;
}

export function HeureDuFour() {
  const [instant, setInstant] = useState<Instant | null>(null);

  useEffect(() => {
    const maj = () => setInstant(aSete());
    maj();
    const t = window.setInterval(maj, 30_000);
    return () => window.clearInterval(t);
  }, []);

  const phrase = instant ? phraseDuMoment(instant) : null;
  const ouvert = instant ? statutBoutique(instant).ouvert : false;
  const liste = duJour(instant?.iso ?? '2026-01-05');
  const tops = placer(liste);
  const repere = instant && ouvert ? ((instant.minutes - DEBUT) / (FIN - DEBUT)) * 100 : null;

  return (
    <section className={`${styles.four} section-kraft sur-clair`} aria-labelledby="titre-four">
      <div className={styles.gauche}>
        <h2 id="titre-four" className={styles.surtitre}>
          L’heure du four
        </h2>
        <p className={styles.phrase} aria-live="polite">
          {phrase ? (
            <>
              {phrase.heure && <span className={`${styles.heure} num`}>{phrase.heure} </span>}
              <span>{phrase.texte}</span>
            </>
          ) : (
            <span>La première fournée sort avant l’ouverture.</span>
          )}
        </p>
        {phrase?.suite && <p className={styles.suite}>{phrase.suite}</p>}
        <p className={styles.note}>Les heures sont celles d’un jour ordinaire. Le samedi, le rideau se lève à {heureLisible(enMinutes(boutique.horaires[6][0]?.[0] ?? '07:00'))}.</p>
      </div>

      <div className={styles.ruban} aria-label="Les fournées de la matinée">
        <ol role="list" className={styles.graduation} aria-hidden="true">
          {Array.from({ length: (FIN - DEBUT) / 60 + 1 }, (_, k) => (
            <li key={k} style={{ top: `${(k * 60 * 100) / (FIN - DEBUT)}%` }} className="num">
              {DEBUT / 60 + k}h
            </li>
          ))}
        </ol>
        <ol role="list" className={styles.fournees}>
          {liste.map((f, k) => {
            const passee = instant ? ouvert && enMinutes(f.heure) <= instant.minutes : false;
            return (
              <li
                key={f.heure}
                className={styles.fournee}
                data-passee={passee}
                style={{ top: `${tops[k]}%` }}
              >
                <span className={`${styles.fHeure} num`}>{heureLisible(enMinutes(f.heure))}</span>
                <span className={styles.fQuoi}>{f.quoi}</span>
                {f.detail && <span className={styles.fDetail}>{f.detail}</span>}
              </li>
            );
          })}
        </ol>
        <ol role="list" className={styles.coches} aria-hidden="true">
          {liste.map((f) => (
            <li key={f.heure} style={{ top: `${position(f)}%` }} />
          ))}
        </ol>
        {repere !== null && repere >= 0 && repere <= 100 && (
          <div className={styles.maintenant} style={{ top: `${repere}%` }}>
            <span className={styles.maintenantLabel}>maintenant</span>
          </div>
        )}
      </div>
    </section>
  );
}
