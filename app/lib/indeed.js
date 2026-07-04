import { chromium } from "playwright";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const FIELD_TIMEOUT = 1000;

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

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: "en-US",
      viewport: { width: 1366, height: 900 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(FIELD_TIMEOUT);

    for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
      const url = new URL("https://www.indeed.com/jobs");
      url.searchParams.set("q", keyword);
      if (location) url.searchParams.set("l", location);
      url.searchParams.set("start", String(pageIndex * resultsPerPage));

      let response;
      try {
        response = await page.goto(url.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });
      } catch {
        break;
      }

      if (!response || !response.ok()) {
        if (jobs.length > 0) break;
        throw new Error(
          `Indeed blocked this request (status ${response?.status() ?? "unknown"}). Try again later or reduce request volume.`
        );
      }

      await page.waitForTimeout(1200);

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
      await page.waitForTimeout(800);
    }

    return jobs.slice(0, maxResults);
  } finally {
    await browser.close();
  }
}
