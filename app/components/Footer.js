"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SpikeMark from "./SpikeMark";

const HIDDEN_ON = ["/tools/google-maps-leads", "/leads"];

const columns = [
  {
    title: "Product",
    links: [
      { label: "Tools", href: "/tools" },
      { label: "Google Maps leads", href: "/tools" },
      { label: "Business manager", href: "/tools" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/" },
      { label: "Support", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <footer className="bg-surface-dark py-16 text-on-dark-soft">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 flex items-center gap-2">
          <SpikeMark dark />
          <span className="font-body text-[16px] font-semibold text-on-dark">
            Mapleads
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-body text-sm font-medium text-on-dark">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-on-dark-soft hover:text-on-dark"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="font-body text-sm text-on-dark-soft">
            © {new Date().getFullYear()} Mapleads. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
