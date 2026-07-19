// On Vercel, the full `playwright` package's bundled Chromium is too large and its native
// bindings don't survive Turbopack's file tracing. In production we use `playwright-core`
// (no bundled browser) paired with `@sparticuz/chromium`, a Lambda-compatible Chromium build.
// Locally, the full `playwright` package (devDependency) drives its own downloaded browser.
export async function launchBrowser() {
  const isProduction = process.env.VERCEL_ENV !== undefined;

  if (isProduction) {
    const [{ chromium }, chromiumBinary] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);
    const executablePath = await chromiumBinary.default.executablePath();
    return chromium.launch({
      args: chromiumBinary.default.args,
      executablePath,
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({ headless: true });
}
