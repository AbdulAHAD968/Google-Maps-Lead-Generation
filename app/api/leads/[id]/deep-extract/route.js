import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import Lead from "@/app/models/Lead";
import { deepExtractGoogleMaps } from "@/app/lib/mapsScraper";

export const maxDuration = 60;

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (!lead.googleMapsUrl) {
      return NextResponse.json(
        { error: "This lead has no Google Maps URL to scrape" },
        { status: 400 }
      );
    }

    const extracted = await deepExtractGoogleMaps(lead.googleMapsUrl);

    lead.description = extracted.description || lead.description;
    lead.photosCountDetailed = extracted.photosCountDetailed;
    lead.ownerRespondsToReviews = extracted.ownerRespondsToReviews;
    lead.recentReviews = extracted.recentReviews;
    lead.deepExtractedAt = new Date();
    await lead.save();

    return NextResponse.json({ lead, partial: extracted.partial });
  } catch (err) {
    console.error("Deep extract failed:", err);
    return NextResponse.json(
      { error: err.message || "Deep extraction failed" },
      { status: 500 }
    );
  }
}
