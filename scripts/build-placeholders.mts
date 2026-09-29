/**
 * Fabrique les 4 images provisoires de l'intro (mode « placeholder ») :
 *   public/intro/placeholder/{desktop,mobile}/{facade,porte-ouverte,interieur,comptoir}.webp (+ .avif)
 * et l'image de fond Open Graph (public/og-facade.jpg).
 *
 * Ce sont des illustrations « papier découpé », d'après la photo de la
 * vitrine : elles seront remplacées par les vraies images (voir l'annexe du
 * brief et DECISIONS.md). Lancement : npm run placeholders
 *
 * Nécessite les polices Gloock et Karla installées localement (fontconfig).
 */

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dessins } from '../components/Illustrations/dessins.ts';
import { PORTE } from '../components/Intro/geometrie.ts';

const W = 1920;
const H = 1080;

const col = {
  stuc: '#c89c80',
  stucOmbre: '#b18670',
  pierre: '#bdb09a',
  pierreJoint: '#a39680',
  menuiserie: '#2d1d14',
  menuiserieClair: '#4a3121',
  fer: '#1b1512',
  rideauMetal: '#8d8b86',
  rose: '#c98f7c',
  trottoir: '#cbbfa8',
  trottoirJoint: '#b1a58e',
  bordure: '#a79a84',
  chaussee: '#58514b',
  or: '#d7b56d',
  orFonce: '#a8843d',
  murChaud: '#e0ae72',
  murChaudFonce: '#b97c45',
  bois: '#6b4527',
  boisFonce: '#4a2e19',
  tomette: '#9c3b22',
  tometteB: '#8a3420',
  creme: '#ecdcc0',
  vitre: '#f7ecd8',
};

/** Pose un dessin produit (viewBox 240×160) à (x, y) — coin haut-gauche — avec une échelle. */
const produit = (nom: keyof typeof dessins, x: number, y: number, s: number, extra = '') =>
  `<g transform="translate(${x} ${y}) scale(${s}) ${extra}">${dessins[nom]}</g>`;

const defsCommuns = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="b"/>
    <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="in" result="gg"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gg"/></feMerge>
  </filter>
  <filter id="flou" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="flouLeger"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="ombreDecoupe" x="-10%" y="-10%" width="120%" height="130%">
    <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#1a0e06" flood-opacity=".35"/>
  </filter>
  <radialGradient id="lueur" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffe2a8" stop-opacity=".95"/>
    <stop offset=".35" stop-color="#ffc877" stop-opacity=".45"/>
    <stop offset="1" stop-color="#ffb35c" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="murInterieur" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#e9bb7d"/>
    <stop offset="1" stop-color="#b8763f"/>
  </linearGradient>
  <linearGradient id="reflet" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".5" stop-color="#fff" stop-opacity=".16"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="solRue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".18"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="lumiereMatin" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffd9a0" stop-opacity=".30"/>
    <stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/>
  </linearGradient>
