import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { SmoothScroll } from '@/components/SmoothScroll/SmoothScroll';
import { TransitionProvider, useAller } from '@/components/Transition/Transition';
import { PanierProvider } from '@/components/Panier/Panier';
import { Nav } from '@/components/Nav/Nav';
import { BarreMobile } from '@/components/BarreMobile/BarreMobile';
import { PiedTicket } from '@/components/PiedTicket/PiedTicket';
import { Intro } from '@/components/Intro/Intro';
import { Comptoir } from '@/components/Comptoir/Comptoir';
import { HeureDuFour } from '@/components/HeureDuFour/HeureDuFour';
import { Ardoise } from '@/components/Ardoise/Ardoise';
import { Avis } from '@/components/Avis/Avis';
import { Quartier } from '@/components/Quartier/Quartier';
import { AppelCommande } from '@/components/AppelCommande/AppelCommande';
import LaMaison from '@/app/la-maison/page';
import PageCommander from '@/app/commander/page';
import MentionsLegales from '@/app/mentions-legales/page';
import Confidentialite from '@/app/confidentialite/page';
import PageIntrouvable from '@/app/not-found';
import { usePathname } from 'next/navigation';
import { installerApiDemo, PanneauDemo } from './demo';

function Accueil() {
  return (
    <>
      <Intro mode="placeholder" />
      <Comptoir />
      <HeureDuFour />
      <Ardoise />
      <Avis />
      <Quartier />
      <AppelCommande />
    </>
  );
}

const pages: Record<string, () => React.ReactElement> = {
  '/': Accueil,
  '/la-maison': LaMaison,
  '/commander': PageCommander,
  '/mentions-legales': MentionsLegales,
  '/confidentialite': Confidentialite,
};

/** Les liens internes écrits en <a href="/…"> passent eux aussi par le routeur. */
function LiensInternes() {
  const aller = useAller();
  useEffect(() => {
    const clic = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a');
      const href = a?.getAttribute('href');
      if (!a || !href || !href.startsWith('/')) return;
      e.preventDefault();
      aller(href);
    };
    document.addEventListener('click', clic);
    return () => document.removeEventListener('click', clic);
  }, [aller]);
  return null;
}

function Site() {
  const chemin = usePathname();
  const Page = pages[chemin] ?? PageIntrouvable;
  useEffect(() => {
    const titres: Record<string, string> = { '/la-maison': 'La maison', '/commander': 'Commander', '/mentions-legales': 'Mentions légales', '/confidentialite': 'Confidentialité' };
    document.title = titres[chemin] ? `${titres[chemin]} — Au Bon Pain` : 'Au Bon Pain';
  }, [chemin]);
  return (
    <>
      <a className="lien-evitement" href="#contenu">
        Aller au contenu
      </a>
      <PanierProvider>
        <TransitionProvider>
          <LiensInternes />
          <SmoothScroll />
          <Nav />
          <main id="contenu" key={chemin}>
            <Page />
          </main>
          <PiedTicket />
          <BarreMobile />
          <PanneauDemo />
        </TransitionProvider>
      </PanierProvider>
    </>
  );
}

installerApiDemo();
createRoot(document.getElementById('racine')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
);
