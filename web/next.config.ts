import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true, // linter should take care of typing
  },
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "gc-files.cs4535.cloud",
      },
      {
        protocol: "https",
        hostname: "files.commng.nunext.dev",
      },
    ],
  },
};

export default nextConfig;
