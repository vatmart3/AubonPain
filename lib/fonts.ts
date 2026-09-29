import { Gloock, IBM_Plex_Mono, Karla, Nanum_Pen_Script } from 'next/font/google';

export const gloock = Gloock({ subsets: ['latin'], weight: '400', variable: '--font-gloock', display: 'swap' });

export const karla = Karla({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-karla', display: 'swap' });

/** Manuscrit : l'ardoise et quelques annotations seulement. */
export const nanum = Nanum_Pen_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-nanum',
  display: 'swap',
  preload: false,
});

/** Monospace : le ticket de caisse du pied de page, et lui seul. */
export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});
