import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Au Bon Pain — Boulangerie à Sète',
    short_name: 'Au Bon Pain',
    start_url: '/',
    display: 'browser',
    background_color: '#15110E',
    theme_color: '#15110E',
    lang: 'fr',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
