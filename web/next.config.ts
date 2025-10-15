import { config } from "dotenv";
import type { NextConfig } from "next";

// load in the root config as well
config({ path: "../.env", quiet: true });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_WEB_BASE_URL: process.env.WEB_BASE_URL,
  },
};

export default nextConfig;
