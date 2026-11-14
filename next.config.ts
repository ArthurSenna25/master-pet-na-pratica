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
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), interest-cohort=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          // Só vale em HTTPS (ignorado em http://localhost). Sem preload: é irreversível por meses.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
