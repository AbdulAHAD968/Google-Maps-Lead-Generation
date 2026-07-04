"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSparkles,
  HiOutlineClipboardCopy,
  HiOutlineMail,
  HiOutlineChatAlt,
  HiOutlineExternalLink,
} from "react-icons/hi";
import Drawer from "@/app/components/Drawer";
import SpikeMark from "@/app/components/SpikeMark";

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "interested",
  "meeting_booked",
  "proposal_sent",
  "won",
  "lost",
];

const OUTREACH_TYPES = [
  { key: "email", label: "Email", icon: HiOutlineMail },
  { key: "dm", label: "DM", icon: HiOutlineChatAlt },
  { key: "linkedin", label: "LinkedIn", icon: HiOutlineExternalLink },
];

export default function LeadsManagerPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [status, setStatus] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);

  const [outreachType, setOutreachType] = useState("email");
  const [offer, setOffer] = useState("");
  const [generating, setGenerating] = useState(false);
  const [outreachText, setOutreachText] = useState("");
  const [outreachError, setOutreachError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch("/api/leads/campaigns");
    const data = await res.json();
    setCampaigns(data.campaigns || []);
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCampaign) params.set("campaignQuery", activeCampaign);
    if (search) params.set("search", search);
    if (minRating) params.set("minRating", String(minRating));
    if (hasWebsite) params.set("hasWebsite", "true");
    if (status) params.set("status", status);
    if (favoriteOnly) params.set("favorite", "true");

    const res = await fetch(`/api/leads?${params.toString()}`);
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }, [activeCampaign, search, minRating, hasWebsite, status, favoriteOnly]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLead = async (id, updates) => {
    setLeads((prev) =>
      prev.map((l) => (l._id === id ? { ...l, ...updates } : l))
    );
    setActiveLead((prev) =>
      prev && prev._id === id ? { ...prev, ...updates } : prev
    );
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const openLead = (lead) => {
    setActiveLead(lead);
    setOutreachText("");
    setOutreachError("");
    setCopied(false);
  };

  const generateOutreach = async () => {
    if (!activeLead) return;
    setGenerating(true);
    setOutreachError("");
    setOutreachText("");
    try {
      const res = await fetch(`/api/leads/${activeLead._id}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: outreachType, offer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutreachText(data.message);
    } catch (err) {
      setOutreachError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyOutreach = () => {
    if (!outreachText) return;
    navigator.clipboard.writeText(outreachText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportCsv = () => {
    if (!leads.length) return;
    const columns = [
      "businessName",
      "category",
      "address",
      "phone",
      "website",
      "rating",
      "reviewsCount",
      "status",
      "campaignQuery",
    ];
    const rows = [
      columns.join(","),
      ...leads.map((l) =>
        columns
          .map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterCount = [
    search,
    minRating,
    hasWebsite,
    status,
    favoriteOnly,
  ].filter(Boolean).length;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas">
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-card hover:text-ink"
            aria-label="Back to tools"
          >
            <HiOutlineArrowLeft size={16} />
          </Link>
          <div className="h-5 w-px bg-hairline" />
          <SpikeMark />
          <div className="leading-tight">
            <p className="font-body text-sm font-medium text-ink">
              Lead Manager
            </p>
            <p className="font-body text-[12px] text-muted-soft">
              {leads.length} leads {activeCampaign ? "in this campaign" : "total"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-10 items-center gap-2 rounded-md border border-hairline bg-canvas px-4 font-body text-sm font-medium text-ink hover:bg-surface-card"
          >
            <HiOutlineFilter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1 font-body text-[11px] font-medium text-on-primary">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={exportCsv}
            className="flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-body text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            <HiOutlineDownload size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Body: campaign rail + table */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-hairline p-4 lg:flex">
          <p className="mb-2 px-2 font-body text-[12px] font-medium uppercase tracking-[1px] text-muted-soft">
            Campaigns
          </p>
          <button
            onClick={() => setActiveCampaign("")}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-left font-body text-sm ${
              activeCampaign === ""
                ? "bg-surface-card font-medium text-ink"
                : "text-body hover:bg-surface-card/60"
            }`}
          >
            All campaigns
          </button>
          {campaigns.map((c) => (
            <button
              key={c.campaignQuery}
              onClick={() => setActiveCampaign(c.campaignQuery)}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-left font-body text-sm ${
                activeCampaign === c.campaignQuery
                  ? "bg-surface-card font-medium text-ink"
                  : "text-body hover:bg-surface-card/60"
              }`}
            >
              <span className="truncate">{c.campaignQuery}</span>
              <span className="ml-2 shrink-0 font-code text-[12px] text-muted-soft">
                {c.count}
              </span>
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[760px] border-collapse font-body text-sm">
            <thead className="sticky top-0 bg-surface-card">
              <tr className="border-b border-hairline text-left text-muted">
                <th className="px-4 py-3 font-medium">Fav</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No leads match these filters yet.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr
                    key={l._id}
                    onClick={() => openLead(l)}
                    className="cursor-pointer border-b border-hairline-soft hover:bg-surface-card/40"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLead(l._id, { favorite: !l.favorite });
                        }}
                        aria-label="Toggle favorite"
                      >
                        <HiOutlineStar
                          className={
                            l.favorite
                              ? "fill-accent-amber text-accent-amber"
                              : "text-muted-soft"
                          }
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{l.businessName}</p>
                      <p className="text-[12px] text-muted-soft">
                        {l.category}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {l.rating || "-"} ({l.reviewsCount})
                    </td>
                    <td className="px-4 py-3 text-body">
                      <div className="flex flex-col gap-1">
                        {l.phone && (
                          <span className="flex items-center gap-1">
                            <HiOutlinePhone size={13} /> {l.phone}
                          </span>
                        )}
                        {l.website && (
                          <span className="flex items-center gap-1 text-primary">
                            <HiOutlineGlobeAlt size={13} /> Website
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-pill bg-surface-card px-2 py-1 font-body text-[12px] capitalize text-body">
                        {l.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter leads"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Search
            </label>
            <div className="relative">
              <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Business or category"
                className="h-10 w-full rounded-md border border-hairline bg-canvas pl-9 pr-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Min rating
            </label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 font-body text-sm text-body">
            <input
              type="checkbox"
              checked={hasWebsite}
              onChange={(e) => setHasWebsite(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Has website
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-body">
            <input
              type="checkbox"
              checked={favoriteOnly}
              onChange={(e) => setFavoriteOnly(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Favorites only
          </label>

          <button
            onClick={() => setFiltersOpen(false)}
            className="mt-2 flex h-10 items-center justify-center rounded-md bg-primary px-5 font-body text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            Apply
          </button>
        </div>
      </Drawer>

      {/* Lead detail + outreach drawer */}
      <Drawer
        open={!!activeLead}
        onClose={() => setActiveLead(null)}
        title={activeLead?.businessName || "Lead"}
      >
        {activeLead && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-body text-sm text-muted">
                {activeLead.category} · {activeLead.city}
              </p>
              <div className="mt-2 flex flex-col gap-1 font-body text-sm text-body">
                {activeLead.phone && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlinePhone size={14} /> {activeLead.phone}
                  </span>
                )}
                {activeLead.website && (
                  <a
                    href={activeLead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary"
                  >
                    <HiOutlineGlobeAlt size={14} /> {activeLead.website}
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <HiOutlineStar size={14} className="text-accent-amber" />
                  {activeLead.rating || "-"} ({activeLead.reviewsCount} reviews)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-body text-sm font-medium text-ink">
                  Status
                </label>
                <select
                  value={activeLead.status}
                  onChange={(e) =>
                    updateLead(activeLead._id, { status: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-body text-sm font-medium text-ink">
                  Favorite
                </label>
                <button
                  onClick={() =>
                    updateLead(activeLead._id, {
                      favorite: !activeLead.favorite,
                    })
                  }
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-hairline bg-canvas font-body text-sm text-ink hover:bg-surface-card"
                >
                  <HiOutlineStar
                    className={
                      activeLead.favorite
                        ? "fill-accent-amber text-accent-amber"
                        : "text-muted-soft"
                    }
                  />
                  {activeLead.favorite ? "Favorited" : "Add"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-body text-sm font-medium text-ink">
                Notes
              </label>
              <textarea
                defaultValue={activeLead.notes || ""}
                onBlur={(e) =>
                  updateLead(activeLead._id, { notes: e.target.value })
                }
                rows={3}
                placeholder="Internal notes about this lead..."
                className="w-full rounded-md border border-hairline bg-canvas p-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="border-t border-hairline pt-6">
              <p className="mb-3 flex items-center gap-2 font-body text-sm font-medium text-ink">
                <HiOutlineSparkles className="text-primary" />
                Quick personalized outreach
              </p>

              <div className="mb-3 flex gap-2">
                {OUTREACH_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setOutreachType(t.key)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 font-body text-[13px] font-medium ${
                      outreachType === t.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-hairline text-body hover:bg-surface-card"
                    }`}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="What are you offering? (optional, e.g. website redesign)"
                className="mb-3 h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />

              <button
                onClick={generateOutreach}
                disabled={generating}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
              >
                <HiOutlineSparkles size={16} />
                {generating ? "Writing..." : "Generate with AI"}
              </button>

              {outreachError && (
                <p className="mt-3 font-body text-sm text-error">
                  {outreachError}
                </p>
              )}

              {outreachText && (
                <div className="mt-4 rounded-md border border-hairline bg-surface-card p-3">
                  <pre className="whitespace-pre-wrap font-body text-[13px] leading-[1.6] text-ink">
                    {outreachText}
                  </pre>
                  <button
                    onClick={copyOutreach}
                    className="mt-3 flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-1.5 font-body text-[13px] font-medium text-ink hover:bg-surface-cream-strong"
                  >
                    <HiOutlineClipboardCopy size={14} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
