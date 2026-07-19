# Mapleads

Local business lead generation platform. Search Google Maps by clicking a
point on an interactive map, pull verified business leads, run a deeper
Playwright-based scan for review/activity signals, manage every lead you've
collected in one place, and generate personalized outreach with AI. A second
tool searches Indeed job postings to surface companies that are actively
hiring (a buying-intent signal).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Tailwind CSS v4** with a custom design system (see `DESIGN.md`)
- **MongoDB** via Mongoose for lead storage
- **Google Maps Platform** - Places API (New), Geocoding API, Maps JavaScript API
- **Playwright** (Chromium) for deep-extraction scraping (Google Maps reviews/activity signals, Indeed job listings)
- **OpenAI API** for AI-generated outreach messages
- **react-icons** and **lucide-react** for icons

## Features

### `/` - Landing page
Marketing page for the product, built against the design tokens in `DESIGN.md`.

### `/tools` - Tools directory
Lists every tool available in the platform.

### `/tools/google-maps-leads` - Google Maps Lead Generation
Full-screen map interface. Click a point on the map (or use the search box to
jump to a city/address), a drawer slides in from the right to configure:

- One or more keywords (comma-separated, e.g. `Dentist, Orthodontist`)
- Search radius (km)
- Max results (capped at 60 per the Places API Text Search limit)
- Minimum rating / minimum review count
- Has website / has phone / open now filters

Results appear in a bottom sheet with a "Deep scan" action per lead. Deep scan
launches a headless Chromium browser via Playwright, opens the listing on
Google Maps directly, and extracts data the Places API doesn't expose:
business description, whether the owner responds to reviews, recent review
text, and detailed photo count. All results are upserted into MongoDB, keyed
by Google's `placeId` so re-running a search updates existing leads instead
of duplicating them.

### `/tools/indeed-leads` - Indeed Hiring Leads
Searches Indeed job postings by role and location via a Playwright-driven
scraper (Indeed has no public search API and blocks plain HTTP requests).
Companies actively hiring are a buying-intent signal - useful for outreach
targeting growing businesses. Results are deduplicated by job URL and stored
in MongoDB.

### `/leads` - Lead Manager
Full-screen dashboard of every lead ever collected, across every campaign
(a campaign = one search run, grouped by keyword + location). Filter by
search term, rating, status, has-website, and favorites. Click any lead to
open a detail drawer where you can:

- Update status (new / contacted / interested / meeting booked / proposal
  sent / won / lost)
- Toggle favorite
- Add internal notes
- Generate a personalized outreach message (email, DM, or LinkedIn) with AI,
  built from that lead's actual data (rating, website presence, review
  activity, description) so it references something specific rather than
  reading as generic copy

Export any filtered view to CSV from the top bar.

## Known limitations

- **Places API results are capped at 60** per search (Google's Text Search
  pagination limit - 3 pages of 20). Run narrower searches (smaller radius,
  more specific keyword) to stay under the cap for a given area.
- **Playwright scraping (deep scan, Indeed search) is inherently fragile.**
  Both Google Maps and Indeed can change their page markup at any time,
  which will break the CSS selectors in `app/lib/mapsScraper.js` and
  `app/lib/indeed.js`. Both scrapers use short per-field timeouts so a
  broken selector fails fast (skips that field) rather than hanging.
- **Neither scraper is officially supported by Google or Indeed.** Automated
  browsing of their pages can be rate-limited or blocked (Indeed in
  particular runs bot detection that returns HTTP 403 under load). This is
  best used for occasional, targeted lookups - not high-volume automation -
  unless you add a proxy layer.
- **The Places API has real per-request cost** beyond Google's monthly free
  credit. See "Google Cloud setup" below.

## Getting started

### 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

The Playwright install step downloads a Chromium binary (~150-300MB) used
for the deep-scan and Indeed scraping features. It only needs to run once
per machine/environment.

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

