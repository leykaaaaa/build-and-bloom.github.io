import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    localPatterns: [
      {
        pathname: "/IMAGES/**",
        search: "?v=20261114-1951",
      },
      {
        pathname: "/**",
        search: "",
      },
    ],
  },
  turbopack: {
    root: fileURLToPath(new URL("../", import.meta.url)),
  },
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