`;

// ── Lampes en osier (vues dans la vitrine réelle) ─────────────────────────
const lampe = (cx: number, cy: number, r: number, haut = 0) => `
  <line x1="${cx}" y1="${haut}" x2="${cx}" y2="${cy - r}" stroke="#2a1a10" stroke-width="${Math.max(1, r / 18)}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 3}" fill="url(#lueur)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#e9c47f"/>
  ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * (0.15 + i * 0.13)}" fill="none" stroke="#b78842" stroke-width="${r / 22}" opacity=".7"/>`).join('')}
  ${Array.from({ length: 5 }, (_, i) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * (0.2 + i * 0.2)}" ry="${r}" fill="none" stroke="#b78842" stroke-width="${r / 22}" opacity=".6"/>`).join('')}
  <circle cx="${cx}" cy="${cy + r * 0.3}" r="${r * 0.35}" fill="#fff4d6" opacity=".9"/>
`;

// ── Intérieur vu à travers la vitrine ─────────────────────────────────────
function interieurVitrine(x0: number, x1: number, y0: number, y1: number) {
  const etageres = [y0 + (y1 - y0) * 0.36, y0 + (y1 - y0) * 0.6];
  const pains: string[] = [];
  for (const [k, ey] of etageres.entries()) {
    for (let x = x0 + 10; x < x1 - 90; x += 110) {
      const nom = (['baguette', 'campagne', 'croissant', 'painRaisins', 'campagne', 'painChocolat'] as const)[(Math.round(x / 110) + k) % 6];
      pains.push(produit(nom, x, ey - 62, 0.42));
    }
  }
  return `
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#murInterieur)"/>
    ${etageres.map((ey) => `<rect x="${x0}" y="${ey}" width="${x1 - x0}" height="12" fill="${col.bois}"/><rect x="${x0}" y="${ey + 12}" width="${x1 - x0}" height="6" fill="${col.boisFonce}" opacity=".6"/>`).join('')}
    ${pains.join('')}
    <rect x="${x0}" y="${y1 - 150}" width="${x1 - x0}" height="150" fill="${col.boisFonce}"/>
    <rect x="${x0}" y="${y1 - 150}" width="${x1 - x0}" height="70" fill="#f3dfb6" opacity=".85"/>
    ${Array.from({ length: Math.floor((x1 - x0) / 90) }, (_, i) => produit((['croissant', 'tarte', 'sables', 'painChocolat'] as const)[i % 4], x0 + 10 + i * 90, y1 - 170, 0.36)).join('')}
    <rect x="${x0}" y="${y1 - 80}" width="${x1 - x0}" height="4" fill="${col.boisFonce}"/>
  `;
}

// ── Autocollants dorés sur la vitre (comme sur la photo) ──────────────────
const ruban = (cx: number, cy: number, texte: string, rot = -8) => `
  <g transform="rotate(${rot} ${cx} ${cy})" filter="url(#ombreDecoupe)">
    <path d="M${cx - 70} ${cy - 16}h140l-12 16 12 16h-140l12-16z" fill="${col.or}"/>
    <path d="M${cx - 70} ${cy - 16}h140l-12 16 12 16h-140l12-16z" fill="none" stroke="${col.orFonce}" stroke-width="2"/>
    <path d="M${cx - 34} ${cy - 16}c6-26 62-26 68 0" fill="none" stroke="${col.or}" stroke-width="5"/>
    <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Karla" font-weight="700" font-size="17" letter-spacing="1.5" fill="${col.menuiserie}">${texte}</text>
  </g>`;

// ── La façade ─────────────────────────────────────────────────────────────
function facade(porteOuverte: boolean) {
  const { x, y, w, h } = PORTE; // la porte vitrée double, au centre
  const cadre = { x0: 440, x1: 1560, y0: 400, y1: 930 };
  const vitreG = { x0: 470, x1: x - 20, y0: 430, y1: 910 };
  const vitreD = { x0: x + w + 20, x1: 1530, y0: 430, y1: 910 };

  const battant = (bx: number, sens: 1 | -1) => `
    <rect x="${bx}" y="${y}" width="${w / 2}" height="${h}" fill="${col.menuiserie}"/>
    <rect x="${bx + 14}" y="${y + 14}" width="${w / 2 - 28}" height="${h - 90}" fill="#000" opacity=".0"/>
    <rect x="${bx + 14}" y="${y + h - 70}" width="${w / 2 - 28}" height="56" fill="${col.menuiserieClair}"/>
    <rect x="${sens === 1 ? bx + w / 2 - 26 : bx + 18}" y="${y + h * 0.42}" width="8" height="120" rx="4" fill="${col.or}"/>
  `;

  const porte = porteOuverte
    ? `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e2aa6c"/>
      <polygon points="${x},${y + h} ${x + w},${y + h} ${x + w * 0.78},${y + h * 0.72} ${x + w * 0.22},${y + h * 0.72}" fill="${col.tomette}"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const t = i / 6;
        const yy = y + h * 0.72 + (h * 0.28) * t * t;
        return `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${col.tometteB}" stroke-width="2"/>`;
      }).join('')}
      <rect x="${x + w * 0.22}" y="${y + h * 0.1}" width="${w * 0.56}" height="${h * 0.62}" fill="#eec48a"/>
      <rect x="${x + w * 0.22}" y="${y + h * 0.52}" width="${w * 0.56}" height="${h * 0.2}" fill="${col.boisFonce}"/>
      <rect x="${x + w * 0.22}" y="${y + h * 0.52}" width="${w * 0.56}" height="${h * 0.08}" fill="#f6e3bb"/>
      ${lampe(x + w / 2, y + h * 0.2, 16, y + h * 0.1)}
      <polygon points="${x},${y} ${x + w * 0.22},${y + h * 0.1} ${x + w * 0.22},${y + h * 0.72} ${x},${y + h}" fill="#c98a4f"/>
      <polygon points="${x + w},${y} ${x + w * 0.78},${y + h * 0.1} ${x + w * 0.78},${y + h * 0.72} ${x + w},${y + h}" fill="#c98a4f"/>
    </g>`
    : `
    <g>
      ${interieurVitrine(x, x + w, y, y + h)}
      ${battant(x, 1)}
      ${battant(x + w / 2, -1)}
      <rect x="${x + 14}" y="${y + 14}" width="${w / 2 - 28}" height="${h - 90}" fill="url(#reflet)"/>
      <rect x="${x + w / 2 + 14}" y="${y + 14}" width="${w / 2 - 28}" height="${h - 90}" fill="url(#reflet)"/>
      <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#120b07" stroke-width="3"/>
    </g>`;

  // Découpe des vitres des battants : on remet l'intérieur visible à travers le verre.
  const verreBattants = porteOuverte
    ? ''
    : `
    <clipPath id="verrePorte">
      <rect x="${x + 14}" y="${y + 14}" width="${w / 2 - 28}" height="${h - 90}"/>
      <rect x="${x + w / 2 + 14}" y="${y + 14}" width="${w / 2 - 28}" height="${h - 90}"/>
    </clipPath>`;

  const pierres = `<rect x="0" y="400" width="440" height="552" fill="${col.pierre}"/>` + Array.from({ length: 14 }, (_, r) =>
    Array.from({ length: 4 }, (_, k) => {
      const px = (r % 2 ? -60 : 0) + k * 120;
      return `<rect x="${px}" y="${400 + r * 38}" width="118" height="36" fill="${col.pierre}" stroke="${col.pierreJoint}" stroke-width="2"/>`;
    }).join(''),
  ).join('');

  const balcon = (bx: number, bw: number) => `
    <rect x="${bx - 20}" y="232" width="${bw + 40}" height="14" fill="#8e7563"/>
    <rect x="${bx + 20}" y="40" width="${bw - 40}" height="192" fill="#3b2c24"/>
    <rect x="${bx + 30}" y="50" width="${(bw - 60) / 2 - 4}" height="182" fill="#5d4638"/>
    <rect x="${bx + 30 + (bw - 60) / 2 + 4}" y="50" width="${(bw - 60) / 2 - 4}" height="182" fill="#5d4638"/>
    <rect x="${bx - 20}" y="150" width="${bw + 40}" height="6" fill="${col.fer}"/>
    <rect x="${bx - 20}" y="226" width="${bw + 40}" height="6" fill="${col.fer}"/>
    ${Array.from({ length: Math.floor((bw + 40) / 16) }, (_, i) => `<rect x="${bx - 18 + i * 16}" y="156" width="3" height="70" fill="${col.fer}"/>`).join('')}
    ${Array.from({ length: Math.floor((bw + 40) / 48) }, (_, i) => `<circle cx="${bx - 4 + i * 48}" cy="190" r="12" fill="none" stroke="${col.fer}" stroke-width="3"/>`).join('')}
    <ellipse cx="${bx + 40}" cy="150" rx="30" ry="14" fill="#56663f"/>
    <ellipse cx="${bx + bw - 50}" cy="148" rx="26" ry="12" fill="#4b5a37"/>
    <circle cx="${bx + bw - 60}" cy="142" r="4" fill="#b9564a"/>
  `;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${defsCommuns}${verreBattants}
      <clipPath id="vitreG"><rect x="${vitreG.x0}" y="${vitreG.y0}" width="${vitreG.x1 - vitreG.x0}" height="${vitreG.y1 - vitreG.y0}"/></clipPath>
      <clipPath id="vitreD"><rect x="${vitreD.x0}" y="${vitreD.y0}" width="${vitreD.x1 - vitreD.x0}" height="${vitreD.y1 - vitreD.y0}"/></clipPath>
    </defs>

    <!-- Étage : enduit, balcons -->
    <rect width="${W}" height="400" fill="${col.stuc}"/>
    <rect y="0" width="${W}" height="30" fill="${col.stucOmbre}"/>
    ${balcon(560, 380)}
    ${balcon(1080, 400)}
    <rect x="0" y="300" width="${W}" height="10" fill="${col.stucOmbre}"/>

    <!-- Gauche : rideau métallique, pierre, porte d'immeuble n°36 -->
    <g>${pierres}</g>
    <rect x="0" y="420" width="190" height="510" fill="${col.rideauMetal}"/>
    ${Array.from({ length: 34 }, (_, i) => `<rect x="0" y="${420 + i * 15}" width="190" height="2" fill="#6f6d69"/>`).join('')}
    <rect x="250" y="440" width="150" height="490" fill="#4a2d1e"/>
    <rect x="266" y="460" width="118" height="200" fill="#3e2518"/>
    <rect x="266" y="680" width="118" height="230" fill="#3e2518"/>
    <rect x="360" y="690" width="12" height="40" rx="3" fill="${col.or}"/>
    <rect x="290" y="408" width="70" height="26" fill="#2a4a6a"/>
    <text x="325" y="428" text-anchor="middle" font-family="Karla" font-weight="700" font-size="20" fill="#f1ead8">36</text>
    <rect x="218" y="700" width="28" height="60" rx="3" fill="#e8dcc6"/>

    <!-- Devanture -->
    <rect x="${cadre.x0 - 10}" y="300" width="${cadre.x1 - cadre.x0 + 20}" height="100" fill="${col.menuiserie}"/>
    <rect x="${cadre.x0 - 10}" y="300" width="${cadre.x1 - cadre.x0 + 20}" height="8" fill="${col.menuiserieClair}"/>
    <text x="960" y="374" text-anchor="middle" font-family="Gloock" font-size="62" letter-spacing="6" fill="${col.or}">AU BON PAIN</text>
    <text x="620" y="366" text-anchor="middle" font-family="Karla" font-weight="700" font-size="16" letter-spacing="4" fill="${col.or}" opacity=".85">BOULANGERIE</text>
    <text x="1300" y="366" text-anchor="middle" font-family="Karla" font-weight="700" font-size="16" letter-spacing="4" fill="${col.or}" opacity=".85">PÂTISSERIE</text>
    <rect x="${cadre.x0}" y="${cadre.y0}" width="${cadre.x1 - cadre.x0}" height="${cadre.y1 - cadre.y0}" fill="${col.menuiserie}"/>

    <g clip-path="url(#vitreG)">${interieurVitrine(vitreG.x0, vitreG.x1, vitreG.y0, vitreG.y1)}${lampe(640, 500, 34)}${lampe(790, 470, 22)}</g>
    <g clip-path="url(#vitreD)">${interieurVitrine(vitreD.x0, vitreD.x1, vitreD.y0, vitreD.y1)}${lampe(1180, 490, 40)}${lampe(1380, 470, 26)}</g>

    <!-- Reflets sur le verre -->
    <polygon points="${vitreG.x0 + 40},${vitreG.y0} ${vitreG.x0 + 160},${vitreG.y0} ${vitreG.x0 + 20},${vitreG.y1} ${vitreG.x0 - 100},${vitreG.y1}" fill="#fff" opacity=".07" clip-path="url(#vitreG)"/>
    <polygon points="${vitreD.x0 + 180},${vitreD.y0} ${vitreD.x0 + 260},${vitreD.y0} ${vitreD.x0 + 120},${vitreD.y1} ${vitreD.x0 + 40},${vitreD.y1}" fill="#fff" opacity=".06" clip-path="url(#vitreD)"/>
    <rect x="${vitreG.x0}" y="${vitreG.y1 - 120}" width="${vitreG.x1 - vitreG.x0}" height="120" fill="#1c140e" opacity=".25"/>
    <rect x="${vitreD.x0}" y="${vitreD.y1 - 120}" width="${vitreD.x1 - vitreD.x0}" height="120" fill="#1c140e" opacity=".25"/>

    ${ruban(600, 560, 'CROISSANTS', -9)}
    ${ruban(700, 700, 'VIENNOISERIES', 7)}
    ${ruban(1240, 600, 'PIZZA', -6)}
    ${ruban(1390, 740, 'PÂTISSERIE', 8)}
    ${ruban(1150, 820, 'SANDWICHS', -4)}

    <!-- Porte vitrée double -->
    ${porte}
    ${porteOuverte ? '' : `<g clip-path="url(#verrePorte)">${interieurVitrine(x, x + w, y, y + h)}${lampe(x + w / 2, y + 90, 26)}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#reflet)" opacity=".6"/>`}
    <rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="6" fill="#120b07"/>
    <text x="${x + w / 2}" y="${y - 14}" text-anchor="middle" font-family="Karla" font-weight="700" font-size="15" letter-spacing="3" fill="${col.or}">N° 36</text>

    <!-- Soubassement, droite rose avec descente d'eau -->
    <rect x="${cadre.x0 - 10}" y="${cadre.y1}" width="${cadre.x1 - cadre.x0 + 20}" height="22" fill="${col.pierre}"/>
    <rect x="1560" y="300" width="360" height="652" fill="${col.rose}"/>
    <rect x="1560" y="300" width="18" height="652" fill="#b87d6b"/>
    <rect x="1830" y="0" width="26" height="952" fill="#a79d93"/>
    <rect x="1826" y="560" width="34" height="14" fill="#8f857c"/>
    <rect x="1826" y="200" width="34" height="14" fill="#8f857c"/>
    <rect x="1640" y="520" width="70" height="86" fill="#e7e2da"/>
    <rect x="1646" y="526" width="58" height="24" fill="#b23b2e"/>

    <!-- Trottoir -->
    <rect x="0" y="952" width="${W}" height="128" fill="${col.trottoir}"/>
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 180 - 40}" y1="952" x2="${i * 180 - 140}" y2="1060" stroke="${col.trottoirJoint}" stroke-width="2"/>`).join('')}
    <line x1="0" y1="1002" x2="${W}" y2="1002" stroke="${col.trottoirJoint}" stroke-width="2"/>
    <rect x="0" y="1052" width="${W}" height="10" fill="${col.bordure}"/>
    <rect x="0" y="1062" width="${W}" height="18" fill="${col.chaussee}"/>
    <rect x="0" y="952" width="${W}" height="60" fill="url(#solRue)"/>
    <!-- Potelet -->
    <rect x="140" y="930" width="16" height="110" rx="6" fill="#4b4640"/>
    <ellipse cx="148" cy="1042" rx="14" ry="4" fill="#000" opacity=".25"/>
    <polygon points="156,1040 320,1060 320,1068 150,1046" fill="#000" opacity=".12"/>

    <!-- Lumière du petit matin, en biais depuis la gauche -->
    <polygon points="0,0 780,0 1500,1080 0,1080" fill="url(#lumiereMatin)"/>
    <rect width="${W}" height="${H}" fill="#3a2410" opacity=".06"/>
  </svg>`;
}

// ── L'intérieur, depuis le seuil ──────────────────────────────────────────
function interieur() {
  const vp = { x: 960, y: 500 };
  const fond = { x0: 560, x1: 1360, y0: 280, y1: 760 };
  const rangsSol = Array.from({ length: 14 }, (_, i) => {
    const t = (i + 1) / 14;
    const yy = fond.y1 + (H - fond.y1) * t * t;
    return `<line x1="0" y1="${yy}" x2="${W}" y2="${yy}" stroke="${col.tometteB}" stroke-width="${1 + t * 3}"/>`;
  }).join('');
  const fuyantesSol = Array.from({ length: 17 }, (_, i) => {
    const bx = -600 + i * 195;
    const fx = fond.x0 + ((fond.x1 - fond.x0) * i) / 16;
    return `<line x1="${fx}" y1="${fond.y1}" x2="${bx}" y2="${H}" stroke="${col.tometteB}" stroke-width="2"/>`;
  }).join('');

  // Étagères des murs latéraux en perspective
  const etagereG = (yf: number, yb: number) => `<polygon points="0,${yb} ${fond.x0},${yf} ${fond.x0},${yf + 8} 0,${yb + 26}" fill="${col.bois}"/>`;
  const etagereD = (yf: number, yb: number) => `<polygon points="${W},${yb} ${fond.x1},${yf} ${fond.x1},${yf + 8} ${W},${yb + 26}" fill="${col.bois}"/>`;

  // Corbeille en osier pleine de baguettes debout, posée au sol
  const corbeille = (x: number, yb: number, s: number) => `
    <g transform="translate(${x} ${yb}) scale(${s})">
      <ellipse cx="105" cy="0" rx="120" ry="14" fill="#000" opacity=".22"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${10 + i * 22}" y="${-330 + (i % 3) * 16}" width="20" height="240" rx="10" fill="${i % 2 ? '#c07f3c' : '#a8662e'}" transform="rotate(${(i - 4) * 3} ${10 + i * 22} -90)"/>`).join('')}
      <path d="M-10 -150h230l-24 150h-182z" fill="#8a5a2b"/>
      ${Array.from({ length: 8 }, (_, k) => `<line x1="${-8 + k * 1.6}" y1="${-140 + k * 18}" x2="${218 - k * 1.6}" y2="${-140 + k * 18}" stroke="#6b4527" stroke-width="4"/>`).join('')}
    </g>`;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${defsCommuns}</defs>
    <!-- plafond -->
    <polygon points="0,0 ${W},0 ${fond.x1},${fond.y0} ${fond.x0},${fond.y0}" fill="#3b2a1f"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 240}" y1="0" x2="${fond.x0 + i * 100}" y2="${fond.y0}" stroke="#2c1f16" stroke-width="10"/>`).join('')}
    <!-- murs -->
    <polygon points="0,0 ${fond.x0},${fond.y0} ${fond.x0},${fond.y1} 0,${H}" fill="${col.creme}"/>
    <polygon points="${W},0 ${fond.x1},${fond.y0} ${fond.x1},${fond.y1} ${W},${H}" fill="#e3cfae"/>
    <polygon points="0,0 ${fond.x0},${fond.y0} ${fond.x0},${fond.y1} 0,${H}" fill="#6b3f1f" opacity=".12"/>
    <!-- sol en tomettes -->
    <clipPath id="sol"><polygon points="0,${H} ${W},${H} ${fond.x1},${fond.y1} ${fond.x0},${fond.y1}"/></clipPath>
    <polygon points="0,${H} ${W},${H} ${fond.x1},${fond.y1} ${fond.x0},${fond.y1}" fill="${col.tomette}"/>
    <g clip-path="url(#sol)">${rangsSol}${fuyantesSol}</g>
    <!-- fond : mur chaud, étagères de pains, ardoise -->
    <rect x="${fond.x0}" y="${fond.y0}" width="${fond.x1 - fond.x0}" height="${fond.y1 - fond.y0}" fill="url(#murInterieur)"/>
    <rect x="${fond.x0 + 40}" y="${fond.y0 + 40}" width="170" height="120" fill="#262b27" stroke="${col.bois}" stroke-width="10"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M${fond.x0 + 62} ${fond.y0 + 72 + i * 24}q30 -8 60 0t60 0" stroke="#e9e4da" stroke-width="3" fill="none" opacity=".8"/>`).join('')}
    ${[0, 1].map((k) => `<rect x="${fond.x0 + 250}" y="${fond.y0 + 90 + k * 110}" width="${fond.x1 - fond.x0 - 290}" height="10" fill="${col.bois}"/>`).join('')}
    ${Array.from({ length: 5 }, (_, i) => produit((['campagne', 'baguette', 'mie', 'campagne', 'baguette'] as const)[i], fond.x0 + 250 + i * 98, fond.y0 + 42, 0.4)).join('')}
    ${Array.from({ length: 5 }, (_, i) => produit((['baguette', 'campagne', 'baguette', 'mie', 'campagne'] as const)[i], fond.x0 + 250 + i * 98, fond.y0 + 152, 0.4)).join('')}
    <!-- comptoir au fond -->
    <rect x="${fond.x0 + 60}" y="${fond.y1 - 170}" width="${fond.x1 - fond.x0 - 120}" height="170" fill="${col.boisFonce}"/>
    <rect x="${fond.x0 + 60}" y="${fond.y1 - 170}" width="${fond.x1 - fond.x0 - 120}" height="70" fill="#f6e5c0" opacity=".9"/>
    ${Array.from({ length: 6 }, (_, i) => produit((['croissant', 'painChocolat', 'tarte', 'sables', 'chausson', 'gaufre'] as const)[i], fond.x0 + 80 + i * 105, fond.y1 - 196, 0.4)).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${fond.x0 + 80 + i * 72}" y="${fond.y1 - 96}" width="4" height="90" fill="#3a2414"/>`).join('')}
    <!-- corbeille de pains aux raisins géants, bout du comptoir -->
    <ellipse cx="${fond.x1 - 140}" cy="${fond.y1 - 172}" rx="80" ry="16" fill="#8a5a2b"/>
    ${produit('painRaisins', fond.x1 - 230, fond.y1 - 240, 0.5)}
    ${produit('painRaisins', fond.x1 - 180, fond.y1 - 256, 0.45)}
    <!-- murs latéraux : étagères et pains -->
    ${etagereG(fond.y0 + 120, 260)}${etagereG(fond.y0 + 280, 600)}
    ${etagereD(fond.y0 + 120, 260)}${etagereD(fond.y0 + 280, 600)}
    ${corbeille(70, 1000, 1.25)}
    ${corbeille(1640, 1000, 1.1)}
    ${produit('campagne', 1690, 128, 0.95)}${produit('mie', 1470, 250, 0.6)}
    ${produit('campagne', 40, 150, 1.0)}${produit('baguette', 250, 250, 0.8)}
    <!-- lampes en osier -->
    ${lampe(760, 210, 38)}${lampe(1160, 230, 42)}${lampe(960, 150, 56)}
    <rect width="${W}" height="${H}" fill="#ffb760" opacity=".06"/>
    <!-- vignettage doux -->
    <rect width="${W}" height="${H}" fill="none" stroke="#1a0f08" stroke-width="160" opacity=".25" filter="url(#flou)"/>
  </svg>`;
}

// ── Le comptoir, de face ──────────────────────────────────────────────────
function comptoir() {
  const vitrine = { x0: 300, x1: 1620, y0: 560, y1: 880 };
  const rang = (y: number, noms: (keyof typeof dessins)[], s: number) =>
    noms.map((n, i) => produit(n, vitrine.x0 + 40 + i * ((vitrine.x1 - vitrine.x0 - 80) / noms.length), y, s)).join('');
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${defsCommuns}
      <linearGradient id="verreVitrine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff8ea" stop-opacity=".35"/>
        <stop offset="1" stop-color="#fff8ea" stop-opacity=".05"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#murInterieur)"/>
    <!-- étagères du fond, pleines -->
    ${[150, 330].map((y) => `<rect x="0" y="${y}" width="${W}" height="16" fill="${col.bois}"/><rect x="0" y="${y + 16}" width="${W}" height="10" fill="${col.boisFonce}" opacity=".5"/>`).join('')}
    ${Array.from({ length: 11 }, (_, i) => produit((['baguette', 'campagne', 'baguette', 'mie', 'campagne', 'baguette'] as const)[i % 6], -40 + i * 180, 38, 0.72)).join('')}
    ${Array.from({ length: 11 }, (_, i) => produit((['campagne', 'painRaisins', 'campagne', 'baguette', 'mie', 'campagne'] as const)[i % 6], -60 + i * 180, 216, 0.72)).join('')}
    <!-- corbeilles de baguettes debout -->
    ${[120, 1640].map((x) => `${Array.from({ length: 9 }, (_, i) => `<rect x="${x + i * 20}" y="${380 - (i % 3) * 14}" width="18" height="200" rx="9" fill="${i % 2 ? '#c07f3c' : '#a8662e'}" transform="rotate(${(i - 4) * 3} ${x + i * 20} 580)"/>`).join('')}<path d="M${x - 20} 500h210l-20 90h-170z" fill="#8a5a2b"/>${Array.from({ length: 6 }, (_, k) => `<line x1="${x - 16}" y1="${510 + k * 14}" x2="${x + 186}" y2="${510 + k * 14}" stroke="#6b4527" stroke-width="3"/>`).join('')}`).join('')}
    ${lampe(560, 90, 44)}${lampe(960, 60, 60)}${lampe(1360, 90, 44)}
    <!-- vitrine réfrigérée -->
    <rect x="${vitrine.x0 - 20}" y="${vitrine.y0 - 20}" width="${vitrine.x1 - vitrine.x0 + 40}" height="${vitrine.y1 - vitrine.y0 + 40}" rx="10" fill="#2a1a10"/>
    <rect x="${vitrine.x0}" y="${vitrine.y0}" width="${vitrine.x1 - vitrine.x0}" height="${vitrine.y1 - vitrine.y0}" fill="#f4e4c4"/>
    <rect x="${vitrine.x0}" y="${vitrine.y0}" width="${vitrine.x1 - vitrine.x0}" height="10" fill="#fff6e0"/>
    <rect x="${vitrine.x0}" y="${vitrine.y0 + 150}" width="${vitrine.x1 - vitrine.x0}" height="8" fill="#c9b79a"/>
    ${rang(vitrine.y0 + 20, ['croissant', 'painChocolat', 'painRaisins', 'chausson', 'croissant', 'painChocolat'], 0.62)}
    ${rang(vitrine.y0 + 170, ['tarte', 'sables', 'gaufre', 'pizza', 'tarte', 'sandwich'], 0.62)}
    <rect x="${vitrine.x0}" y="${vitrine.y0}" width="${vitrine.x1 - vitrine.x0}" height="${vitrine.y1 - vitrine.y0}" fill="url(#verreVitrine)"/>
    <polygon points="${vitrine.x0 + 200},${vitrine.y0} ${vitrine.x0 + 320},${vitrine.y0} ${vitrine.x0 + 160},${vitrine.y1} ${vitrine.x0 + 40},${vitrine.y1}" fill="#fff" opacity=".09"/>
    <polygon points="${vitrine.x1 - 420},${vitrine.y0} ${vitrine.x1 - 360},${vitrine.y0} ${vitrine.x1 - 520},${vitrine.y1} ${vitrine.x1 - 580},${vitrine.y1}" fill="#fff" opacity=".07"/>
    <!-- caisse, discrète -->
    <rect x="1660" y="470" width="190" height="110" rx="8" fill="#3a2d25"/>
    <rect x="1676" y="486" width="110" height="46" rx="3" fill="#8fa38a" opacity=".7"/>
    <rect x="1700" y="580" width="130" height="30" fill="#2a1f19"/>
    <!-- meuble comptoir -->
    <rect x="0" y="${vitrine.y1 + 20}" width="${W}" height="${H - vitrine.y1 - 20}" fill="${col.boisFonce}"/>
    <rect x="0" y="${vitrine.y1 + 20}" width="${W}" height="18" fill="${col.bois}"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 124}" y="${vitrine.y1 + 38}" width="3" height="${H}" fill="#35200f"/>`).join('')}
    <rect width="${W}" height="${H}" fill="#ffb760" opacity=".05"/>
    <rect width="${W}" height="${H}" fill="none" stroke="#1a0f08" stroke-width="180" opacity=".22" filter="url(#flou)"/>
  </svg>`;
}

// ── Rendu ─────────────────────────────────────────────────────────────────
const sortie = new URL('../public/intro/placeholder/', import.meta.url).pathname;
mkdirSync(sortie + 'desktop', { recursive: true });
mkdirSync(sortie + 'mobile', { recursive: true });

const scenes: Record<string, string> = {
  facade: facade(false),
  'porte-ouverte': facade(true),
  interieur: interieur(),
  comptoir: comptoir(),
};

// Mobile : recadrage vertical 9:16 centré sur la porte (x = 960).
const MW = Math.round((H * 9) / 16);
for (const [nom, svg] of Object.entries(scenes)) {
  const png = await sharp(Buffer.from(svg), { density: 72 }).png().toBuffer();
  await sharp(png).webp({ quality: 80 }).toFile(`${sortie}desktop/${nom}.webp`);
  await sharp(png).avif({ quality: 55 }).toFile(`${sortie}desktop/${nom}.avif`);
  const mobile = sharp(png).extract({ left: 960 - Math.round(MW / 2), top: 0, width: MW, height: H }).resize(900, 1600);
  await mobile.clone().webp({ quality: 76 }).toFile(`${sortie}mobile/${nom}.webp`);
  await mobile.clone().avif({ quality: 50 }).toFile(`${sortie}mobile/${nom}.avif`);
  if (nom === 'facade') await sharp(png).resize(1200, 675).jpeg({ quality: 82 }).toFile(new URL('../public/og-facade.jpg', import.meta.url).pathname);
  console.log('✓', nom);
}
