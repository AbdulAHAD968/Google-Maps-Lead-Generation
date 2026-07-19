/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep these as external requires so Turbopack doesn't inline their native bindings
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],

  // Vercel's file tracer only follows JS imports; it skips non-JS assets that packages read
  // from disk at runtime - the Chromium binary/shared-libs archives inside @sparticuz/chromium,
  // and playwright-core's own browsers.json (read by lib/coreBundle.js) - unless included here.
  outputFileTracingIncludes: {
    "/api/leads/[id]/deep-extract": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/playwright-core/**",
    ],
    "/api/indeed/search": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/playwright-core/**",
    ],
  },
};

export default nextConfig;
