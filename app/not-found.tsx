import { EnTetePage } from '@/components/EnTetePage/EnTetePage';
import { BoutonTicket } from '@/components/BoutonTicket/BoutonTicket';

export default function PageIntrouvable() {
  return (
    <>
      <EnTetePage titre="Plus rien sur l’étagère." chapeau="Cette page n’existe pas, ou plus. Le pain, lui, est toujours là." />
      <div style={{ padding: '0 var(--gouttiere) 8rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <BoutonTicket href="/" ton="croute">
          Retour à l’accueil
        </BoutonTicket>
        <BoutonTicket href="/commander">Commander</BoutonTicket>
      </div>
    </>
  );
}
