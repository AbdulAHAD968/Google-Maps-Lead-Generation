/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep these as external requires so Turbopack doesn't inline their native bindings
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],

  // Vercel's file tracer only follows JS imports; it skips the Chromium binary/shared-libs
  // archives inside @sparticuz/chromium unless explicitly included here.
  outputFileTracingIncludes: {
    "/api/leads/[id]/deep-extract": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
