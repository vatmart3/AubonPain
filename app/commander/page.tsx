import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EnTetePage } from '@/components/EnTetePage/EnTetePage';
import { Commande } from '@/components/Commander/Commande';

export const metadata: Metadata = {
  title: 'Commander du pain à Sète, retrait en boutique',
  description:
    'Commandez votre pain, vos croissants ou une plaque de pizza la veille, retirez-les rue Paul Bousquet à Sète. Pas de compte, pas de paiement en ligne : vous payez en boutique.',
  alternates: { canonical: '/commander' },
};

export default function PageCommander() {
  return (
    <>
      <EnTetePage
        titre={
          <>
            Votre bon
            <br />
            de commande
          </>
        }
        chapeau="Trois petites étapes, pas de compte, pas de carte bancaire. Vous commandez ici, vous payez en boutique."
      />
      <Suspense>
        <Commande />
      </Suspense>
    </>
  );
}
