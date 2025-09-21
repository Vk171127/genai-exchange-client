import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_USE_MOCK: "false",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // output: 'export'
};

export default nextConfig;
