import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    // 🚨 Skips type checking
    ignoreBuildErrors: true,
  },
  eslint: {
    // 🚨 Skips ESLint errors
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
