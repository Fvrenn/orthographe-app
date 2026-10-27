const base = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // site statique : aucun serveur nécessaire
  trailingSlash: true,        // /regles/ -> regles/index.html (simple à mettre en cache)
  images: { unoptimized: true },
  basePath: base,
  env: { NEXT_PUBLIC_BASE_PATH: base },
};
export default nextConfig;
