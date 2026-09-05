import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  outputFileTracingExcludes: {
    '/api/parse-books': ['./public/books/**/*', './public/hasiye/**/*'],
  },
};

export default nextConfig;