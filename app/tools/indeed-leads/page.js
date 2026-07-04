"use client";

import { useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineDownload,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineExternalLink,
} from "react-icons/hi";

export default function IndeedLeadsPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);

  const runSearch = async () => {
    if (!keyword) {
      setError("Enter a keyword to search Indeed job listings.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/indeed/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, location, maxResults }),
        signal: AbortSignal.timeout(55000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setLeads(data.leads);
    } catch (err) {
      setError(
        err.name === "TimeoutError" || err.name === "AbortError"
          ? "Indeed took too long to respond (over 55s) and the request was cancelled. Try a smaller max results value."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!leads.length) return;
    const columns = [
      "company",
      "jobTitle",
      "location",
      "salary",
      "postedText",
      "jobUrl",
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
    a.download = "indeed-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <span className="mb-4 inline-flex items-center rounded-pill bg-surface-card px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[1.5px] text-body">
          Indeed Leads
        </span>
        <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-[-1px] text-ink md:text-5xl">
          Find companies actively hiring
        </h1>
        <p className="mt-4 max-w-xl font-body text-base leading-[1.55] text-body">
          Search Indeed job postings by role and location to surface
          companies with active hiring signals - a strong indicator they have
          budget and are growing.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 rounded-lg border border-hairline bg-surface-card p-6 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Job keyword
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Max results
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="sm:col-span-4">
            <button
              onClick={runSearch}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
            >
              <HiOutlineBriefcase />
              {loading ? "Searching..." : "Search Indeed"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 font-body text-sm text-error">{error}</p>
        )}

        {leads.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium tracking-[-0.3px] text-ink">
                {leads.length} listings found
              </h2>
              <button
                onClick={exportCsv}
                className="flex h-10 items-center gap-2 rounded-md border border-hairline bg-canvas px-4 font-body text-sm font-medium text-ink hover:bg-surface-card"
              >
                <HiOutlineDownload />
                Export CSV
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {leads.map((l) => (
                <div
                  key={l._id}
                  className="rounded-lg border border-hairline bg-canvas p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-base font-medium text-ink">
                        {l.jobTitle}
                      </p>
                      <p className="mt-1 flex items-center gap-1 font-body text-sm text-body">
                        <HiOutlineOfficeBuilding className="text-primary" />
                        {l.company}
                        {l.location && (
                          <span className="ml-3 flex items-center gap-1 text-muted">
                            <HiOutlineLocationMarker />
                            {l.location}
                          </span>
                        )}
                      </p>
                    </div>
                    {l.jobUrl && (
                      <a
                        href={l.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1 font-body text-sm font-medium text-primary"
                      >
                        View <HiOutlineExternalLink />
                      </a>
                    )}
                  </div>
                  {l.snippet && (
                    <p className="mt-3 font-body text-sm leading-[1.55] text-body">
                      {l.snippet}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 font-body text-[12px] text-muted-soft">
                    {l.salary && <span>{l.salary}</span>}
                    {l.postedText && <span>{l.postedText}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
