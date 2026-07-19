import * as cheerio from "cheerio";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const IGNORED_DOMAINS = ["example.com", "sentry.io", "wixpress.com", "godaddy.com"];
const CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us"];

function isUsableEmail(email) {
  const lower = email.toLowerCase();
  if (IGNORED_DOMAINS.some((d) => lower.endsWith(`@${d}`) || lower.includes(`.${d}`))) return false;
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(lower)) return false;
  return true;
}

async function fetchHtml(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractEmailFromHtml(html) {
  const $ = cheerio.load(html);

  const mailto = $('a[href^="mailto:"]').first().attr("href");
  if (mailto) {
    const candidate = mailto.replace(/^mailto:/i, "").split("?")[0].trim();
    if (candidate && isUsableEmail(candidate)) return candidate;
  }

  const bodyText = $("body").text();
  const match = bodyText.match(EMAIL_REGEX);
  if (match && isUsableEmail(match[0])) return match[0];

  return null;
}

/**
 * Best-effort: visit a business's website (and a couple common contact pages)
 * looking for a publicly listed email address. Returns null on any failure -
 * this should never block the caller's larger extraction flow.
 */
export async function extractEmailFromWebsite(website) {
  if (!website) return null;

  let base;
  try {
    base = new URL(website);
  } catch {
    return null;
  }

  const candidates = [base.toString(), ...CONTACT_PATHS.map((p) => new URL(p, base).toString())];

  for (const url of candidates) {
    const html = await fetchHtml(url);
    if (!html) continue;
    const email = extractEmailFromHtml(html);
    if (email) return email;
  }

  return null;
}
