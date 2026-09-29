'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';

type Props = {
  /** Progression de l'intro (0 → 1), lue à chaque image sans re-rendu React. */
  progression: MutableRefObject<number>;
  /** Horodatage (performance.now) du « bam » ; 0 = pas encore. */
  bouffee: MutableRefObject<number>;
  nombre: number;
};

/** Petite tache ronde et douce, dessinée une fois. */
function textureGrain() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const d = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  d.addColorStop(0, 'rgba(255,248,232,1)');
  d.addColorStop(0.35, 'rgba(255,240,210,0.55)');
  d.addColorStop(1, 'rgba(255,230,190,0)');
  g.fillStyle = d;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** La poussière de farine qui flotte dans le rayon de lumière. */
function Poussiere({ progression, nombre }: Pick<Props, 'progression' | 'nombre'>) {
  const points = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const texture = useMemo(textureGrain, []);

  const { positions, graines } = useMemo(() => {
    const positions = new Float32Array(nombre * 3);
    const graines = new Float32Array(nombre * 4);
    for (let i = 0; i < nombre; i++) {
      // Répartition le long d'un rayon en biais (haut-gauche → bas-droite).
      const t = Math.random();
      const ecart = (Math.random() - 0.5) * (0.9 + t * 1.6);
      positions[i * 3] = -4 + t * 7 + ecart * 0.6;
      positions[i * 3 + 1] = 3 - t * 5.5 + ecart;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      graines.set([Math.random() * 100, 0.02 + Math.random() * 0.06, 0.3 + Math.random() * 0.7, Math.random()], i * 4);
    }
    return { positions, graines };
  }, [nombre]);

  const base = useMemo(() => positions.slice(), [positions]);

  useFrame(({ clock }) => {
    const p = points.current;
    if (!p) return;
    const t = clock.elapsedTime;
    const pos = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < nombre; i++) {
      const [s, v, a] = [graines[i * 4], graines[i * 4 + 1], graines[i * 4 + 2]];
      // Très lent : un peu de dérive, un peu de chute, beaucoup de flottement.
      pos[i * 3] = base[i * 3] + Math.sin(t * 0.13 * a + s) * 0.35 + Math.sin(t * 0.05 + s * 2) * 0.2;
      pos[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * 0.11 * a + s) * 0.25 - ((t * v) % 1.2);
      pos[i * 3 + 2] = base[i * 3 + 2] + Math.sin(t * 0.07 + s) * 0.3;
    }
    p.geometry.attributes.position.needsUpdate = true;
    // Visible sur la façade, plus discrète dans la boutique, éteinte au comptoir.
    const pr = progression.current;
    const m = p.material as THREE.PointsMaterial;
    m.opacity = pr < 0.3 ? 0.9 : pr < 0.45 ? 0.9 - (pr - 0.3) * 3 : pr < 0.8 ? 0.45 : Math.max(0, 0.45 - (pr - 0.8) * 4);
    p.scale.setScalar(Math.max(viewport.width / 10, 0.75));
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.07}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#fff3dc"
      />
    </points>
  );
}

/** La bouffée de farine du « bam » : ça part du centre et ça retombe. */
function Bouffee({ bouffee, nombre }: Pick<Props, 'bouffee' | 'nombre'>) {
  const points = useRef<THREE.Points>(null);
  const texture = useMemo(textureGrain, []);
  const { positions, vitesses } = useMemo(() => {
    const positions = new Float32Array(nombre * 3);
    const vitesses = new Float32Array(nombre * 3);
    for (let i = 0; i < nombre; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 4.5;
      vitesses.set([Math.cos(a) * r, Math.sin(a) * r * 0.7 + 1, (Math.random() - 0.5) * 2], i * 3);
    }
    return { positions, vitesses };
  }, [nombre]);

  useFrame(() => {
    const p = points.current;
    if (!p) return;
    const m = p.material as THREE.PointsMaterial;
    const debut = bouffee.current;
    const age = debut ? (performance.now() - debut) / 1000 : 99;
    if (age > 2) {
      m.opacity = 0;
      return;
    }
    const pos = p.geometry.attributes.position.array as Float32Array;
    const amorti = 1 - Math.exp(-age * 2.2); // décélère vite, comme la farine
    for (let i = 0; i < nombre; i++) {
      pos[i * 3] = vitesses[i * 3] * amorti * 0.6;
      pos[i * 3 + 1] = vitesses[i * 3 + 1] * amorti * 0.6 - age * age * 0.25;
      pos[i * 3 + 2] = vitesses[i * 3 + 2] * amorti * 0.6;
    }
    p.geometry.attributes.position.needsUpdate = true;
    m.opacity = Math.max(0, 1 - age / 2) * 0.95;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.16}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#fff8ec"
      />
    </points>
  );
}

export default function Farine({ progression, bouffee, nombre }: Props) {
  const [dpr, setDpr] = useState(1.25);
  const [n, setN] = useState(nombre);
  return (
    <Canvas
      dpr={dpr}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setN((x) => Math.max(120, Math.round(x / 2)));
        }}
      />
      <Poussiere key={n} progression={progression} nombre={n} />
      <Bouffee bouffee={bouffee} nombre={Math.round(n * 0.45)} />
    </Canvas>
  );
}
