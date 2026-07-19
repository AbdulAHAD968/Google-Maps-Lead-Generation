import { launchBrowser } from "./browserLauncher";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function safeInnerText(locator, timeout = 2000) {
  try {
    return (await locator.innerText({ timeout })).trim();
  } catch {
    return "";
  }
}

export async function deepExtractGoogleMaps(mapsUrl) {
  if (!mapsUrl) {
    throw new Error("No Google Maps URL to scrape");
  }

  const browser = await launchBrowser();
  const result = {
    description: "",
    photosCountDetailed: null,
    ownerRespondsToReviews: false,
    recentReviews: [],
    partial: false,
  };

  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    await page.goto(mapsUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Dismiss EU cookie consent if it appears
    try {
      const consentBtn = page.getByRole("button", { name: /accept all|i agree/i });
      await consentBtn.click({ timeout: 3000 });
    } catch {
      /* no consent dialog */
    }

    await page.waitForTimeout(2000);

    // Business description
    result.description = await safeInnerText(
      page.locator('div[data-attrid="description"], button[jsaction*="description"] div').first()
    );

    // Photos count (button label usually reads "N photos")
    try {
      const photosLabel = await safeInnerText(
        page.locator('button[aria-label*="Photo"]').first()
      );
      const match = photosLabel.match(/[\d,]+/);
      if (match) result.photosCountDetailed = parseInt(match[0].replace(/,/g, ""), 10);
    } catch {
      /* ignore */
    }

    // Open reviews tab
    try {
      const reviewsTab = page.getByRole("tab", { name: /Reviews/i }).first();
      await reviewsTab.click({ timeout: 5000 });
      await page.waitForTimeout(1500);

      const scrollable = page.locator('div[aria-label*="Reviews for"], div.m6QErb').first();
      for (let i = 0; i < 3; i++) {
        await scrollable.evaluate((el) => el.scrollBy(0, 900)).catch(() => {});
        await page.waitForTimeout(700);
      }

      const reviewCards = await page.locator("div[data-review-id]").all();

      for (const card of reviewCards.slice(0, 8)) {
        const author = await safeInnerText(card.locator("button, div").first());
        const ratingLabel = await card
          .locator('span[role="img"]')
          .first()
          .getAttribute("aria-label")
          .catch(() => null);
        const rating = ratingLabel ? parseFloat(ratingLabel) || null : null;
        const text = await safeInnerText(card.locator("span").last());
        const relativeDate = await safeInnerText(
          card.locator("span.rsqaWe, span[class*='date']").first()
        );

        const ownerReplyMarker = await card
          .locator("text=/Response from the owner/i")
          .first()
          .isVisible()
          .catch(() => false);
        if (ownerReplyMarker) result.ownerRespondsToReviews = true;

        if (author) {
          result.recentReviews.push({ author, rating, text, relativeDate });
        }
      }
    } catch {
      result.partial = true;
    }

    return result;
  } finally {
    await browser.close();
  }
}
