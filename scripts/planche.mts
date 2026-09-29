import sharp from 'sharp';
import { dessins } from '../components/Illustrations/dessins.ts';
const noms = Object.keys(dessins);
const cols = 4, w = 240, h = 160;
const rows = Math.ceil(noms.length / cols);
const cells = noms.map((n, i) => `<g transform="translate(${(i % cols) * w} ${Math.floor(i / cols) * h})"><rect width="${w}" height="${h}" fill="#1f1915" stroke="#333"/>${(dessins as any)[n]}<text x="6" y="14" fill="#fff" font-size="11">${n}</text></g>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * w}" height="${rows * h}">${cells}</svg>`;
await sharp(Buffer.from(svg)).resize(cols * w * 1.5).png().toFile(process.argv[2]);
