import type { Metadata } from 'next';
import { Intro } from '@/components/Intro/Intro';
import { Comptoir } from '@/components/Comptoir/Comptoir';
import { HeureDuFour } from '@/components/HeureDuFour/HeureDuFour';
import { Ardoise } from '@/components/Ardoise/Ardoise';
import { Avis } from '@/components/Avis/Avis';
import { Quartier } from '@/components/Quartier/Quartier';
import { AppelCommande } from '@/components/AppelCommande/AppelCommande';
import { modeIntro } from '@/lib/intro-mode';

export const metadata: Metadata = {
  title: { absolute: 'Au Bon Pain — Boulangerie-pâtisserie à Sète, rue Paul Bousquet' },
  alternates: { canonical: '/' },
};

export default function Accueil() {
  return (
    <>
      <Intro mode={modeIntro()} />
      <Comptoir />
      <HeureDuFour />
      <Ardoise />
      <Avis />
      <Quartier />
      <AppelCommande />
    </>
  );
}
