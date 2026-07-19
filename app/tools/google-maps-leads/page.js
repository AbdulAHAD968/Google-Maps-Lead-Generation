"use client";

import { useState, useCallback, Fragment } from "react";
import Link from "next/link";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import {
  HiOutlineArrowLeft,
  HiOutlineAdjustments,
  HiOutlineLocationMarker,
  HiOutlineDownload,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineSparkles,
  HiOutlineChatAlt2,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";
import Drawer from "@/app/components/Drawer";
import RadiusCircle from "@/app/components/RadiusCircle";
import PointMarker from "@/app/components/PointMarker";
import SpikeMark from "@/app/components/SpikeMark";
import LocationSearchBox from "@/app/components/LocationSearchBox";

const DEFAULT_CENTER = { lat: 52.520008, lng: 13.404954 }; // Berlin

export default function GoogleMapsLeadsPage() {
  const [point, setPoint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [radius, setRadius] = useState(10);
  const [maxResults, setMaxResults] = useState(60);
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [extractingId, setExtractingId] = useState(null);
  const [extractError, setExtractError] = useState("");

  const handleMapClick = useCallback((e) => {
    const latLng = e.detail?.latLng;
    if (!latLng) return;
    setPoint({ lat: latLng.lat, lng: latLng.lng });
    setDrawerOpen(true);
  }, []);

  const runSearch = async () => {
    if (!point || !keyword) {
      setError("Pick a point on the map and enter a keyword first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          lat: point.lat,
          lng: point.lng,
          radius,
          maxResults,
          minRating,
          minReviews,
          hasWebsite,
          hasPhone,
          openNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setLeads(data.leads);
      setPanelExpanded(true);
      setDrawerOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleInsights = async (lead) => {
    if (expandedId === lead._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(lead._id);
    if (lead.deepExtractedAt) return; // already scraped

    setExtractingId(lead._id);
    setExtractError("");
    try {
      const res = await fetch(`/api/leads/${lead._id}/deep-extract`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deep extract failed");
      setLeads((prev) =>
        prev.map((l) => (l._id === lead._id ? data.lead : l))
      );
    } catch (err) {
      setExtractError(err.message);
    } finally {
      setExtractingId(null);
    }
  };

  const exportCsv = () => {
    if (!leads.length) return;
    const columns = [
      "company",
      "category",
      "address",
      "city",
      "country",
      "phone",
      "website",
      "rating",
      "reviewsCount",
      "businessStatus",
      "googleMapsUrl",
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
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLocate = useCallback((latLng) => {
    setPoint(latLng);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-surface-dark">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <Map
          id="main"
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          onClick={handleMapClick}
          className="absolute inset-0 h-full w-full"
        />
        {point && (
          <>
            <PointMarker position={point} />
            <RadiusCircle center={point} radiusMeters={radius * 1000} />
          </>
        )}

        {/* Top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-lg bg-canvas/95 px-4 py-2.5 shadow-lg backdrop-blur">
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
                Google Maps Leads
              </p>
              <p className="font-body text-[12px] text-muted-soft">
                {point
                  ? `${radius} km radius selected`
                  : "Click the map to start"}
              </p>
            </div>
          </div>

          <LocationSearchBox mapId="main" onLocate={handleLocate} />

          <button
            onClick={() => setDrawerOpen(true)}
            className="pointer-events-auto flex h-11 items-center gap-2 rounded-lg bg-primary px-4 font-body text-sm font-medium text-on-primary shadow-lg hover:bg-primary-active"
          >
            <HiOutlineAdjustments size={18} />
            {point ? "Edit search" : "Set up search"}
          </button>
        </div>
      </APIProvider>

      {!point && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-pill bg-canvas/95 px-4 py-2 font-body text-sm text-body shadow-md backdrop-blur">
          <HiOutlineLocationMarker className="mr-1 inline text-primary" />
          Click anywhere on the map to drop a search point
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-pill bg-error px-4 py-2 font-body text-sm text-on-primary shadow-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-pill bg-canvas/95 px-4 py-2 font-body text-sm text-body shadow-md backdrop-blur">
          Searching Google Maps...
        </div>
      )}

      {/* Results bottom sheet */}
      {leads.length > 0 && (
        <div
          className={`absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-xl bg-canvas shadow-[0_-8px_30px_rgba(20,20,19,0.15)] transition-all duration-300 ${
            panelExpanded ? "h-[55%]" : "h-14"
          }`}
        >
          <button
            onClick={() => setPanelExpanded((v) => !v)}
            className="flex h-14 shrink-0 items-center justify-between border-b border-hairline px-6"
          >
            <span className="font-body text-sm font-medium text-ink">
              {leads.length} leads found
            </span>
            <span className="flex items-center gap-3">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  exportCsv();
                }}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 font-body text-sm font-medium text-ink hover:bg-surface-card"
              >
                <HiOutlineDownload size={16} />
                Export CSV
              </span>
              {panelExpanded ? (
                <HiChevronDown className="text-muted" size={20} />
              ) : (
                <HiChevronUp className="text-muted" size={20} />
              )}
            </span>
          </button>

          {panelExpanded && (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full min-w-[720px] border-collapse font-body text-sm">
                <thead className="sticky top-0 bg-surface-card">
                  <tr className="border-b border-hairline text-left text-muted">
                    <th className="px-6 py-3 font-medium">Business</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Rating</th>
                    <th className="px-6 py-3 font-medium">Phone</th>
                    <th className="px-6 py-3 font-medium">Website</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <Fragment key={l.placeId}>
                      <tr className="border-b border-hairline-soft hover:bg-surface-card/60">
                        <td className="px-6 py-3 text-ink">{l.company}</td>
                        <td className="px-6 py-3 text-body">{l.category}</td>
                        <td className="px-6 py-3 text-body">
                          <span className="inline-flex items-center gap-1">
                            <HiOutlineStar className="text-accent-amber" />
                            {l.rating || "-"} ({l.reviewsCount})
                          </span>
                        </td>
                        <td className="px-6 py-3 text-body">
                          {l.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <HiOutlinePhone /> {l.phone}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-3 text-body">
                          {l.website ? (
                            <a
                              href={l.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary"
                            >
                              <HiOutlineGlobeAlt /> Visit
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-3 text-body">
                          {l.businessStatus || "-"}
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => toggleInsights(l)}
                            disabled={extractingId === l._id}
                            className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 font-body text-[13px] font-medium text-ink hover:bg-surface-card disabled:opacity-60"
                          >
                            <HiOutlineSparkles
                              size={14}
                              className={l.deepExtractedAt ? "text-primary" : "text-muted"}
                            />
                            {extractingId === l._id
                              ? "Scanning..."
                              : l.deepExtractedAt
                              ? "View scan"
                              : "Deep scan"}
                          </button>
                        </td>
                      </tr>
                      {expandedId === l._id && (
                        <tr className="border-b border-hairline-soft bg-surface-soft">
                          <td colSpan={7} className="px-6 py-5">
                            {extractingId === l._id ? (
                              <p className="font-body text-sm text-muted">
                                Opening a headless Chromium browser and
                                reading this listing on Google Maps
                                directly...
                              </p>
                            ) : extractError && expandedId === l._id ? (
                              <p className="font-body text-sm text-error">
                                {extractError}
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                  <p className="mb-2 font-body text-[13px] font-medium uppercase tracking-[1px] text-muted">
                                    Description
                                  </p>
                                  <p className="font-body text-sm leading-[1.55] text-body">
                                    {l.description || "Not available."}
                                  </p>
                                  <div className="mt-4 flex items-center gap-2">
                                    <HiOutlineChatAlt2
                                      className={
                                        l.ownerRespondsToReviews
                                          ? "text-success"
                                          : "text-muted-soft"
                                      }
                                    />
                                    <span className="font-body text-sm text-body">
                                      {l.ownerRespondsToReviews
                                        ? "Owner responds to reviews"
                                        : "No owner responses detected"}
                                    </span>
                                  </div>
                                  {l.photosCountDetailed != null && (
                                    <p className="mt-2 font-body text-sm text-body">
                                      {l.photosCountDetailed} photos on
                                      profile
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="mb-2 font-body text-[13px] font-medium uppercase tracking-[1px] text-muted">
                                    Recent reviews
                                  </p>
                                  {l.recentReviews?.length ? (
                                    <div className="flex flex-col gap-3">
                                      {l.recentReviews.slice(0, 4).map((r, i) => (
                                        <div
                                          key={i}
                                          className="rounded-md border border-hairline bg-canvas p-3"
                                        >
                                          <p className="font-body text-[13px] font-medium text-ink">
                                            {r.author}{" "}
                                            {r.rating && (
                                              <span className="text-accent-amber">
                                                {"★".repeat(Math.round(r.rating))}
                                              </span>
                                            )}
                                          </p>
                                          <p className="mt-1 font-body text-[13px] text-body">
                                            {r.text}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="font-body text-sm text-muted-soft">
                                      No reviews captured.
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Search this area"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Keyword(s)
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Dentist, Orthodontist"
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <p className="mt-1 font-body text-[12px] text-muted-soft">
              Separate multiple keywords with commas to run them together in
              this area.
            </p>
          </div>

          {!point && (
            <p className="rounded-md bg-surface-card px-3 py-2 font-body text-[13px] text-muted">
              Click a point on the map behind this panel to set your search
              location.
            </p>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-body text-sm font-medium text-ink">
                Radius
              </label>
              <span className="font-code text-sm text-muted">{radius} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="mb-2 block font-body text-sm font-medium text-ink">
              Max results
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <p className="mt-1 font-body text-[12px] text-muted-soft">
              Capped at 60 by the Places API.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                Min reviews
              </label>
              <input
                type="number"
                min={0}
                value={minReviews}
                onChange={(e) => setMinReviews(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              ["Has website", hasWebsite, setHasWebsite],
              ["Has phone", hasPhone, setHasPhone],
              ["Open now", openNow, setOpenNow],
            ].map(([label, value, setter]) => (
              <label
                key={label}
                className="flex items-center gap-2 font-body text-sm text-body"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setter(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={runSearch}
            disabled={loading || !point}
            className="mt-2 flex h-10 items-center justify-center rounded-md bg-primary px-5 font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search leads"}
          </button>
        </div>
      </Drawer>
    </div>
  );
}
