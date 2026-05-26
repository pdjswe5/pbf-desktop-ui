import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/pbf-desktop-ui',
  assetPrefix: '/pbf-desktop-ui',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
