import type { NextConfig } from "next";

/**
 * Domain publik Cloudflare R2 dipakai Next.js Image Optimizer.
 * Nilai diambil dari R2_PUBLIC_DOMAIN (mis. https://pub-xxxx.r2.dev).
 */
function r2RemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const configured = process.env.R2_PUBLIC_DOMAIN;

  if (!configured) {
    return [{ protocol: "https", hostname: "*.r2.dev" }];
  }

  try {
    return [{ protocol: "https", hostname: new URL(configured).hostname }];
  } catch {
    // Env tidak valid tidak boleh menggagalkan build; fallback ke domain r2.dev.
    return [{ protocol: "https", hostname: "*.r2.dev" }];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: r2RemotePatterns(),
  },
};

export default nextConfig;
