import type { NextConfig } from "next";

// CSP só em Report-Only (sem report-uri: não há operador novo). 'unsafe-inline' porque o Next injeta scripts/estilos inline
// e nonce tiraria a landing do estático. Virar enforce só depois de medir (docs/_projeto/SEGURANCA.md).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

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
          { key: "Content-Security-Policy-Report-Only", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
