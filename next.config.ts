import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@/lib/categories", "@/lib/stores"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lowimyokazje.pl" }],
        destination: "https://lowimyokazje.pl/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.ceneostatic.pl", pathname: "/**" },
      { protocol: "https", hostname: "**.ceneostatic.pl", pathname: "/**" },
      { protocol: "https", hostname: "dassets2.shimano.com", pathname: "/**" },
      { protocol: "https", hostname: "fish.shimano.com", pathname: "/**" },
      { protocol: "https", hostname: "www.rapala.com", pathname: "/**" },
      { protocol: "https", hostname: "www.savagegear.com", pathname: "/**" },
      { protocol: "https", hostname: "**.daiwa.com", pathname: "/**" },
      { protocol: "https", hostname: "**.garmin.com", pathname: "/**" },
      { protocol: "https", hostname: "**.foxint.com", pathname: "/**" },
      { protocol: "https", hostname: "**.major-fishing.pl", pathname: "/**" },
      { protocol: "https", hostname: "**.fishing-mart.com.pl", pathname: "/**" },
      { protocol: "https", hostname: "**.wedkarski.com", pathname: "/**" },
      { protocol: "https", hostname: "**.allans.pl", pathname: "/**" },
    ],
  },
};

export default nextConfig;
