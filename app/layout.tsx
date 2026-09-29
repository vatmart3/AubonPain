import type { Metadata, Viewport } from 'next';
import { gloock, karla, mono, nanum } from '@/lib/fonts';
import { urlSite } from '@/lib/site';
import { jsonLdBoulangerie } from '@/lib/jsonld';
import { SmoothScroll } from '@/components/SmoothScroll/SmoothScroll';
import { TransitionProvider } from '@/components/Transition/Transition';
import { PanierProvider } from '@/components/Panier/Panier';
import { Nav } from '@/components/Nav/Nav';
import { BarreMobile } from '@/components/BarreMobile/BarreMobile';
import { PiedTicket } from '@/components/PiedTicket/PiedTicket';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(urlSite),
  title: {
    default: 'Au Bon Pain — Boulangerie-pâtisserie à Sète, rue Paul Bousquet',
    template: '%s — Au Bon Pain, boulangerie à Sète',
  },
  description:
    'Boulangerie de quartier à Sète, 36 rue Paul Bousquet. Pain moelleux, croissants, pains aux raisins géants, plaques de pizza. Commandez la veille, retirez en boutique dès 6h30.',
  applicationName: 'Au Bon Pain',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Au Bon Pain — Sète',
  },
  formatDetection: { telephone: true, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: '#15110E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${gloock.variable} ${karla.variable} ${nanum.variable} ${mono.variable}`}>
      <body>
        <a className="lien-evitement" href="#contenu">
          Aller au contenu
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBoulangerie()) }} />
        <PanierProvider>
          <TransitionProvider>
            <SmoothScroll />
            <Nav />
            <main id="contenu">{children}</main>
            <PiedTicket />
            <BarreMobile />
          </TransitionProvider>
        </PanierProvider>
      </body>
    </html>
  );
}
