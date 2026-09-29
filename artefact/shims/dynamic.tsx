import { lazy, Suspense, type ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function dynamic<P extends object>(charger: () => Promise<any>): ComponentType<P> {
  const Paresseux = lazy(async () => {
    const m = await charger();
    return { default: (m.default ?? m) as ComponentType<P> };
  });
  return function Dynamique(props: P) {
    return (
      <Suspense fallback={null}>
        <Paresseux {...props} />
      </Suspense>
    );
  };
}
