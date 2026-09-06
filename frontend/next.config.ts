import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume workspace package source/build output correctly in the monorepo.
  transpilePackages: ["@vami/schemas"],
};

export default nextConfig;
