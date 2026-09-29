'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { defilerVers, mouvementReduit, stockage } from '@/lib/defilement';
import { aSete, statutBoutique, statutCourt } from '@/lib/temps';
import { boutique } from '@/content/boutique';
import { cheminFrame, introConfig, srcPlaceholder, type ModeIntro } from './intro.config';
import { CIBLES, IMAGE, LARGEUR_MOBILE, PORTE, enPourcents } from './geometrie';
import { reveillerAudio, sonnerClochette } from './clochette';
import styles from './Intro.module.css';

const Farine = dynamic(() => import('./Farine'), { ssr: false });

type Format = 'desktop' | 'mobile';

/** Même requête que dans le CSS : écran en hauteur → images 9:16. */
const MQ_MOBILE = '(max-aspect-ratio: 5/6)';
const MQ_DESKTOP = '(min-aspect-ratio: 5/6)';


function Photo({ nom, alt = '', priorite = false, className }: { nom: string; alt?: string; priorite?: boolean; className?: string }) {
  return (
    <picture>
      {srcPlaceholder('mobile', nom, 'avif') && <source type="image/avif" media={MQ_MOBILE} srcSet={srcPlaceholder('mobile', nom, 'avif')!} />}
      <source type="image/webp" media={MQ_MOBILE} srcSet={srcPlaceholder('mobile', nom, 'webp')!} />
      {srcPlaceholder('desktop', nom, 'avif') && <source type="image/avif" srcSet={srcPlaceholder('desktop', nom, 'avif')!} />}
      <img
        src={srcPlaceholder('desktop', nom, 'webp')!}
        alt={alt}
        width={IMAGE.w}
        height={IMAGE.h}
        className={className}
        decoding="async"
        fetchPriority={priorite ? 'high' : 'low'}
        draggable={false}
      />
    </picture>
  );
}

/** Un battant de porte : un morceau de l'image « façade » découpé au bon endroit. */
function Battant({ cote }: { cote: 'g' | 'd' }) {
  // Géométrie des deux formats en variables CSS : le bon format est choisi par media query,
  // sans attendre le JavaScript (pas de décalage à l'hydratation).
  const vars: Record<string, string> = {};
  for (const [f, suffixe] of [['desktop', 'd'], ['mobile', 'm']] as const) {
    const porte = enPourcents(PORTE, f);
    const demi = porte.w / 2;
    const x = cote === 'g' ? porte.x : porte.x + demi;
    vars[`--dw-${suffixe}`] = `${(100 / demi) * 100}%`;
    vars[`--dh-${suffixe}`] = `${(100 / porte.h) * 100}%`;
    vars[`--dl-${suffixe}`] = `${(-x / demi) * 100}%`;
    vars[`--dt-${suffixe}`] = `${(-porte.y / porte.h) * 100}%`;
  }
  return (
    <div className={`${styles.battant} ${cote === 'g' ? styles.battantG : styles.battantD}`} data-battant={cote}>
      <div className={styles.decoupe} style={vars as CSSProperties}>
        <Photo nom="facade" priorite />
      </div>
      <div className={styles.dosBattant} data-dos />
    </div>
  );
}

/** Variables CSS de position de la porte, pour les deux formats. */
function varsPorte() {
  const v: Record<string, string> = {};
  for (const [f, sfx] of [['desktop', 'd'], ['mobile', 'm']] as const) {
    const p = enPourcents(PORTE, f);
    v[`--px-${sfx}`] = `${p.x}%`;
    v[`--py-${sfx}`] = `${p.y}%`;
    v[`--pw-${sfx}`] = `${p.w}%`;
    v[`--ph-${sfx}`] = `${p.h}%`;
    v[`--pwq-${sfx}`] = `${p.w}cqw`;
    v[`--vy-${sfx}`] = `${p.y + p.h * 0.16}%`;
    v[`--origine-${sfx}`] = `${p.x + p.w / 2}% ${p.y + p.h * 0.55}%`;
  }
  return v as CSSProperties;
}

