'use client';

/**
 * Un produit « glisse » dans le sac : un clone suit un arc (courbe de Bézier),
 * rapetisse, puis le sac rebondit. Rien du tout si le mouvement est réduit.
 */
export function envolerVersSac(source: Element | null, sac: Element | null) {
  if (!source || !sac) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = source.getBoundingClientRect();
  const b = sac.getBoundingClientRect();
  if (!a.width || !b.width || b.bottom < 0 || b.top > window.innerHeight) return;

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: '0',
    zIndex: '120',
    pointerEvents: 'none',
  });
  document.body.appendChild(clone);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height * 0.28 - (a.top + a.height / 2);
  const haut = -Math.max(120, Math.abs(dx) * 0.35);
  const etapes = 14;
  const images: Keyframe[] = [];
  for (let i = 0; i <= etapes; i++) {
    const t = i / etapes;
    // Bézier quadratique : départ, point de contrôle au-dessus, arrivée
    const x = 2 * (1 - t) * t * (dx * 0.5) + t * t * dx;
    const y = 2 * (1 - t) * t * (dy * 0.5 + haut) + t * t * dy;
    images.push({
      transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.65}) rotate(${t * 18 - 6}deg)`,
      opacity: t > 0.9 ? 1 - (t - 0.9) * 10 : 1,
    });
  }
  clone.animate(images, { duration: 700, easing: 'cubic-bezier(.35,.05,.45,1)' }).onfinish = () => {
    clone.remove();
    sac.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(6px) scale(1.04, 0.96)' },
        { transform: 'translateY(-4px) scale(0.98, 1.03)' },
        { transform: 'translateY(0) scale(1)' },
      ],
      { duration: 420, easing: 'cubic-bezier(.34,1.3,.64,1)' },
    );
  };
}
