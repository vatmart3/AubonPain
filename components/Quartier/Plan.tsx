/**
 * Plan dessiné à la main, volontairement schématique et honnête :
 * la rue Paul Bousquet, des façades de part et d'autre, la boutique au n°36.
 * Aucun autre lieu n'est inventé.
 */
export function Plan() {
  // Façades côté boutique (haut) et en face (bas), le long d'une rue légèrement en biais.
  const haut = [60, 150, 215, 300, 385, 470, 540, 625, 705];
  const bas = [40, 125, 230, 310, 400, 495, 575, 660, 745];
  const yRue = (x: number) => 318 - x * 0.06;

  return (
    <svg viewBox="0 0 800 560" className="plan" role="img" aria-labelledby="plan-titre plan-desc">
      <title id="plan-titre">Plan schématique de la rue Paul Bousquet</title>
      <desc id="plan-desc">La rue Paul Bousquet, dessinée à la main, avec la boulangerie Au Bon Pain marquée d’un tampon au numéro 36. Pas à l’échelle.</desc>
      <defs>
        <filter id="main-levee" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="4" />
        </filter>
        <pattern id="hachures" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#2a221d" strokeWidth="1.1" opacity=".42" />
        </pattern>
        <filter id="tampon-encre" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" result="b" />
          <feDisplacementMap in="SourceGraphic" in2="b" scale="2.5" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.3" seed="4" result="t" />
          <feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2 1.7" result="m" />
          <feComposite in="d" in2="m" operator="in" />
        </filter>
        <path id="axe-rue" d={`M40 ${yRue(40) + 8} L760 ${yRue(760) + 8}`} />
      </defs>

      <g filter="url(#main-levee)" fill="none" stroke="#2a221d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Bords de la rue */}
        <path d={`M18 ${yRue(18) - 32} L782 ${yRue(782) - 32}`} />
        <path d={`M18 ${yRue(18) + 44} L782 ${yRue(782) + 44}`} />
        {/* Trottoirs */}
        <path d={`M18 ${yRue(18) - 48} L782 ${yRue(782) - 48}`} strokeWidth="1.2" strokeDasharray="2 7" />
        <path d={`M18 ${yRue(18) + 60} L782 ${yRue(782) + 60}`} strokeWidth="1.2" strokeDasharray="2 7" />

        {/* Façades côté boutique */}
        {haut.slice(0, -1).map((x, i) => {
          const x2 = haut[i + 1] - 6;
          const h = 120 + ((i * 37) % 60);
          const pts = `${x},${yRue(x) - 52} ${x2},${yRue(x2) - 52} ${x2},${yRue(x2) - 52 - h} ${x},${yRue(x) - 52 - h}`;
          return i === 3 ? null : <polygon key={x} points={pts} fill="url(#hachures)" />;
        })}
        {/* Façades d'en face */}
        {bas.slice(0, -1).map((x, i) => {
          const x2 = bas[i + 1] - 6;
          const h = 110 + ((i * 53) % 70);
          const pts = `${x},${yRue(x) + 64} ${x2},${yRue(x2) + 64} ${x2},${yRue(x2) + 64 + h} ${x},${yRue(x) + 64 + h}`;
          return <polygon key={x} points={pts} fill="url(#hachures)" />;
        })}

        {/* La boutique, n°36 : pas de hachures, une vitrine */}
        <polygon points={`300,${yRue(300) - 52} 379,${yRue(379) - 52} 379,${yRue(379) - 190} 300,${yRue(300) - 190}`} strokeWidth="2.8" />
        <path d={`M310 ${yRue(310) - 60} L369 ${yRue(369) - 60}`} strokeWidth="5" />
      </g>

      <text fontFamily="var(--f-texte)" fontSize="15" fontWeight="700" letterSpacing="5" fill="#2a221d">
        <textPath href="#axe-rue" startOffset="52%">
          RUE PAUL BOUSQUET
        </textPath>
      </text>

      {/* Le tampon : troisième usage de la tomette */}
      <g transform={`translate(372 ${yRue(372) - 150}) rotate(-12)`} filter="url(#tampon-encre)" fill="#9c3b22" stroke="#9c3b22">
        <circle r="64" fill="none" strokeWidth="4" />
        <circle r="54" fill="none" strokeWidth="1.5" />
        <text y="-16" textAnchor="middle" stroke="none" fontFamily="var(--f-texte)" fontWeight="700" fontSize="13" letterSpacing="3">
          C’EST ICI
        </text>
        <text y="12" textAnchor="middle" stroke="none" fontFamily="var(--f-titre)" fontSize="21">
          Au Bon Pain
        </text>
        <text y="32" textAnchor="middle" stroke="none" fontFamily="var(--f-texte)" fontWeight="700" fontSize="11" letterSpacing="2">
          N° 36
        </text>
      </g>

      <text x="780" y="545" textAnchor="end" fontFamily="var(--f-texte)" fontSize="15" fill="#2a221d" opacity=".75">
        dessiné à la main · pas à l’échelle
      </text>
    </svg>
  );
}
