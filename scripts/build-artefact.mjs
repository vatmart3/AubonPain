/**
 * Empaquette le site en UNE page autonome (artefact claude.ai, mode démo) :
 * JS, CSS et images embarqués, polices Google Fonts, API de commande simulée.
 *   node scripts/build-artefact.mjs <fichier-de-sortie.html>
 */
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const sortie = process.argv[2] ?? path.join(racine, 'artefact/au-bon-pain.html');
const shim = (f) => path.join(racine, 'artefact/shims', f);

const remplacerConfigIntro = {
  name: 'config-intro-artefact',
  setup(b) {
    b.onResolve({ filter: /intro\.config$/ }, (args) =>
      args.importer.includes(`${path.sep}artefact${path.sep}`) ? undefined : { path: path.join(racine, 'artefact/intro.config.ts') },
    );
  },
};

const r = await build({
  absWorkingDir: racine,
  entryPoints: ['artefact/entree.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020', 'safari15'],
  jsx: 'automatic',
  write: false,
  outdir: 'artefact/dist',
  legalComments: 'none',
  logLevel: 'warning',
  loader: { '.webp': 'dataurl', '.avif': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: {
    'next/link': shim('link.tsx'),
    'next/image': shim('image.tsx'),
    'next/navigation': shim('navigation.ts'),
    'next/dynamic': shim('dynamic.tsx'),
    'next/font/google': shim('font.ts'),
  },
  plugins: [remplacerConfigIntro],
});

const js = r.outputFiles.find((f) => f.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script');
const css = r.outputFiles.find((f) => f.path.endsWith('.css')).text.replace(/<\/style/gi, '<\\/style');

const demoCss = `
.demo{position:fixed;left:0;top:50%;z-index:140;translate:0 -50%;display:flex;align-items:flex-start;font-family:var(--f-texte)}
.demo-onglet{writing-mode:vertical-rl;rotate:180deg;min-width:40px;padding:1rem .55rem;border:0;border-radius:0 16px 16px 0;background:var(--croute);color:var(--farine);font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:.85rem}
.demo-panneau{width:min(22rem,calc(100vw - 4rem));max-height:80vh;overflow:auto;padding:1.2rem 1.2rem 1.1rem;border-radius:0 var(--r-l) var(--r-l) 0;background:var(--farine);color:var(--encre);box-shadow:0 20px 40px rgb(0 0 0 / .5);font-size:1rem;line-height:1.45;display:grid;gap:.8rem}
.demo-titre{font-family:var(--f-titre);font-size:1.5rem;line-height:1}
.demo-case{display:flex;gap:.6rem;align-items:center;font-weight:700;min-height:44px}
.demo-case input{width:22px;height:22px;accent-color:var(--encre)}
.demo-whatsapp{background:#dcf2d0;color:#1d2a1a;border-radius:18px 18px 18px 4px;padding:.7rem .8rem}
.demo-de{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem}
.demo-whatsapp pre{margin:0;white-space:pre-wrap;font-family:var(--f-texte);font-size:.95rem}
.demo-vide{font-style:italic}
.demo-panneau[hidden]{display:none}
.demo-fermer{justify-self:start;min-height:44px;padding:0 1.2rem;border-radius:999px;border:2px solid var(--encre);background:transparent;color:var(--encre);font-weight:700}
.demo-onglet:focus-visible,.demo-fermer:focus-visible{outline:2.5px solid var(--encre);outline-offset:3px}
`;

const html = `<title>Au Bon Pain</title>
<meta name="description" content="Au Bon Pain, boulangerie-pâtisserie de quartier, 36 rue Paul Bousquet à Sète (version de démonstration).">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=IBM+Plex+Mono:wght@400;500&family=Karla:wght@400;500;700&family=Nanum+Pen+Script&display=swap">
<style>
:root{--font-gloock:'Gloock';--font-karla:'Karla';--font-nanum:'Nanum Pen Script';--font-mono:'IBM Plex Mono';color-scheme:dark;background:#15110E}
body{background:#15110E}
${css}
${demoCss}
</style>
<div id="racine"></div>
<script>${js}</script>
`;

writeFileSync(sortie, html);
console.log(`✓ ${sortie} — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} Mo`);
