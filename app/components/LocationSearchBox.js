"use client";

import { useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { HiOutlineSearch } from "react-icons/hi";

export default function LocationSearchBox({ mapId, onLocate }) {
  const map = useMap(mapId);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runGeocode = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/geocode?location=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Location not found");

      map?.panTo({ lat: data.lat, lng: data.lng });
      map?.setZoom(13);
      onLocate?.({ lat: data.lat, lng: data.lng });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-auto flex flex-col gap-1">
      <div className="flex items-center gap-2 rounded-lg bg-canvas/95 px-3 py-2 shadow-lg backdrop-blur">
        <HiOutlineSearch className="text-muted" size={16} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runGeocode()}
          placeholder="Jump to a city or address"
          className="w-48 bg-transparent font-body text-sm text-ink placeholder:text-muted-soft focus:outline-none sm:w-64"
        />
        <button
          onClick={runGeocode}
          disabled={loading}
          className="shrink-0 rounded-md bg-primary px-3 py-1 font-body text-[13px] font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
        >
          {loading ? "..." : "Go"}
        </button>
      </div>
      {error && (
        <span className="rounded-md bg-error px-3 py-1 font-body text-[12px] text-on-primary">
          {error}
        </span>
      )}
    </div>
  );
}
