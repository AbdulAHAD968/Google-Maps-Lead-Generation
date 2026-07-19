import { launchBrowser, applyStealth } from "./browserLauncher";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const FIELD_TIMEOUT = 1000;
const MAX_PAGE_RETRIES = 2;

function jitter(baseMs, spreadMs) {
  return baseMs + Math.floor(Math.random() * spreadMs);
}

async function safeText(locator) {
  try {
    return (await locator.innerText({ timeout: FIELD_TIMEOUT })).trim();
  } catch {
    return "";
  }
}

async function safeAttr(locator, attr) {
  try {
    return await locator.getAttribute(attr, { timeout: FIELD_TIMEOUT });
  } catch {
    return null;
  }
}

export async function searchIndeedJobs({ keyword, location, maxResults = 50 }) {
  const jobs = [];
  const resultsPerPage = 15;
  const pages = Math.ceil(Math.min(maxResults, 100) / resultsPerPage);

  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: "en-US",
      viewport: { width: 1366, height: 900 },
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();
    await applyStealth(page);
    page.setDefaultTimeout(FIELD_TIMEOUT);

    for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
      const url = new URL("https://www.indeed.com/jobs");
      url.searchParams.set("q", keyword);
      if (location) url.searchParams.set("l", location);
      url.searchParams.set("start", String(pageIndex * resultsPerPage));

      let response;
      let attempt = 0;
      while (attempt <= MAX_PAGE_RETRIES) {
        try {
          response = await page.goto(url.toString(), {
            waitUntil: "domcontentloaded",
            timeout: 20000,
          });
        } catch {
          response = null;
        }

        if (response && response.ok()) break;
        if (response?.status() !== 403) break;

        attempt += 1;
        if (attempt <= MAX_PAGE_RETRIES) {
          await page.waitForTimeout(jitter(2000, 2000) * attempt);
        }
      }

      if (!response || !response.ok()) {
        if (jobs.length > 0) break;
        throw new Error(
          `Indeed blocked this request (status ${response?.status() ?? "unknown"}). This is Indeed's anti-bot detection, not an app error - it may pass on retry, with a smaller batch, or not at all from this server's IP range.`
        );
      }

      await page.waitForTimeout(jitter(1200, 800));

      const cards = await page
        .locator("div.job_seen_beacon, td.resultContent")
        .all();

      if (cards.length === 0) break;

      for (const card of cards) {
        const title = await safeText(card.locator("h2.jobTitle span").first());
        const company = await safeText(
          card.locator('span[data-testid="company-name"]')
        );
        const jobLocation = await safeText(
          card.locator('div[data-testid="text-location"]')
        );
        const snippet = (
          await safeText(card.locator('div[class*="job-snippet"]'))
        ).replace(/\s+/g, " ");
        const salary = await safeText(
          card
            .locator(
              'div[class*="salary-snippet"], div[data-testid="attribute_snippet_testid"]'
            )
            .first()
        );
        const relativeLink = await safeAttr(
          card.locator("h2.jobTitle a"),
          "href"
        );
        const jobUrl = relativeLink
          ? new URL(relativeLink, "https://www.indeed.com").toString()
          : "";
        const postedText = await safeText(card.locator('span[class*="date"]'));

        if (title && company) {
          jobs.push({
            jobTitle: title,
            company,
            location: jobLocation,
            snippet,
            salary,
            jobUrl,
            postedText,
          });
        }

        if (jobs.length >= maxResults) break;
      }

      if (jobs.length >= maxResults) break;
      await page.waitForTimeout(jitter(800, 700));
    }

    return jobs.slice(0, maxResults);
  } finally {
    await browser.close();
  }
}
