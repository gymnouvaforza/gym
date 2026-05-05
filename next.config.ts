import type { NextConfig } from "next";

function buildMedusaRemotePatterns() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? process.env.MEDUSA_BACKEND_URL;

  if (!configuredUrl) {
    return [];
  }

  try {
    const url = new URL(configuredUrl);

    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://*.paypal.com https://*.paypalobjects.com https://*.googleusercontent.com https://medusa-public-images.s3.eu-west-1.amazonaws.com https://*.gstatic.com;
      media-src 'self' https://*.supabase.co https://*.supabase.in;
      font-src 'self' https://fonts.gstatic.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src https://www.paypal.com https://*.firebaseapp.com;
      connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.googleapis.com https://*.paypal.com https://*.firebaseio.com https://*.googleapis.com;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, " ").trim();

    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: cspHeader,
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      ...buildMedusaRemotePatterns(),
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/s3/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    qualities: [52, 58, 60, 75],
  },
};

export default nextConfig;
