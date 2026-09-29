'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { boutique, joursSemaine } from '@/content/boutique';
import { categories, produitParId, produits, type Categorie } from '@/content/produits';
import {
  QTE_MAX,
  creneauxDuJour,
  joursCalendrier,
  prixLisible,
  produitDisponible,
  telephoneFR,
  validerCommande,
  type JourCalendrier,
  type Ligne,
} from '@/lib/commande';
import { aSete, enMinutes, heureLisible, jourDeLaSemaine, jourLisible, moisCourt } from '@/lib/temps';
import { fichierIcs } from '@/lib/ics';
import { defilerVers } from '@/lib/defilement';
import { VisuelProduit } from '@/components/Illustrations/Illustrations';
import { usePanier } from '@/components/Panier/Panier';
import { Sac } from './Sac';
import { envolerVersSac } from './envol';
import styles from './Commander.module.css';

type Confirmee = { id: string; date: string; creneau: string; lignes: Ligne[]; total: number; prenom: string };
type Envoi = 'repos' | 'envoi' | 'erreur';

const telLien = `tel:${boutique.telephone.lien}`;

export function Commande() {
  const panier = usePanier();
  // Produit arrivé depuis « Mettre de côté » (lu après le montage : la page reste statique).
  const [ajout, setAjout] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Categorie>('pains');
  const [jours, setJours] = useState<JourCalendrier[] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [creneau, setCreneau] = useState<string | null>(null);
  const [champs, setChamps] = useState({ prenom: '', nom: '', telephone: '', remarque: '', demandeSpeciale: '', site: '' });
  const [speciale, setSpeciale] = useState(false);
  const [consentement, setConsentement] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState<Envoi>('repos');
  const [messageErreur, setMessageErreur] = useState('');
  const [confirmee, setConfirmee] = useState<Confirmee | null>(null);
  const [tamponne, setTamponne] = useState(false);

  const debut = useRef(0);
  const sac = useRef<HTMLDivElement>(null);
  const sacCompact = useRef<HTMLDivElement>(null);
  const bon = useRef<HTMLDivElement>(null);

  useEffect(() => {
    debut.current = Date.now();
    setJours(joursCalendrier(aSete()));
    const id = new URLSearchParams(window.location.search).get('ajout');
    const p = id ? produitParId.get(id) : undefined;
    if (p) {
      setAjout(p.id);
      setOnglet(p.categorie);
      requestAnimationFrame(() => document.getElementById(`p-${p.id}`)?.scrollIntoView({ block: 'center' }));
    }
  }, []);

  const lignes = panier.lignes;
  const indisponibles = date ? lignes.filter((l) => !produitDisponible(produitParId.get(l.id)!, date)) : [];
  const creneaux = useMemo(() => (date ? creneauxDuJour(date) : []), [date]);

  const etape2 = lignes.length > 0;
  const etape3 = etape2 && !!date && !!creneau;

  const changer = (nom: keyof typeof champs) => (e: { target: { value: string } }) => {
    setChamps((c) => ({ ...c, [nom]: e.target.value }));
    if (erreurs[nom]) setErreurs(({ [nom]: _, ...reste }) => reste);
  };

  const plus = (id: string) => {
    if (panier.quantite(id) >= QTE_MAX) return;
    panier.ajouter(id, 1);
    const visuel = document.querySelector(`#p-${id} [data-visuel]`);
    const cible = sacCompact.current && sacCompact.current.offsetParent ? sacCompact.current : sac.current;
    envolerVersSac(visuel, cible);
  };

  // Onglets en intercalaires : flèches gauche / droite
  const clavierOnglets = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = categories.findIndex((c) => c.id === onglet);
    const suivant = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (suivant === null) return;
    e.preventDefault();
    const c = categories[(suivant + categories.length) % categories.length];
    setOnglet(c.id);
    document.getElementById(`onglet-${c.id}`)?.focus();
  };

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    if (envoi === 'envoi') return;
    const donnees = {
      lignes,
      date: date ?? '',
      creneau: creneau ?? '',
      prenom: champs.prenom,
      nom: champs.nom,
      telephone: champs.telephone,
      remarque: champs.remarque,
      speciale,
      demandeSpeciale: champs.demandeSpeciale,
      consentement,
      site: champs.site,
      duree: Date.now() - debut.current,
    };
    const local = validerCommande(donnees);
    if (!local.ok) {
      setErreurs(local.erreurs);
      const premier = ['lignes', 'date', 'creneau', 'prenom', 'nom', 'telephone', 'demandeSpeciale', 'consentement'].find((k) => local.erreurs[k]);
      if (premier) document.getElementById(`champ-${premier}`)?.focus();
      return;
    }
    setErreurs({});
    setEnvoi('envoi');
    setTamponne(true);
    try {
      const res = await fetch('/api/commande', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(donnees),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; total?: number; erreurs?: Record<string, string>; message?: string };
      if (res.ok && json.ok && json.id) {
        const c: Confirmee = { id: json.id, date: donnees.date, creneau: donnees.creneau, lignes: [...lignes], total: json.total ?? panier.total, prenom: champs.prenom };
        // On laisse le temps au tampon de frapper, puis le bon se détache.
        window.setTimeout(() => {
          setConfirmee(c);
          panier.vider();
          setEnvoi('repos');
          requestAnimationFrame(() => defilerVers('#bon', { immediat: true, decalage: -90 }));
        }, 900);
        return;
      }
      if (res.status === 422 && json.erreurs) setErreurs(json.erreurs);
      setMessageErreur(json.message ?? 'La commande n’a pas pu partir.');
      setEnvoi('erreur');
      setTamponne(false);
    } catch {
      setMessageErreur('La commande n’a pas pu partir.');
      setEnvoi('erreur');
      setTamponne(false);
    }
  }

  function telechargerIcs(c: Confirmee) {
    const blob = new Blob([fichierIcs(c)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commande-au-bon-pain-${c.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // ── Confirmation : le bon est détaché, il devient un ticket ──────────────
  if (confirmee) {
    return (
      <div className={styles.page}>
        <div id="bon" className={styles.confirmation}>
          <div className={styles.soucheSeule} aria-hidden="true">
            <span className={styles.soucheNo}>N°</span>
            <span className={`${styles.soucheNumero} num`}>{confirmee.id}</span>
          </div>
          <article className={styles.ticket} aria-labelledby="ticket-titre">
            <p className={styles.ticketEnseigne}>Au Bon Pain</p>
            <h2 id="ticket-titre" className={styles.ticketTitre}>
              Commande <span className="num">{confirmee.id}</span>
            </h2>
            <p className={styles.ticketMessage} role="status">
              {boutique.appellation} a bien reçu votre commande sur son téléphone.
            </p>
            <dl className={styles.ticketInfos}>
              <div>
                <dt>Retrait</dt>
                <dd>
                  {jourLisible(confirmee.date)}, vers {heureLisible(enMinutes(confirmee.creneau))}
                </dd>
              </div>
              <div>
                <dt>Au nom de</dt>
                <dd>{confirmee.prenom}</dd>
              </div>
            </dl>
            <ul role="list" className={styles.ticketLignes}>
              {confirmee.lignes.map((l) => {
                const p = produitParId.get(l.id)!;
                return (
                  <li key={l.id}>
                    <span className="num">{l.qte} ×</span> <span>{p.nom}</span>
                    <span className="num">{prixLisible(p.prix * l.qte)}</span>
                  </li>
                );
              })}
            </ul>
            <p className={styles.ticketTotal}>
              <span>Total indicatif</span>
              <span className="num">{prixLisible(confirmee.total)}</span>
            </p>
            <p className={styles.ticketPaiement}>Paiement en boutique au retrait ({boutique.paiements.join(', ')}).</p>
            <div className={styles.ticketActions}>
              <button type="button" className={styles.boutonPlein} onClick={() => telechargerIcs(confirmee)}>
                Ajouter à mon agenda
              </button>
              <a className={styles.boutonTrait} href={telLien}>
                Appeler la boutique
              </a>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // ── Le bon de commande ───────────────────────────────────────────────────
  const produitsOnglet = produits.filter((p) => p.categorie === onglet);
  const nomAjout = ajout ? produitParId.get(ajout)?.nom : null;

  return (
    <div className={styles.page}>
      <form className={styles.grille} onSubmit={envoyer} noValidate>
        <div ref={bon} id="bon" className={styles.carnet} data-tamponne={tamponne}>
          <div className={styles.souche} aria-hidden="true">
            <span className={styles.soucheNo}>N°</span>
            <span className={`${styles.soucheNumero} num`}>AB-····</span>
            <span className={styles.soucheLigne}>{date ? jourLisible(date, false) : 'le …'}</span>
          </div>

          <div className={styles.feuille}>
            {nomAjout && panier.quantite(ajout!) > 0 && (
              <p className={styles.ajoute} role="status">
                {nomAjout} : mis dans le sac.
              </p>
            )}

            {/* 1 — Les produits */}
            <fieldset className={styles.bloc}>
              <legend className={styles.blocTitre}>
                <span className={styles.blocNum}>1</span> Qu’est-ce qui vous ferait plaisir&nbsp;?
              </legend>

              <div className={styles.intercalaires} role="tablist" aria-label="Familles de produits">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    id={`onglet-${c.id}`}
                    type="button"
                    role="tab"
                    aria-selected={onglet === c.id}
                    aria-controls="panneau-produits"
                    tabIndex={onglet === c.id ? 0 : -1}
                    className={styles.intercalaire}
                    onClick={() => setOnglet(c.id)}
                    onKeyDown={clavierOnglets}
                  >
                    {c.court}
                  </button>
                ))}
              </div>

              <ul role="tabpanel" id="panneau-produits" aria-labelledby={`onglet-${onglet}`} className={styles.produits}>
                {produitsOnglet.map((p) => {
                  const q = panier.quantite(p.id);
                  const indispo = date ? !produitDisponible(p, date) : false;
                  return (
                    <li key={p.id} id={`p-${p.id}`} className={styles.ligneProduit} data-indispo={indispo} data-choisi={q > 0}>
                      <span data-visuel className={styles.miniature}>
                        <VisuelProduit nom={p.illustration} photo={p.photo} alt="" sizes="96px" />
                      </span>
                      <span className={styles.produitTexte}>
                        <span className={styles.produitNom}>{p.nom}</span>
                        <span className={`${styles.produitPrix} num`}>
                          {prixLisible(p.prix)} <span className={styles.produitUnite}>{p.unite}</span>
                        </span>
                        {indispo && <span className={styles.pasCeJour}>pas ce jour-là</span>}
                      </span>
                      <span className={styles.stepper} role="group" aria-label={`Quantité de ${p.nom}`}>
                        <button
                          type="button"
                          className={styles.stepBtn}
                          onClick={() => panier.fixer(p.id, q - 1)}
                          disabled={q === 0}
                          aria-label={`Un ${p.nom} de moins`}
                        >
                          −
                        </button>
                        <output className={`${styles.stepQte} num`} aria-live="polite" aria-label={`${q} ${p.nom}`}>
                          {q}
                        </output>
                        <button
                          type="button"
                          className={styles.stepBtn}
                          onClick={() => plus(p.id)}
                          disabled={indispo || q >= QTE_MAX}
                          aria-label={`Un ${p.nom} de plus`}
                        >
                          +
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {erreurs.lignes && (
                <p id="champ-lignes" tabIndex={-1} className={styles.erreur}>
                  {erreurs.lignes}
                </p>
              )}
            </fieldset>

            {/* 2 — Le jour et l'heure */}
            <fieldset className={styles.bloc} disabled={!etape2} data-verrou={!etape2}>
              <legend className={styles.blocTitre}>
                <span className={styles.blocNum}>2</span> Pour quand&nbsp;?
              </legend>
              {!etape2 && <p className={styles.verrouNote}>D’abord, choisissez au moins un produit.</p>}

              <p className={styles.consigne}>
                Commande pour le lendemain au plus tôt, avant {heureLisible(enMinutes(boutique.commande.heureLimiteVeille))} la veille. Fermé le dimanche.
              </p>
              <div className={styles.calendrier} role="radiogroup" aria-label="Jour de retrait" id="champ-date" tabIndex={-1}>
                {!jours &&
                  Array.from({ length: boutique.commande.joursProposes }, (_, k) => <span key={k} className={styles.ephemeride} data-ferme="true" aria-hidden="true" />)}
                {(jours ?? []).map((j) => (
                  <label key={j.iso} className={styles.ephemeride} data-ferme={!j.ouvert} data-choisi={date === j.iso} title={j.raison}>
                    <input
                      type="radio"
                      name="date"
                      value={j.iso}
                      checked={date === j.iso}
                      disabled={!j.ouvert}
                      onChange={() => {
                        setDate(j.iso);
                        if (creneau && !creneauxDuJour(j.iso).includes(creneau)) setCreneau(null);
                        setErreurs(({ date: _, ...r }) => r);
                      }}
                      className="sr-only"
                    />
                    <span className={styles.ephMois}>{moisCourt(j.iso).slice(0, 4)}.</span>
                    <span className={`${styles.ephJour} num`}>{Number(j.iso.slice(8))}</span>
                    <span className={styles.ephSemaine}>{joursSemaine[jourDeLaSemaine(j.iso)].slice(0, 3)}.</span>
                    {!j.ouvert && <span className="sr-only">, indisponible : {j.raison}</span>}
                  </label>
                ))}
              </div>
              {erreurs.date && <p className={styles.erreur}>{erreurs.date}</p>}

              {date && (
                <>
                  <p className={styles.sousTitre}>
                    Retrait le <strong>{jourLisible(date)}</strong>, vers&nbsp;:
                  </p>
                  <div className={styles.creneaux} role="radiogroup" aria-label="Heure de retrait" id="champ-creneau" tabIndex={-1}>
                    {creneaux.map((c) => (
                      <label key={c} className={styles.creneau} data-choisi={creneau === c}>
                        <input
                          type="radio"
                          name="creneau"
                          value={c}
                          checked={creneau === c}
                          onChange={() => {
                            setCreneau(c);
                            setErreurs(({ creneau: _, ...r }) => r);
                          }}
                          className="sr-only"
                        />
                        <span className="num">{heureLisible(enMinutes(c))}</span>
                      </label>
                    ))}
                  </div>
                  {erreurs.creneau && <p className={styles.erreur}>{erreurs.creneau}</p>}
                </>
              )}

              {indisponibles.length > 0 && (
                <div className={styles.alerte} role="alert">
                  <p>Ce jour-là, pas de&nbsp;:</p>
                  <ul role="list">
                    {indisponibles.map((l) => (
                      <li key={l.id}>
                        {produitParId.get(l.id)!.nom}{' '}
                        <button type="button" className={styles.lienBouton} onClick={() => panier.fixer(l.id, 0)}>
                          retirer du sac
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </fieldset>

            {/* 3 — Le nom */}
            <fieldset className={styles.bloc} disabled={!etape3} data-verrou={!etape3}>
              <legend className={styles.blocTitre}>
                <span className={styles.blocNum}>3</span> À quel nom&nbsp;?
              </legend>
              {!etape3 && <p className={styles.verrouNote}>Choisissez d’abord le jour et l’heure.</p>}

              <div className={styles.champsDuo}>
                <Champ id="prenom" label="Prénom" erreur={erreurs.prenom}>
                  <input id="champ-prenom" autoComplete="given-name" value={champs.prenom} onChange={changer('prenom')} maxLength={40} required aria-invalid={!!erreurs.prenom} aria-describedby={erreurs.prenom ? 'erreur-prenom' : undefined} />
                </Champ>
                <Champ id="nom" label="Nom" erreur={erreurs.nom}>
                  <input id="champ-nom" autoComplete="family-name" value={champs.nom} onChange={changer('nom')} maxLength={60} required aria-invalid={!!erreurs.nom} aria-describedby={erreurs.nom ? 'erreur-nom' : undefined} />
                </Champ>
              </div>
              <Champ id="telephone" label="Téléphone" aide="Pour vous prévenir s’il y a un souci. Jamais pour autre chose." erreur={erreurs.telephone}>
                <input
                  id="champ-telephone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={champs.telephone}
                  onChange={changer('telephone')}
                  onBlur={() => {
                    const t = telephoneFR(champs.telephone);
                    if (t) setChamps((c) => ({ ...c, telephone: t }));
                  }}
                  maxLength={30}
                  required
                  aria-invalid={!!erreurs.telephone}
                  aria-describedby={`aide-telephone${erreurs.telephone ? ' erreur-telephone' : ''}`}
                />
              </Champ>
              <Champ id="remarque" label="Une remarque ?" aide="« bien cuite », « tranché », « sans sucre glace »…" erreur={erreurs.remarque}>
                <textarea id="champ-remarque" rows={2} value={champs.remarque} onChange={changer('remarque')} maxLength={200} aria-describedby="aide-remarque" />
              </Champ>

              <label className={styles.case}>
                <input type="checkbox" checked={speciale} onChange={(e) => setSpeciale(e.target.checked)} />
                <span>Commande spéciale ou événement (plaques entières, grosses quantités…)</span>
              </label>
              {speciale && (
                <Champ id="demandeSpeciale" label="Dites-nous ce qu’il vous faut" erreur={erreurs.demandeSpeciale}>
                  <textarea
                    id="champ-demandeSpeciale"
                    rows={3}
                    value={champs.demandeSpeciale}
                    onChange={changer('demandeSpeciale')}
                    maxLength={400}
                    aria-invalid={!!erreurs.demandeSpeciale}
                    aria-describedby={erreurs.demandeSpeciale ? 'erreur-demandeSpeciale' : undefined}
                  />
                </Champ>
              )}

              {/* Champ piège : invisible pour les humains, rempli par les robots */}
              <div className={styles.piege} aria-hidden="true">
                <label htmlFor="champ-site">Ne pas remplir</label>
                <input id="champ-site" tabIndex={-1} autoComplete="off" value={champs.site} onChange={changer('site')} />
              </div>

              <label className={styles.case} data-erreur={!!erreurs.consentement}>
                <input
                  id="champ-consentement"
                  type="checkbox"
                  checked={consentement}
                  onChange={(e) => {
                    setConsentement(e.target.checked);
                    setErreurs(({ consentement: _, ...r }) => r);
                  }}
                  aria-invalid={!!erreurs.consentement}
                  aria-describedby="aide-consentement"
                />
                <span id="aide-consentement">
                  J’accepte que mon nom et mon téléphone soient transmis à la boulangerie pour préparer ma commande. Rien n’est gardé sur le site.{' '}
                  <a href="/confidentialite" target="_blank" rel="noopener">
                    Confidentialité
                  </a>
                </span>
              </label>
              {erreurs.consentement && <p className={styles.erreur}>{erreurs.consentement}</p>}

              {envoi === 'erreur' && (
                <div className={styles.echec} role="alert">
                  <p>
                    {messageErreur} Appelez-nous au <span className="num">{boutique.telephone.affiche}</span>, on la note au téléphone.
                  </p>
                  <a className={styles.boutonPlein} href={telLien}>
                    Appeler la boutique
                  </a>
                </div>
              )}

              <button type="submit" className={styles.tampon} disabled={envoi === 'envoi'}>
                <span className={styles.tamponObjet} aria-hidden="true">
                  <span className={styles.tamponManche} />
                  <span className={styles.tamponSemelle}>COMMANDÉ</span>
                </span>
                <span className={styles.tamponTexte}>{envoi === 'envoi' ? 'Envoi…' : 'Tamponner ma commande'}</span>
              </button>
            </fieldset>

            <span className={styles.encre} aria-hidden="true">
              COMMANDÉ
            </span>
          </div>
        </div>

        {/* À droite : le sac et le récapitulatif */}
        <aside className={styles.cote} aria-label="Votre sac">
          <Sac ref={sac} nb={panier.nbArticles} />
          <Recap lignes={lignes} total={panier.total} indispo={indisponibles.map((l) => l.id)} />
        </aside>

        {/* Mobile : le sac suit en bas de l'écran */}
        <div className={styles.sacBarre}>
          <Sac ref={sacCompact} nb={panier.nbArticles} compact />
          <span className="num">{prixLisible(panier.total)}</span>
          <button type="button" className={styles.lienBouton} onClick={() => defilerVers('#recap', { decalage: -80 })}>
            Voir le bon
          </button>
        </div>
      </form>
    </div>
  );
}

function Champ({ id, label, aide, erreur, children }: { id: string; label: string; aide?: string; erreur?: string; children: React.ReactNode }) {
  return (
    <div className={styles.champ} data-erreur={!!erreur}>
      <label htmlFor={`champ-${id}`}>{label}</label>
      {children}
      {aide && (
        <span id={`aide-${id}`} className={styles.aide}>
          {aide}
        </span>
      )}
      {erreur && (
        <span id={`erreur-${id}`} className={styles.erreur}>
          {erreur}
        </span>
      )}
    </div>
  );
}

function Recap({ lignes, total, indispo }: { lignes: Ligne[]; total: number; indispo: string[] }) {
  return (
    <section id="recap" className={styles.recap} aria-labelledby="recap-titre">
      <h2 id="recap-titre" className={styles.recapTitre}>
        Votre bon
      </h2>
      {lignes.length === 0 ? (
        <p className={styles.recapVide}>Le sac est vide pour l’instant.</p>
      ) : (
        <ul role="list" className={styles.recapLignes}>
          {lignes.map((l) => {
            const p = produitParId.get(l.id)!;
            return (
              <li key={l.id} data-indispo={indispo.includes(l.id)}>
                <span className="num">{l.qte} ×</span>
                <span>{p.nom}</span>
                <span className="num">{prixLisible(p.prix * l.qte)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <p className={styles.recapTotal}>
        <span>Total indicatif</span>
        <span className="num">{prixLisible(total)}</span>
      </p>
      <p className={styles.recapPaiement}>Paiement en boutique au retrait ({boutique.paiements.join(', ')}).</p>
      <p className={styles.recapRappel}>Commandé = mis de côté, même si le comptoir est vide à 11h.</p>
    </section>
  );
}
