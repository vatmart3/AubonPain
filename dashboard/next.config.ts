import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // La clé SumUp ne doit jamais partir vers le navigateur : on n'expose aucune
  // variable via `env` ici, et toutes les lectures se font dans lib/env.ts
  // (protégé par "server-only").
};

export default nextConfig;
