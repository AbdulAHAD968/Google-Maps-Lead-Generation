// On Vercel, the full `playwright` package's bundled Chromium is too large and its native
// bindings don't survive Turbopack's file tracing. In production we use `playwright-core`
// (no bundled browser) paired with `@sparticuz/chromium`, a Lambda-compatible Chromium build.
// Locally, the full `playwright` package (devDependency) drives its own downloaded browser.
// Extra args that make headless Chromium harder to fingerprint as automation.
// `--disable-blink-features=AutomationControlled` removes the most common signal
// (navigator.webdriver + related Blink flags) that anti-bot systems check for.
const STEALTH_ARGS = ["--disable-blink-features=AutomationControlled"];

export async function launchBrowser() {
  const isProduction = process.env.VERCEL_ENV !== undefined;

  if (isProduction) {
    const [{ chromium }, chromiumBinary] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);
    const executablePath = await chromiumBinary.default.executablePath();
    return chromium.launch({
      args: [...chromiumBinary.default.args, ...STEALTH_ARGS],
      executablePath,
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({ headless: true, args: STEALTH_ARGS });
}

// Applied to a fresh context/page before navigation. Patches the handful of
// properties anti-bot scripts commonly probe to detect a headless/automated browser.
export async function applyStealth(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    window.chrome = window.chrome || { runtime: {} };
  });
}