See "Environment variables" below for what each one does and where to get it.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | Connection string for your MongoDB database (Atlas or self-hosted). All leads, campaigns, and statuses are stored here. |
| `GOOGLE_MAPS_API_KEY` | Yes | Server-side Google Maps Platform key. Needs **Places API (New)** and **Geocoding API** enabled. Used for lead search and reverse-geocoding. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | The same key (or a separate one), exposed to the browser to render the interactive map (**Maps JavaScript API**). Since this is visible in page source, restrict it by HTTP referrer in the Cloud Console to your domain(s). |
| `OPENAI_API_KEY` | Yes, for outreach generation | Used by the Lead Manager's "Generate with AI" feature to draft personalized email/DM/LinkedIn messages. The rest of the app works without it; only outreach generation will fail. |

## Google Cloud setup

1. Create a dedicated GCP project for this app (don't reuse an unrelated project - keeps billing and API scope clean).
2. Link a Cloud Billing account to the project (`console.cloud.google.com/billing`). Google grants **$200/month of Maps Platform usage credit automatically** - most development and light production usage stays within this.
3. Enable exactly these APIs under **APIs & Services → Library**:
   - Places API (New)
   - Geocoding API
   - Maps JavaScript API
4. Create an API key under **APIs & Services → Credentials**.
5. Restrict the key:
   - **API restrictions**: limit to just the 3 APIs above.
   - **Application restrictions**: use **IP addresses** for the server-side key (`GOOGLE_MAPS_API_KEY`), and **Websites** (your domain) for the browser-exposed key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) if you split them into two separate keys - recommended for production.

### Cost notes

- **Places API (New) Text Search** is the main cost driver - roughly $25-35 per 1,000 places at current pricing, depending on which fields are requested (this app only requests the fields it actually stores, to keep cost down).
- **Geocoding API** and **Maps JavaScript API** are comparatively cheap per call.
- **The Indeed and deep-scan scrapers have no API cost** - they run a local/server-side Chromium browser instead - but are correspondingly slower and less reliable than a real API.

## Project structure

```
app/
  page.js                        Landing page
  layout.js                      Root layout, fonts, nav/footer
  globals.css                    Design tokens (colors, fonts, radii)
  components/
    Nav.js, Footer.js            Site chrome (hidden on full-screen tool pages)
    Drawer.js                    Reusable right-side slide-in panel
    SpikeMark.js                 Brand mark
    LocationSearchBox.js         Geocode-and-pan search box (map tool)
    PointMarker.js, RadiusCircle.js   Map overlays (@vis.gl/react-google-maps)
  lib/
    mongodb.js                   Mongoose connection (cached across hot reloads)
    googleMaps.js                Places API (New) + Geocoding API client
    mapsScraper.js                Playwright deep-extraction for Google Maps listings
    indeed.js                    Playwright-based Indeed job search scraper
  models/
    Lead.js                      Google Maps lead schema
    IndeedLead.js                Indeed job listing schema
  tools/
    page.js                      Tools directory
    google-maps-leads/page.js    Map-based lead search UI
    indeed-leads/page.js         Indeed search UI
  leads/
    page.js                      Lead Manager dashboard
  api/
    leads/route.js                GET   - list/filter leads
    leads/search/route.js         POST  - run a Google Maps search
    leads/campaigns/route.js      GET   - distinct campaigns with counts
    leads/[id]/route.js           PATCH - update status/favorite/notes
    leads/[id]/deep-extract/route.js  POST - Playwright deep scan for one lead
    leads/[id]/outreach/route.js  POST - generate AI outreach message
    indeed/search/route.js        POST  - run an Indeed search
    geocode/route.js              GET   - geocode a location string
```

## Roadmap

Not yet built (see the original product spec this was scoped from):

- Website crawling + email/contact extraction for leads with a website
- AI website audit (speed, SEO, accessibility, design, trust signals)
- Tech stack detection (WordPress, Shopify, GA4, Meta Pixel, etc.)
- Opportunity/fit scoring
- Screenshot capture and Lighthouse audits
- Multi-country/recurring campaign scheduling with change detection
- Aggregate dashboard (businesses scanned, average scores, response rate, etc.)
