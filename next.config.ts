import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail build on ESLint errors (warnings only)
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail build on TypeScript errors during production builds
    // Remove this if you want strict type checking
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
