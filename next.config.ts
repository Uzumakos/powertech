import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hides the Next.js dev tools indicator in development.
  devIndicators: false,
  images: {
    // AVIF first (about 20–30 % lighter than WebP), WebP for older browsers.
    formats: ["image/avif", "image/webp"],
    // Optimized images are cached for a week (photos rarely change).
    minimumCacheTTL: 604800,
    // Hosts served through the image optimizer. Any other host entered in the
    // admin still works: <MediaImage> renders it unoptimized.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    // Detects lost connectivity and retries navigations and form submissions
    // (quote, pre-order) automatically once the network is back.
    useOffline: true,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          // Always check for a new service worker version.
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
