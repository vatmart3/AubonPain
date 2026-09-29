'use client';

/**
 * La clochette de la porte, synthétisée (aucun fichier son à charger) :
 * deux petits coups de cloche en laiton, comme au-dessus d'une porte de boutique.
 */

let ctx: AudioContext | null = null;

function contexte() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function coup(c: AudioContext, debut: number, volume: number, base: number) {
  const sortie = c.createGain();
  sortie.gain.value = volume;
  sortie.connect(c.destination);
  // Partiels inharmoniques d'une petite cloche
  for (const [ratio, gain, duree] of [
    [1, 0.6, 1.4],
    [2.76, 0.25, 0.9],
    [5.4, 0.12, 0.5],
    [8.93, 0.06, 0.3],
  ] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = base * ratio;
    g.gain.setValueAtTime(0, debut);
    g.gain.linearRampToValueAtTime(gain, debut + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    o.connect(g).connect(sortie);
    o.start(debut);
    o.stop(debut + duree + 0.05);
  }
}

export function sonnerClochette() {
  try {
    const c = contexte();
    const t = c.currentTime + 0.01;
    coup(c, t, 0.22, 1320);
    coup(c, t + 0.11, 0.16, 1245);
    coup(c, t + 0.26, 0.08, 1320);
  } catch {
    /* pas d'audio : tant pis */
  }
}

/** À appeler sur un geste utilisateur pour débloquer l'audio (iOS). */
export function reveillerAudio() {
  try {
    contexte();
  } catch {
    /* rien */
  }
}
