import { useId } from 'react';

/**
 * Le logo-tampon : un tampon encreur rectangulaire, un peu baveux.
 * Couleur = currentColor.
 */
export function LogoTampon({ className, titre = 'Au Bon Pain, Sète' }: { className?: string; titre?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 220 120" role="img" aria-label={titre}>
      <defs>
        <filter id={`encre-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="bruit" />
          <feDisplacementMap in="SourceGraphic" in2="bruit" scale="2.2" result="bave" />
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="trous" />
          <feColorMatrix in="trous" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="masque" />
          <feComposite in="bave" in2="masque" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#encre-${id})`} fill="currentColor" stroke="currentColor">
        <rect x="5" y="5" width="210" height="110" rx="10" fill="none" strokeWidth="4.5" />
        <rect x="13" y="13" width="194" height="94" rx="5" fill="none" strokeWidth="1.6" />
        <text x="110" y="37" textAnchor="middle" stroke="none" fontFamily="var(--f-texte)" fontSize="12.5" fontWeight="700" letterSpacing="3.2">
          BOULANGERIE · PÂTISSERIE
        </text>
        <text x="110" y="78" textAnchor="middle" stroke="none" fontFamily="var(--f-titre)" fontSize="38" letterSpacing="-0.5">
          Au Bon Pain
        </text>
        <line x1="38" y1="89" x2="182" y2="89" strokeWidth="1.4" />
        <text x="110" y="102" textAnchor="middle" stroke="none" fontFamily="var(--f-texte)" fontSize="10.5" fontWeight="700" letterSpacing="2.6">
          36 R. PAUL BOUSQUET · SÈTE
        </text>
      </g>
    </svg>
  );
}
