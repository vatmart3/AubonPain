/**
 * Dessins des produits, en attendant les vraies photos détourées.
 * Style « papier découpé » : aplats superposés, quelques traits d'encre.
 * viewBox commun 0 0 240 160, le produit repose sur y ≈ 150.
 *
 * Ce fichier ne contient que des chaînes SVG (pas de JSX) pour pouvoir être
 * réutilisé par le script qui fabrique les images de l'intro.
 */

export const couleurs = {
  crouteFonce: '#7a4520',
  croute: '#a8662e',
  crouteMoy: '#c07f3c',
  doree: '#d69a52',
  blonde: '#e6b872',
  lueur: '#f0d09a',
  mie: '#f3e2bf',
  encre: '#2a1a10',
  choco: '#3b2116',
  raisin: '#4b2a2c',
  tomate: '#b4432a',
  fromage: '#edc768',
  olive: '#2f2c1c',
  salade: '#6d8a3a',
  jambon: '#dd9e8e',
  abricot: '#e39a3c',
  sucre: '#fbf6ec',
} as const;

const c = couleurs;

export const dessins = {
  baguette: `
    <g transform="rotate(-6 120 95)">
      <path d="M14 98c0-16 16-26 44-27l128-4c26-1 42 9 42 23s-14 24-40 25l-132 5c-27 1-42-8-42-22z" fill="${c.croute}"/>
      <path d="M16 104c6 9 20 13 40 12l132-5c20-1 34-7 39-17 1 12-14 22-40 23l-132 5c-24 1-38-6-39-18z" fill="${c.crouteFonce}"/>
      <path d="M22 92c2-11 16-17 38-18l124-4c20-1 34 5 38 14-10-5-22-6-38-6L64 82c-20 1-32 4-42 10z" fill="${c.doree}" opacity=".7"/>
      ${[40, 76, 112, 148, 184]
        .map(
          (x, i) => `
      <g transform="translate(${x} ${88 - i * 1.2}) rotate(-14)">
        <path d="M0 0c6-8 22-10 32-6-6 8-22 11-32 6z" fill="${c.lueur}"/>
        <path d="M0 0c10 3 24 1 32-6" stroke="${c.crouteFonce}" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>`,
        )
        .join('')}
    </g>`,

  campagne: `
    <path d="M30 136c0-52 40-82 90-82s90 30 90 82c0 10-40 16-90 16s-90-6-90-16z" fill="${c.croute}"/>
    <path d="M30 136c0 10 40 16 90 16s90-6 90-16c-6 4-40 9-90 9s-84-5-90-9z" fill="${c.crouteFonce}"/>
    <path d="M52 110c8-30 36-46 68-46 30 0 54 14 64 34-18-14-40-20-64-20-28 0-52 12-68 32z" fill="${c.doree}" opacity=".75"/>
    <path d="M62 116c20-34 62-52 118-40" stroke="${c.lueur}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M64 122c22-32 62-48 116-38" stroke="${c.crouteFonce}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
    ${[
      [60, 84], [88, 66], [132, 62], [170, 78], [186, 104], [100, 100], [140, 96], [120, 130], [66, 124], [168, 128],
      [80, 108], [154, 110], [112, 80], [50, 110], [194, 120],
    ]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1.2 + (i % 3) * 0.8}" fill="${c.sucre}" opacity=".75"/>`)
      .join('')}`,

  mie: `
    <path d="M52 150V92c0-24 16-36 36-36h64c20 0 36 12 36 36v58z" fill="${c.blonde}"/>
    <path d="M52 92c0-24 16-36 36-36h64c20 0 36 12 36 36-10-12-24-14-40-14H94c-18 0-32 2-42 14z" fill="${c.croute}"/>
    <path d="M60 80c6-12 18-16 30-16h60c12 0 22 4 28 12-8-4-18-5-28-5H90c-12 0-22 2-30 9z" fill="${c.doree}"/>
    <path d="M52 150h136v-8H52z" fill="${c.crouteMoy}"/>
    <path d="M52 100v50" stroke="${c.crouteMoy}" stroke-width="4"/>
    <path d="M188 100v50" stroke="${c.crouteMoy}" stroke-width="4"/>
    <path d="M86 58c0 24 0 60-2 90M154 58c0 24 0 60 2 90" stroke="${c.crouteMoy}" stroke-width="1.5" opacity=".5" fill="none"/>`,

  croissant: `
    <path d="M18 128c4-20 20-34 38-38l-6 42c-12 4-24 2-32-4z" fill="${c.croute}"/>
    <path d="M222 128c-4-20-20-34-38-38l6 42c12 4 24 2 32-4z" fill="${c.croute}"/>
    <path d="M46 138c-4-26 8-50 30-60l14 64c-16 4-32 2-44-4z" fill="${c.crouteMoy}"/>
    <path d="M194 138c4-26-8-50-30-60l-14 64c16 4 32 2 44-4z" fill="${c.crouteMoy}"/>
    <path d="M76 146c-8-40 10-80 44-86 34 6 52 46 44 86-14 6-30 8-44 8s-30-2-44-8z" fill="${c.doree}"/>
    <path d="M86 128c0-30 14-54 34-58 20 4 34 28 34 58" stroke="${c.lueur}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M90 100c10-6 50-6 60 0M84 120c12-6 60-6 72 0M80 138c14-5 66-5 80 0" stroke="${c.croute}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M58 110c4-8 10-14 16-18M182 110c-4-8-10-14-16-18M30 118c4-6 10-10 16-14M210 118c-4-6-10-10-16-14" stroke="${c.lueur}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M76 146c14 6 30 8 44 8s30-2 44-8" stroke="${c.crouteFonce}" stroke-width="3" fill="none"/>`,

  painChocolat: `
    <path d="M36 148c-6-30 2-58 22-64l124-2c20 6 28 34 22 66z" fill="${c.croute}"/>
    <path d="M44 110c0-18 8-28 20-30h112c12 2 20 12 20 30z" fill="${c.doree}"/>
    <path d="M52 100c2-10 8-14 16-14h104c8 0 14 4 16 14" stroke="${c.lueur}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M40 124h160M38 138h164" stroke="${c.crouteMoy}" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="30" y="112" width="14" height="10" rx="2" fill="${c.choco}"/>
    <rect x="196" y="112" width="14" height="10" rx="2" fill="${c.choco}"/>
    <rect x="31" y="128" width="12" height="9" rx="2" fill="${c.choco}"/>
    <rect x="197" y="128" width="12" height="9" rx="2" fill="${c.choco}"/>
    <path d="M36 148h168" stroke="${c.crouteFonce}" stroke-width="3" stroke-linecap="round"/>`,

  painRaisins: `
    <ellipse cx="120" cy="120" rx="96" ry="34" fill="${c.croute}"/>
    <ellipse cx="120" cy="110" rx="96" ry="34" fill="${c.doree}"/>
    <path d="M120 110c10 0 16-6 12-12s-18-8-26-2-8 20 6 26 36 2 44-10 2-32-20-38-54 0-64 18 0 42 30 48 70 0 82-20" stroke="${c.croute}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M120 110c10 0 16-6 12-12s-18-8-26-2-8 20 6 26 36 2 44-10 2-32-20-38-54 0-64 18 0 42 30 48 70 0 82-20" stroke="${c.lueur}" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(-2 -3)" opacity=".8"/>
    ${[
      [98, 96], [140, 104], [124, 124], [80, 116], [160, 96], [104, 132], [150, 124], [70, 100], [176, 112], [120, 86], [92, 110], [136, 90],
    ]
      .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3" transform="rotate(${i * 37} ${x} ${y})" fill="${c.raisin}"/>`)
      .join('')}
    <path d="M24 114c0 20 42 36 96 36s96-16 96-36" stroke="${c.crouteFonce}" stroke-width="3" fill="none"/>`,

  chausson: `
    <path d="M24 146c0-50 40-86 96-86s96 36 96 86z" fill="${c.croute}"/>
    <path d="M34 140c2-44 38-72 86-72s84 28 86 72z" fill="${c.doree}"/>
    ${[-50, -25, 0, 25, 50]
      .map((a) => `<path d="M120 142c-4-20-4-44 0-66" transform="rotate(${a} 120 146)" stroke="${c.croute}" stroke-width="3" fill="none" stroke-linecap="round"/>`)
      .join('')}
    <path d="M60 98c14-16 34-24 60-24" stroke="${c.lueur}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M24 146h192" stroke="${c.crouteFonce}" stroke-width="4" stroke-linecap="round"/>`,

  sables: `
    ${[
      [70, 132, -4],
      [168, 134, 5],
      [118, 116, -2],
    ]
      .map(
        ([x, y, r]) => `
      <g transform="rotate(${r} ${x} ${y})">
        <ellipse cx="${x}" cy="${y + 6}" rx="44" ry="14" fill="${c.crouteMoy}"/>
        <path d="${Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return `${i ? 'L' : 'M'}${(x + Math.cos(a) * 44).toFixed(1)} ${(y + Math.sin(a) * 14).toFixed(1)}`;
        }).join(' ')}Z" fill="${c.blonde}" stroke="${c.blonde}" stroke-width="5" stroke-linejoin="round"/>
        <ellipse cx="${x}" cy="${y}" rx="30" ry="8.5" fill="${c.lueur}"/>
        ${[-14, -4, 8, 16, 0].map((d, i) => `<circle cx="${x + d}" cy="${y + (i % 2 ? 2 : -2)}" r="1.3" fill="${c.croute}"/>`).join('')}
      </g>`,
      )
      .join('')}`,

  gaufre: `
    <path d="M30 128l34-58h140l-18 58z" fill="${c.croute}"/>
    <path d="M30 128l156 0 0 14-156 0z" fill="${c.crouteMoy}"/>
    <path d="M186 128l18-58v14l-18 58z" fill="${c.crouteFonce}"/>
    <path d="M36 124l30-50h132l-16 50z" fill="${c.doree}"/>
    ${[0, 1, 2, 3, 4, 5]
      .map((i) => {
        const x1 = 60 + i * 26;
        const x2 = 42 + i * 28;
        return `<path d="M${x1} 76L${x2} 122" stroke="${c.croute}" stroke-width="5"/>`;
      })
      .join('')}
    ${[0, 1, 2].map((i) => `<path d="M${58 - i * 9} ${88 + i * 14}H${196 - i * 5}" stroke="${c.croute}" stroke-width="5"/>`).join('')}
    ${Array.from({ length: 26 }, (_, i) => `<circle cx="${72 + ((i * 53) % 110)}" cy="${82 + ((i * 29) % 36)}" r="${1 + (i % 3) * 0.7}" fill="${c.sucre}" opacity=".9"/>`).join('')}`,

  tarte: `
    <path d="M28 132l98-64 90 50z" fill="${c.mie}"/>
    <path d="M28 132l188-14v14l-188 14z" fill="${c.crouteMoy}"/>
    <path d="M28 132v14" stroke="${c.croute}" stroke-width="2"/>
    <path d="M28 132l98-64 90 50" stroke="${c.doree}" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M28 132l188-14" stroke="${c.croute}" stroke-width="10" stroke-linecap="round"/>
    ${[
      [96, 104], [128, 96], [156, 110], [120, 116], [74, 118], [180, 118],
    ]
      .map(
        ([x, y]) => `
      <ellipse cx="${x}" cy="${y}" rx="15" ry="8" fill="${c.abricot}"/>
      <ellipse cx="${x - 3}" cy="${y - 2}" rx="7" ry="3" fill="${c.lueur}" opacity=".7"/>`,
      )
      .join('')}`,

  sandwich: `
    <path d="M14 104c0-14 16-22 42-22h128c26 0 42 8 42 22z" fill="${c.croute}"/>
    <path d="M26 96c6-8 18-10 32-10h124c14 0 26 2 32 10z" fill="${c.doree}"/>
    ${[46, 90, 134, 178].map((x) => `<path d="M${x} 92c8-6 20-7 28-3" stroke="${c.lueur}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
    <path d="M16 106c10 6 24 4 34 8s22-2 34 2 22-2 34 2 24-2 34 2 22-4 34 0 16 0 22-6v8H16z" fill="${c.salade}"/>
    <path d="M18 112h206v10H18z" fill="${c.jambon}"/>
    <path d="M18 112c30 4 60-4 90 0s70 4 116-2" stroke="${c.lueur}" stroke-width="2" fill="none" opacity=".8"/>
    <path d="M18 122h206c-4 16-20 24-40 24H58c-24 0-38-8-40-24z" fill="${c.croute}"/>
    <path d="M20 124h202" stroke="${c.mie}" stroke-width="5"/>`,

  pizza: `
    <path d="M26 118l44-50h144l-40 50z" fill="${c.doree}"/>
    <path d="M26 118h148v18H26z" fill="${c.croute}"/>
    <path d="M174 118l40-50v18l-40 50z" fill="${c.crouteFonce}"/>
    <path d="M38 112l36-38h130l-32 38z" fill="${c.tomate}"/>
    ${[
      [80, 86, 16, 7], [124, 82, 18, 6], [164, 88, 14, 6], [104, 100, 20, 7], [148, 104, 16, 6], [66, 104, 12, 5], [182, 80, 10, 4],
    ]
      .map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c.fromage}"/>`)
      .join('')}
    ${[[96, 88], [138, 94], [172, 98], [118, 106], [74, 96], [154, 80]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3" fill="${c.olive}"/><ellipse cx="${x}" cy="${y}" rx="1.6" ry="1" fill="${c.tomate}"/>`).join('')}
    <path d="M26 118h148" stroke="${c.blonde}" stroke-width="3"/>`,
} as const;

export type NomDessin = keyof typeof dessins;
