import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const ici = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': ici('./'),
      'server-only': ici('./tests/vide.ts'),
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
