import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O documento fica fora de app/: sem isto a função serverless da Vercel não o empacota.
  outputFileTracingIncludes: { "/admin/decisoes-lgpd": ["./docs/_projeto/lgpd/DECISOES-LGPD.md"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