export function Intro({ mode }: { mode: ModeIntro }) {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progression = useRef(0);
  const bouffee = useRef(0);
  const sonActif = useRef(false);

  const [format, setFormat] = useState<Format>('desktop');
  const [reduit, setReduit] = useState(false);
  const [particules, setParticules] = useState(0);
  const [son, setSon] = useState(false);
  const [statut, setStatut] = useState<ReturnType<typeof statutCourt> | null>(null);
  const [ouvert, setOuvert] = useState<boolean | null>(null);

  // Format d'image, mouvement réduit, statut ouvert/fermé (côté client : dépend de l'heure).
  useEffect(() => {
    const mq = window.matchMedia(MQ_MOBILE);
    const maj = () => setFormat(mq.matches ? 'mobile' : 'desktop');
    maj();
    mq.addEventListener('change', maj);
    setReduit(mouvementReduit());
    const s = statutBoutique(aSete());
    setStatut(statutCourt(s));
    setOuvert(s.ouvert);
    return () => mq.removeEventListener('change', maj);
  }, []);

  // La farine en three.js : seulement si ça en vaut la peine, et après le premier affichage.
  useEffect(() => {
    if (reduit) return;
    const etroit = window.innerWidth < 400;
    const lent = (navigator.hardwareConcurrency ?? 8) <= 4;
    if (etroit && lent) return;
    const n = window.innerWidth < 760 ? Math.round(introConfig.particules / 3) : introConfig.particules;
    // three.js ne se charge qu'au premier geste (ou après quelques secondes) :
    // la façade s'affiche d'abord, la farine arrive ensuite.
    const evenements = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;
    let fait = false;
    const lancer = () => {
      if (fait) return;
      fait = true;
      setParticules(n);
      nettoyer();
    };
    const minuterie = window.setTimeout(lancer, 6000);
    const nettoyer = () => {
      window.clearTimeout(minuterie);
      evenements.forEach((e) => window.removeEventListener(e, lancer));
    };
    evenements.forEach((e) => window.addEventListener(e, lancer, { passive: true, once: true }));
    return nettoyer;
  }, [reduit]);

  useEffect(() => {
    sonActif.current = son;
  }, [son]);

  // Pendant l'intro, le ticket « Commander » de l'en-tête reste caché.
  useEffect(() => {
    document.documentElement.dataset.intro = 'en-cours';
    return () => {
      delete document.documentElement.dataset.intro;
    };
  }, []);

  // ── Séquence de frames : chargement progressif et dessin ────────────────
  useEffect(() => {
    if (mode !== 'frames' || reduit) return;
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const total = introConfig.frames[format].nombre;
    const images: (HTMLImageElement | null)[] = new Array(total).fill(null);
    let annule = false;
    let demande = 0;

    const dimensionner = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      dessiner();
    };

    function dessiner() {
      cancelAnimationFrame(demande);
      demande = requestAnimationFrame(() => {
        const cible = Math.round(Math.min(1, progression.current / 0.92) * (total - 1));
        // Si la frame n'est pas encore là, on prend la plus proche déjà chargée.
        let img: HTMLImageElement | null = null;
        for (let d = 0; d < total && !img; d++) img = images[cible - d] ?? images[cible + d] ?? null;
        if (!img || !ctx || !cv) return;
        const s = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
      });
    }

    const charger = (i: number) =>
      new Promise<void>((ok) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = cheminFrame(format, i + 1);
        img.onload = () => {
          if (!annule) images[i] = img;
          ok();
        };
        img.onerror = () => ok();
      });

    (async () => {
      await charger(0);
      dimensionner();
      const paquet = introConfig.frames.paquet;
      for (let debut = 1; debut < total && !annule; debut += paquet) {
        await Promise.all(Array.from({ length: Math.min(paquet, total - debut) }, (_, k) => charger(debut + k)));
        dessiner();
      }
    })();

    window.addEventListener('resize', dimensionner);
    const st = ScrollTrigger.create({ trigger: section.current, start: 'top top', end: 'bottom bottom', onUpdate: dessiner });
    return () => {
      annule = true;
      cancelAnimationFrame(demande);
      window.removeEventListener('resize', dimensionner);
      st.kill();
    };
  }, [mode, format, reduit]);

  // ── La chorégraphie, pilotée par le défilement ──────────────────────────
  useEffect(() => {
    const sec = section.current;
    const sc = scene.current;
    if (!sec || !sc) return;
    const q = gsap.utils.selector(sc);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
      tl.set({}, {}, 1); // la frise dure exactement 1 (= progression)

      if (reduit) {
        // Pas de séquence : la façade, puis un fondu vers le comptoir.
        tl.to(q('[data-plaque], [data-invite]'), { opacity: 0, duration: 0.1 }, 0.1)
          .fromTo(q('[data-comptoir]'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.25)
          .fromTo(q('[data-logo]'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.55)
          .to(sc, { opacity: 0, duration: 0.15 }, 0.85);
      } else {
        const placeholder = mode === 'placeholder';
        tl.to(q('[data-plaque], [data-invite]'), { opacity: 0, y: 24, duration: 0.04 }, 0.06)
          .to(q('[data-rayon]'), { opacity: 0, duration: 0.2 }, 0.2)
          .fromTo(q('[data-vitre]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.04 }, 0.1)
          .to(q('[data-vitre]'), { opacity: 0, duration: 0.03 }, 0.28)
          .fromTo(q('[data-chaleur]'), { opacity: 0 }, { opacity: 0.12, duration: 0.35 }, 0.45);

        if (placeholder) {
          tl.to(q('[data-camera]'), { scale: 2.4, duration: 0.22, ease: 'power1.in' }, 0.08)
            .to(q('[data-camera]'), { scale: 3.2, duration: 0.15 }, 0.3)
            .to(q('[data-battant="g"]'), { rotateY: 106, duration: 0.14, ease: 'power2.inOut' }, 0.3)
            .to(q('[data-battant="d"]'), { rotateY: -106, duration: 0.14, ease: 'power2.inOut' }, 0.3)
            .to(q('[data-dos]'), { opacity: 0.55, duration: 0.14 }, 0.3)
            .to(q('[data-camera]'), { scale: 8, duration: 0.08, ease: 'power2.in' }, 0.45)
            .fromTo(q('[data-interieur]'), { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1.12, duration: 0.08, ease: 'power1.out' }, 0.45)
            .to(q('[data-interieur]'), { scale: 1.6, duration: 0.3 }, 0.53)
            .fromTo(q('[data-comptoir]'), { opacity: 0, scale: 1.22 }, { opacity: 1, scale: 1.1, duration: 0.08 }, 0.76)
            .to(q('[data-comptoir]'), { scale: 1, duration: 0.08, ease: 'power3.out' }, 0.84);
        }

        // Annotations manuscrites : le trait se dessine, puis s'efface.
        for (const [i, debut] of [[1, 0.52], [2, 0.58]] as const) {
          tl.fromTo(q(`[data-annot="${i}"]`), { opacity: 0 }, { opacity: 1, duration: 0.03 }, debut)
            .fromTo(q(`[data-annot="${i}"] [data-trait]`), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.06 }, debut)
            .to(q(`[data-annot="${i}"]`), { opacity: 0, duration: 0.04 }, debut + 0.16);
        }

        // La vitre du comptoir glisse vers le haut et découvre la suite.
        tl.to(sc, { yPercent: -100, duration: 0.035, ease: 'power2.in' }, 0.965);
      }

      // Le « bam » : micro-flash, bouffée de farine, le nom qui s'écrit. Minuté, pas au défilement.
      const bam = reduit
        ? null
        : gsap
        .timeline({ paused: true })
        .fromTo(q('[data-flash]'), { opacity: 0 }, { opacity: 0.8, duration: 0.05, ease: 'none' })
        .to(q('[data-flash]'), { opacity: 0, duration: 0.1, ease: 'power1.out' })
        .fromTo(q('[data-voile]'), { opacity: 0 }, { opacity: 0.4, duration: 0.3 }, 0)
        .fromTo(q('[data-logo]'), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.05)
        .fromTo(q('[data-logo-trait]'), { strokeDashoffset: 1400 }, { strokeDashoffset: 0, duration: 0.85, ease: 'power1.inOut' }, 0.05)
        .fromTo(q('[data-logo-trait]'), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.3 }, 0.6);

      let bamJoue = false;
      let porteSonnee = false;

      const st = ScrollTrigger.create({
        trigger: sec,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduit ? true : 0.5,
        animation: tl,
        onUpdate(self) {
          const p = self.progress;
          const avant = progression.current;
          progression.current = p;
          document.documentElement.dataset.intro = p >= 0.97 ? 'finie' : 'en-cours';
          if (!reduit) {
            if (p >= 0.92 && !bamJoue) {
              bamJoue = true;
              bouffee.current = performance.now();
              bam?.restart();
            } else if (p < 0.9 && bamJoue) {
              bamJoue = false;
              bam?.pause(0);
            }
            if (avant < 0.3 && p >= 0.3 && !porteSonnee && sonActif.current) {
              porteSonnee = true;
              sonnerClochette();
            }
            if (p < 0.25) porteSonnee = false;
          }
          if (p > 0.9) stockage.ecrire('session', introConfig.cleVue, '1');
        },
      });
      // Les mesures peuvent dater d'avant le changement de hauteur (mouvement réduit, format).
      requestAnimationFrame(() => ScrollTrigger.refresh());

      // Déjà vue dans la session : on reprend face au comptoir.
      if (stockage.lire('session', introConfig.cleVue) && window.scrollY < 5 && !window.location.hash) {
        requestAnimationFrame(() => defilerVers(st.start + (st.end - st.start) * introConfig.reprise, { immediat: true }));
      }
    }, sc);

    return () => ctx.revert();
  }, [mode, reduit, format]);

  const vb = format === 'desktop' ? `0 0 ${IMAGE.w} ${IMAGE.h}` : `${IMAGE.w / 2 - LARGEUR_MOBILE / 2} 0 ${LARGEUR_MOBILE} ${IMAGE.h}`;
  const origineInterieur = `${(CIBLES.comptoir.x / IMAGE.w) * 100}% ${(CIBLES.comptoir.y / IMAGE.h) * 100}%`;

  const sign = statut && (
    <p className={styles.vitreTexte} data-ouvert={ouvert}>
      <span className={styles.vitreEtat}>{statut.etat}</span>
      <span className={styles.vitreSuite}>{statut.suite}</span>
    </p>
  );

  return (
    <section
      ref={section}
      id="intro"
      className={styles.intro}
      data-reduit={reduit}
      style={{ '--defilement-d': `${introConfig.defilement.desktop}vh`, '--defilement-m': `${introConfig.defilement.mobile}vh` } as CSSProperties}
      aria-labelledby="titre-accueil"
    >
      {mode === 'frames' ? (
        <>
          <link rel="preload" as="image" href={cheminFrame('desktop', 1)} media={MQ_DESKTOP} fetchPriority="high" />
          <link rel="preload" as="image" href={cheminFrame('mobile', 1)} media={MQ_MOBILE} fetchPriority="high" />
        </>
      ) : (
        <>
          {srcPlaceholder('desktop', 'facade', 'avif') && (
            <>
              <link rel="preload" as="image" type="image/avif" href={srcPlaceholder('desktop', 'facade', 'avif')!} media={MQ_DESKTOP} fetchPriority="high" />
              <link rel="preload" as="image" type="image/avif" href={srcPlaceholder('mobile', 'facade', 'avif')!} media={MQ_MOBILE} fetchPriority="high" />
            </>
          )}
        </>
      )}

      <div ref={scene} className={styles.scene}>
        {mode === 'frames' && !reduit ? (
          <>
            <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
            <div className={styles.vitreCentre} data-vitre>
              {sign}
            </div>
          </>
        ) : (
          <>
            {/* La façade (la caméra avance dedans) */}
            <div className={`${styles.plaque} ${styles.camera}`} data-camera style={varsPorte()}>
              <Photo nom="porte-ouverte" alt="La vitrine d’Au Bon Pain, 36 rue Paul Bousquet à Sète, au petit matin (illustration)" priorite />
              <div className={styles.porte}>
                <Battant cote="g" />
                <Battant cote="d" />
              </div>
              <div className={styles.vitre} data-vitre>
                {sign}
              </div>
            </div>

            {/* La boutique */}
            <div className={styles.plaque} data-interieur style={{ opacity: 0, transformOrigin: origineInterieur }}>
              <Photo nom="interieur" />
              <svg className={styles.annotations} viewBox={vb} preserveAspectRatio="none" aria-hidden="true">
                <g data-annot="1" opacity="0">
                  <text x={format === 'desktop' ? 1010 : 690} y="478" className={styles.annotTexte}>
                    les pains aux raisins géants
                  </text>
                  <path data-trait pathLength={1} d="M1210 492 C 1236 505, 1236 522, 1214 538 M1214 538 l 4 -16 M1214 538 l 15 -6" className={styles.annotTrait} />
                </g>
                <g data-annot="2" opacity="0">
                  <text x="800" y="306" className={styles.annotTexte}>
                    l’ardoise du jour
                  </text>
                  <path data-trait pathLength={1} d="M860 318 C 850 350, 820 368, 782 372 M782 372 l 14 -10 M782 372 l 14 8" className={styles.annotTrait} />
                </g>
              </svg>
            </div>
          </>
        )}

        {/* Le comptoir, en fin de course */}
        <div className={styles.plaque} data-comptoir style={{ opacity: mode === 'frames' && !reduit ? 0 : undefined }}>
          <Photo nom="comptoir" />
        </div>

        <div className={styles.chaleur} data-chaleur aria-hidden="true" />
        <div className={styles.rayon} data-rayon aria-hidden="true" />
        {particules > 0 && (
          <div className={styles.farine} aria-hidden="true">
            <Farine progression={progression} bouffee={bouffee} nombre={particules} />
          </div>
        )}
        <div className={styles.voile} data-voile aria-hidden="true" />
        <div className={styles.flash} data-flash aria-hidden="true" />

        <h1 id="titre-accueil" className={styles.logo} data-logo>
          <svg viewBox="0 0 1100 250" aria-hidden="true">
            <text x="550" y="176" textAnchor="middle" textLength="1020" lengthAdjust="spacingAndGlyphs" className={styles.logoTexte} data-logo-trait>
              Au Bon Pain
            </text>
          </svg>
          <span className="sr-only">Au Bon Pain, boulangerie-pâtisserie de quartier à Sète</span>
        </h1>

        <p className={styles.plaqueRue} data-plaque>
          <span className="num">36</span> rue Paul Bousquet <span aria-hidden="true">—</span> {boutique.adresse.ville}
        </p>
        <p className={styles.invite} data-invite aria-hidden="true">
          Faites défiler pour entrer <span className={styles.fleche}>↓</span>
        </p>

        {!reduit && (
          <button
            type="button"
            className={styles.son}
            aria-pressed={son}
            onClick={() => {
              reveillerAudio();
              setSon((s) => !s);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" />
              {son ? <path d="M16 8.5c1.2 1 1.8 2.2 1.8 3.5s-.6 2.5-1.8 3.5M18.5 6c2 1.6 3 3.6 3 6s-1 4.4-3 6" fill="none" /> : <path d="M16.5 9.5l5 5m0-5l-5 5" fill="none" />}
            </svg>
            <span className="sr-only">{son ? 'Couper la clochette' : 'Activer la clochette de la porte'}</span>
          </button>
        )}

        <button type="button" className={styles.entrer} onClick={() => defilerVers('#comptoir', { immediat: true })}>
          Entrer directement
          <span aria-hidden="true"> →</span>
        </button>
      </div>
    </section>
  );
}
