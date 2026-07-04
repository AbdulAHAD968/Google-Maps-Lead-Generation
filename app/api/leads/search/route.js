import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import Lead from "@/app/models/Lead";
import {
  geocodeLocation,
  searchPlacesText,
  mapPlaceToLead,
} from "@/app/lib/googleMaps";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      keyword,
      location,
      lat: latIn,
      lng: lngIn,
      radius = 10,
      maxResults = 60,
      minRating = 0,
      minReviews = 0,
      hasWebsite = false,
      hasPhone = false,
      openNow = false,
    } = body;

    if (!keyword || (!location && (latIn == null || lngIn == null))) {
      return NextResponse.json(
        { error: "keyword and either location or lat/lng are required" },
        { status: 400 }
      );
    }

    const { lat, lng } =
      latIn != null && lngIn != null
        ? { lat: latIn, lng: lngIn }
        : await geocodeLocation(location);

    const keywords = String(keyword)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const campaignLabel = location
      ? `${keywords.join(" + ")} in ${location}`
      : `${keywords.join(" + ")} near ${lat.toFixed(3)},${lng.toFixed(3)}`;

    const seenPlaceIds = new Set();
    let leads = [];

    for (const kw of keywords) {
      const places = await searchPlacesText({
        keyword: kw,
        lat,
        lng,
        radiusMeters: Number(radius) * 1000,
        maxResults: Number(maxResults),
      });

      for (const place of places) {
        if (seenPlaceIds.has(place.id)) continue;
        seenPlaceIds.add(place.id);
        leads.push(mapPlaceToLead(place, campaignLabel));
      }
    }

    leads = leads.filter((l) => {
      if (l.rating < Number(minRating)) return false;
      if (l.reviewsCount < Number(minReviews)) return false;
      if (hasWebsite && !l.website) return false;
      if (hasPhone && !l.phone) return false;
      if (openNow && l.openNow !== true) return false;
      return true;
    });

    await dbConnect();

    const saved = await Promise.all(
      leads.map((lead) =>
        Lead.findOneAndUpdate({ placeId: lead.placeId }, lead, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
      )
    );

    return NextResponse.json({ count: saved.length, leads: saved });
  } catch (err) {
    console.error("Lead search failed:", err);
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
