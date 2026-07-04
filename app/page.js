import Link from "next/link";
import {
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineLightningBolt,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from "react-icons/hi";

const features = [
  {
    icon: HiOutlineMap,
    title: "Google Maps scraping",
    description:
      "Pull business name, phone, website, address, rating and review count for any search + location combo - at scale.",
  },
  {
    icon: HiOutlineFilter,
    title: "Smart filtering",
    description:
      "Filter leads by rating, review volume, category and missing-website signals to zero in on your best prospects.",
  },
  {
    icon: HiOutlineDownload,
    title: "One-click export",
    description:
      "Export clean, deduplicated CSV lists ready to drop straight into your CRM or outreach sequence.",
  },
];

const steps = [
  { n: "01", title: "Pick a niche + location", description: "Tell us the business category and area you want leads from." },
  { n: "02", title: "We scrape Google Maps", description: "Our engine pulls verified business data in minutes, not hours." },
  { n: "03", title: "Export & close deals", description: "Download your list and start outreach with Google Business Manager." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-canvas">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-[96px]">
          <div>
            <span className="mb-6 inline-flex items-center rounded-pill bg-surface-card px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[1.5px] text-body">
              Local lead generation
            </span>
            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-[-1px] text-ink md:text-[64px]">
              Turn Google Maps into your next lead list
            </h1>
            <p className="mt-6 max-w-md font-body text-lg leading-[1.55] text-body">
              Mapleads finds verified local businesses on Google Maps and helps
              you manage them through Google Business Manager - so you spend
              time closing, not searching.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/tools"
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-sm font-medium text-on-primary hover:bg-primary-active"
              >
                Explore tools
                <HiOutlineArrowRight />
              </Link>
              <Link
                href="/tools"
                className="flex h-10 items-center justify-center rounded-md border border-hairline bg-canvas px-5 font-body text-sm font-medium text-ink"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-surface-dark p-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-error/70" />
              <span className="h-3 w-3 rounded-full bg-warning/70" />
              <span className="h-3 w-3 rounded-full bg-success/70" />
            </div>
            <div className="rounded-lg bg-surface-dark-soft p-6 font-code text-sm leading-[1.6] text-on-dark-soft">
              <p><span className="text-accent-teal">query</span>: <span className="text-accent-amber">&quot;plumbers in austin, tx&quot;</span></p>
              <p className="mt-2">→ 214 businesses found</p>
              <p>→ 189 with phone numbers</p>
              <p>→ 96 missing a website</p>
              <p className="mt-4 text-on-dark">exporting leads.csv ...</p>
              <p className="text-success">done in 8.4s</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.1] tracking-[-1px] text-ink md:text-5xl">
            Everything you need to fill your pipeline
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg bg-surface-card p-8"
              >
                <f.icon className="mb-4 text-primary" size={28} />
                <h3 className="font-body text-lg font-medium text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 font-body text-base leading-[1.55] text-body">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product mockup - dark */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 pb-24">
          <div className="rounded-lg bg-surface-dark p-8 md:p-[48px]">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-pill bg-surface-dark-elevated px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[1.5px] text-on-dark-soft">
                  <HiOutlineOfficeBuilding />
                  Google Business Manager
                </span>
                <h3 className="mt-6 font-display text-3xl font-medium leading-[1.15] tracking-[-0.5px] text-on-dark md:text-4xl">
                  Manage every business profile from one place
                </h3>
                <p className="mt-4 font-body text-base leading-[1.55] text-on-dark-soft">
                  Once you&apos;ve found your leads, keep every Google Business
                  Profile organized, claimed and up to date without switching
                  tabs.
                </p>
              </div>
              <div className="rounded-lg bg-surface-dark-soft p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-body text-sm font-medium text-on-dark">Business Profile</span>
                  <span className="rounded-pill bg-success/20 px-3 py-1 font-body text-[12px] font-medium text-success">Verified</span>
                </div>
                <div className="mt-4 flex flex-col gap-3 font-body text-sm text-on-dark-soft">
                  <div className="flex justify-between"><span>Name</span><span className="text-on-dark">Austin Plumbing Co.</span></div>
                  <div className="flex justify-between"><span>Rating</span><span className="text-on-dark">4.8 ★ (212)</span></div>
                  <div className="flex justify-between"><span>Category</span><span className="text-on-dark">Plumber</span></div>
                  <div className="flex justify-between"><span>Status</span><span className="text-accent-teal">Active</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 pb-24">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.1] tracking-[-1px] text-ink md:text-5xl">
            How it works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-hairline pt-6">
                <span className="font-code text-sm text-muted-soft">{s.n}</span>
                <h3 className="mt-2 font-body text-lg font-medium text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 font-body text-base leading-[1.55] text-body">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coral callout CTA */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 pb-24">
          <div className="flex flex-col items-start gap-6 rounded-lg bg-primary p-8 md:flex-row md:items-center md:justify-between md:p-[64px]">
            <div>
              <HiOutlineLightningBolt className="mb-4 text-on-primary" size={28} />
              <h2 className="font-display text-3xl font-medium leading-[1.2] tracking-[-0.3px] text-on-primary md:text-[28px]">
                Start building your lead list today
              </h2>
              <p className="mt-2 max-w-md font-body text-base text-on-primary/90">
                Free to try. No credit card required.
              </p>
            </div>
            <Link
              href="/tools"
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-canvas px-5 font-body text-sm font-medium text-ink hover:bg-surface-soft"
            >
              <HiOutlineShieldCheck />
              Get started free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
