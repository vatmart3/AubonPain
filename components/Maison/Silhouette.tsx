/**
 * En attendant le portrait de Béatrice : une silhouette en papier découpé
 * derrière son comptoir. Volontairement pas une photo de banque d'images.
 */
export function Silhouette() {
  return (
    <svg viewBox="0 0 600 720" role="img" aria-label="Silhouette en papier découpé d’une boulangère derrière son comptoir (en attendant la photo)">
      <defs>
        <filter id="ombre-papier" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#15110e" floodOpacity=".35" />
        </filter>
      </defs>
      <rect width="600" height="720" fill="#e7d6b8" />
      {/* étagères du fond */}
      <g filter="url(#ombre-papier)">
        <rect x="0" y="170" width="600" height="16" fill="#8a5a2b" />
        <rect x="0" y="330" width="600" height="16" fill="#8a5a2b" />
        {[20, 120, 400, 500].map((x, i) => (
          <path key={x} d={`M${x} 170c0-34 22-52 44-52s44 18 44 52z`} fill={i % 2 ? '#a8662e' : '#c07f3c'} />
        ))}
        {[30, 90, 430, 480, 540].map((x, i) => (
          <rect key={x} x={x} y={i % 2 ? 250 : 262} width="70" height="20" rx="10" fill={i % 2 ? '#b8763f' : '#a8662e'} transform={`rotate(${i % 2 ? -8 : 6} ${x + 35} 270)`} />
        ))}
      </g>
      {/* la lampe en osier */}
      <line x1="300" y1="0" x2="300" y2="60" stroke="#2a221d" strokeWidth="2" />
      <circle cx="300" cy="92" r="34" fill="#d8b98c" filter="url(#ombre-papier)" />
      <circle cx="300" cy="100" r="12" fill="#faf6ef" />
      {/* Béatrice : silhouette découpée */}
      <g filter="url(#ombre-papier)">
        <path
          d="M300 196c-38 0-62 30-62 70 0 26 10 46 26 58-58 16-100 60-112 130l-10 70h316l-10-70c-12-70-54-114-112-130 16-12 26-32 26-58 0-40-24-70-62-70z"
          fill="#2a221d"
        />
        {/* chignon */}
        <circle cx="300" cy="188" r="24" fill="#2a221d" />
        {/* tablier */}
        <path d="M244 360c16 8 36 12 56 12s40-4 56-12l24 164H220z" fill="#f2e8d8" />
        <path d="M268 338c10 10 20 14 32 14s22-4 32-14" stroke="#f2e8d8" strokeWidth="6" fill="none" />
      </g>
      {/* le comptoir, au premier plan */}
      <g filter="url(#ombre-papier)">
        <rect x="0" y="520" width="600" height="200" fill="#4a2e19" />
        <rect x="0" y="508" width="600" height="22" fill="#6b4527" />
        <rect x="60" y="470" width="480" height="50" fill="#faf6ef" opacity=".55" />
        <path d="M110 506c0-22 16-34 36-34s36 12 36 34z" fill="#c07f3c" />
        <path d="M230 506c4-18 20-30 38-30 20 0 34 12 38 30z" fill="#d69a52" />
        <path d="M400 506c0-16 18-26 40-26s40 10 40 26z" fill="#a8662e" />
      </g>
      {[80, 200, 320, 440, 560].map((x) => (
        <rect key={x} x={x} y="540" width="3" height="180" fill="#35200f" />
      ))}
    </svg>
  );
}
