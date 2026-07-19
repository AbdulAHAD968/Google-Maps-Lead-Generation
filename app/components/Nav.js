"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Calendar,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import SpikeMark from "./SpikeMark";

const HIDDEN_ON = [
  "/tools/google-maps-leads",
  "/leads",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/change-password",
];

const links = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/leads", label: "Leads" },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const drawerTriggerRef = useRef(null);

  useEffect(() => {
    let lastY = window.scrollY;
    const handler = () => {
      const y = window.scrollY;
      if (y <= 0) setScrolled(false);
      else if (y > lastY) setScrolled(true);
      else setScrolled(false);
      lastY = y;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (HIDDEN_ON.includes(pathname)) return null;

  const openDrawer = () => {
    setDrawerOpen(true);
    setMobileOpen(false);
  };
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Layout spacer */}
      <div style={{ height: 72 }} aria-hidden="true" />

      <div
        style={{
          position: "fixed",
          top: 16,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Expanded nav */}
        <nav
          aria-label="Main navigation"
          className="expanded-nav"
          style={{
            pointerEvents: scrolled ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--color-canvas)",
            border: "1px solid var(--color-hairline)",
            borderRadius: 14,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            padding: "8px 10px 8px 20px",
            opacity: scrolled ? 0 : 1,
            transform: scrolled ? "translateY(-6px)" : "translateY(0px)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            position: "absolute",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              textDecoration: "none",
              marginRight: 24,
              flexShrink: 0,
            }}
          >
            <SpikeMark />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              Mapleads
            </span>
          </Link>

          <div
            className="nav-links-row"
            style={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 13px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color:
                    pathname === l.href
                      ? "var(--color-ink)"
                      : "var(--color-muted)",
                  borderRadius: 8,
                  backgroundColor:
                    pathname === l.href
                      ? "var(--color-surface-card)"
                      : "transparent",
                  textDecoration: "none",
                  transition: "color 0.15s, background-color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: 16,
            }}
          >
            <button
              ref={drawerTriggerRef}
              className="try-free-nav"
              onClick={openDrawer}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 500,
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background-color 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-primary-active)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-primary)")
              }
            >
              Get in touch
            </button>

            <button
              className="hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              style={{
                background: "none",
                border: "1px solid var(--color-hairline)",
                borderRadius: 8,
                padding: 7,
                cursor: "pointer",
                color: "var(--color-ink)",
                display: "none",
                alignItems: "center",
              }}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>

        {/* Pill nav (scrolled) */}
        <div
          style={{
            pointerEvents: scrolled ? "auto" : "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--color-surface-dark)",
            borderRadius: 9999,
            padding: "7px 8px 7px 14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "translateY(0px)" : "translateY(-10px)",
            transition: "opacity 0.28s ease, transform 0.28s ease",
            position: "absolute",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            href="/"
            aria-label="Mapleads home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              textDecoration: "none",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.18)",
              marginRight: 4,
            }}
          >
            <SpikeMark dark />
          </Link>

          <button
            onClick={openDrawer}
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              padding: "7px 16px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-primary-active)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-primary)")
            }
          >
            Get in touch
          </button>

          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                backgroundColor: "rgba(255,255,255,0.09)",
                color:
                  pathname === l.href ? "#fff" : "rgba(255,255,255,0.75)",
                fontSize: 13,
                fontWeight: 500,
                padding: "7px 14px",
                borderRadius: 9999,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "background-color 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.16)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.09)")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && !scrolled && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: 16,
            right: 16,
            zIndex: 49,
            backgroundColor: "var(--color-canvas)",
            border: "1px solid var(--color-hairline)",
            borderRadius: 12,
            padding: "16px 20px 20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "11px 8px",
                fontSize: 15,
                fontWeight: 500,
                color:
                  pathname === l.href
                    ? "var(--color-primary)"
                    : "var(--color-ink)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-hairline)",
              }}
            >
              {l.label}
            </Link>
          ))}

          <button
            onClick={openDrawer}
            style={{
              display: "block",
              width: "100%",
              marginTop: 16,
              padding: "12px 16px",
              borderRadius: 8,
              textAlign: "center",
              fontSize: 14,
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Get in touch
          </button>
        </div>
      )}

      {/* Get in touch drawer */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Get in touch"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "var(--color-canvas)",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.18)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 20px",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--color-hairline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SpikeMark />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  lineHeight: 1.2,
                }}
              >
                Mapleads
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>
                by Seven Labs
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close"
            style={{
              background: "none",
              border: "1px solid var(--color-hairline)",
              borderRadius: 8,
              padding: 7,
              cursor: "pointer",
              color: "var(--color-muted)",
              display: "flex",
              alignItems: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-ink)";
              e.currentTarget.style.color = "var(--color-ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-hairline)";
              e.currentTarget.style.color = "var(--color-muted)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "32px 24px", flex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              fontWeight: 500,
              color: "var(--color-ink)",
              margin: "0 0 10px",
              lineHeight: 1.15,
            }}
          >
            Let&apos;s get your pipeline filled.
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--color-muted)",
              lineHeight: 1.7,
              margin: "0 0 32px",
            }}
          >
            Questions about Mapleads or want a custom lead-gen setup? Pick the
            channel that works best for you.
          </p>

          <a
            href="https://calendly.com/sevenlabsolutions/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-card"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: 20,
              borderRadius: 12,
              border: "1px solid var(--color-hairline)",
              backgroundColor: "var(--color-surface-card)",
              textDecoration: "none",
              marginBottom: 12,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: "var(--color-canvas)",
                border: "1px solid var(--color-hairline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                flexShrink: 0,
              }}
            >
              <Calendar size={20} strokeWidth={1.6} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                Book a 30-min call
              </p>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  color: "var(--color-muted)",
                  lineHeight: 1.6,
                }}
              >
                Jump on a quick call to discuss your project, timeline, and
                goals.
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                }}
              >
                Schedule on Calendly <ArrowUpRight size={13} strokeWidth={2} />
              </span>
            </div>
          </a>

          <a
            href="mailto:sevenlabsolutions@gmail.com"
            className="drawer-card"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: 20,
              borderRadius: 12,
              border: "1px solid var(--color-hairline)",
              backgroundColor: "var(--color-surface-card)",
              textDecoration: "none",
              marginBottom: 12,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: "var(--color-canvas)",
                border: "1px solid var(--color-hairline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                flexShrink: 0,
              }}
            >
              <MessageSquare size={20} strokeWidth={1.6} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                Send us a message
              </p>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  color: "var(--color-muted)",
                  lineHeight: 1.6,
                }}
              >
                Prefer async? Email us and we&apos;ll reply within one
                business day.
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                }}
              >
                sevenlabsolutions@gmail.com{" "}
                <ArrowUpRight size={13} strokeWidth={2} />
              </span>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        .drawer-card:hover { border-color: var(--color-primary) !important; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        @media (max-width: 768px) {
          .nav-links-row { display: none !important; }
          .hamburger     { display: flex !important; }
          .try-free-nav  { display: none !important; }
          .expanded-nav  { padding-right: 10px !important; max-width: calc(100vw - 32px) !important; }
        }
      `}</style>
    </>
  );
}
