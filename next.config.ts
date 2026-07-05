import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {unoptimized: true},
  trailingSlash: true, // Bu, sayfaların klasör yapısıyla (index.html olarak) çıkmasını sağlar
};

export default nextConfig;