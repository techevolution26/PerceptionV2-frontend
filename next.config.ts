import type { NextConfig } from "next";

// Extract host and protocol safely from the environment variable if available
let backendHost = "localhost";
let backendProtocol: "http" | "https" = "http";
let backendPort = "8000";

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL);
    backendHost = url.hostname;
    backendProtocol = url.protocol.replace(":", "") as "http" | "https";
    backendPort = url.port || (backendProtocol === "https" ? "443" : "80");
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_API_URL configuration:", e);
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  images: {
    // FIXED: Allows Next.js to optimize images fetched via your storage proxy rewrite
    remotePatterns: [
      {
        protocol: backendProtocol,
        hostname: backendHost,
        port: backendPort,
        pathname: "/storage/**",
      },
    ],
  },

  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      console.warn("NEXT_PUBLIC_API_URL not set — skipping external rewrites.");
      return [];
    }

    return [
      {
        source: "/storage/:path*",
        destination: `${apiBase}/storage/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
