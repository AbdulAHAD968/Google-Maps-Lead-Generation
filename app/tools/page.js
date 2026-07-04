import Link from "next/link";
import {
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineArrowRight,
  HiOutlineClock,
} from "react-icons/hi";

const tools = [
  {
    icon: HiOutlineMap,
    name: "Google Maps Lead Generation",
    description:
      "Click a point on the map, set your radius and filters, and pull verified leads - name, phone, address, website, rating and reviews - straight from Google Maps.",
    status: "available",
    href: "/tools/google-maps-leads",
  },
  {
    icon: HiOutlineBriefcase,
    name: "Indeed Hiring Leads",
    description:
      "Search Indeed job postings by role and location to find companies actively hiring - a strong buying-intent signal for outreach.",
    status: "available",
    href: "/tools/indeed-leads",
  },
  {
    icon: HiOutlineOfficeBuilding,
    name: "Google Business Manager",
    description:
      "Organize, claim and monitor Google Business Profiles for every lead you generate, all from a single dashboard.",
    status: "coming_soon",
    href: "#",
  },
];

export default function ToolsPage() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <span className="mb-6 inline-flex items-center rounded-pill bg-surface-card px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[1.5px] text-body">
          Tools
        </span>
        <h1 className="max-w-2xl font-display text-5xl font-medium leading-[1.05] tracking-[-1px] text-ink md:text-[64px]">
          Everything we&apos;re building
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg leading-[1.55] text-body">
          A growing set of tools to help you find and manage local business
          leads. More are on the way.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-col rounded-lg bg-surface-card p-8"
            >
              <tool.icon className="mb-4 text-primary" size={28} />
              <h3 className="font-body text-lg font-medium text-ink">
                {tool.name}
              </h3>
              <p className="mt-2 flex-1 font-body text-base leading-[1.55] text-body">
                {tool.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-pill px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[1.5px] ${
                    tool.status === "available"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-cream-strong text-muted"
                  }`}
                >
                  {tool.status === "available" ? "Available" : "Coming soon"}
                </span>
                {tool.status === "available" ? (
                  <Link
                    href={tool.href}
                    className="flex items-center gap-1 font-body text-sm font-medium text-primary"
                  >
                    Open
                    <HiOutlineArrowRight size={16} />
                  </Link>
                ) : (
                  <span className="font-body text-sm font-medium text-muted-soft">
                    Open
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-col rounded-lg border border-hairline bg-canvas p-8">
            <HiOutlineClock className="mb-4 text-muted" size={28} />
            <h3 className="font-body text-lg font-medium text-ink">
              More tools coming soon
            </h3>
            <p className="mt-2 flex-1 font-body text-base leading-[1.55] text-body">
              We&apos;re actively building out the toolkit. Check back for new
              additions.
            </p>
            <span className="mt-6 inline-flex w-fit items-center rounded-pill bg-surface-card px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
              Roadmap
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
