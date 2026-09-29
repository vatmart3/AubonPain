import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const alt = 'Au Bon Pain, boulangerie-pâtisserie de quartier, 36 rue Paul Bousquet à Sète';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Image de partage : la façade, et le nom en Gloock. */
export default async function Image() {
  const [gloock, facade] = await Promise.all([
    readFile(path.join(process.cwd(), 'assets/fonts/Gloock-Regular.woff')),
    readFile(path.join(process.cwd(), 'public/og-facade.jpg')),
  ]);
  const fond = `data:image/jpeg;base64,${facade.toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#15110E' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fond} width={1200} height={675} style={{ position: 'absolute', top: -20, left: 0, opacity: 0.55 }} alt="" />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 330,
            background: '#15110E',
            opacity: 0.86,
          }}
        />
        <div style={{ position: 'absolute', left: 70, bottom: 64, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Gloock', fontSize: 150, color: '#F2E8D8', lineHeight: 0.9, letterSpacing: -3 }}>Au Bon Pain</div>
          <div style={{ fontFamily: 'Gloock', fontSize: 42, color: '#D8B98C', marginTop: 22 }}>Boulangerie de quartier · 36 rue Paul Bousquet · Sète</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Gloock', data: gloock, style: 'normal', weight: 400 }] },
  );
}
