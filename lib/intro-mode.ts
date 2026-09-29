import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { cheminFrame, introConfig, type ModeIntro } from '@/components/Intro/intro.config';

/** Mode de l'intro : la séquence de frames dès qu'elle est déposée dans public/intro/. */
export function modeIntro(): ModeIntro {
  if (introConfig.mode !== 'auto') return introConfig.mode;
  const existe = (f: 'desktop' | 'mobile') => existsSync(path.join(process.cwd(), 'public', cheminFrame(f, 1)));
  return existe('desktop') && existe('mobile') ? 'frames' : 'placeholder';
}
