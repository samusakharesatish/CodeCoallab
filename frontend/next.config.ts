import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: ["**/node_modules", "**/.git"],
    };
    return config;
  },
};

export default nextConfig;