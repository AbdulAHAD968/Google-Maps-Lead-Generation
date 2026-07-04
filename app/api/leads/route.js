import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import Lead from "@/app/models/Lead";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const campaignQuery = searchParams.get("campaignQuery");
    const search = searchParams.get("search");
    const minRating = searchParams.get("minRating");
    const hasWebsite = searchParams.get("hasWebsite");
    const hasPhone = searchParams.get("hasPhone");
    const status = searchParams.get("status");
    const favorite = searchParams.get("favorite");
    const limit = Math.min(Number(searchParams.get("limit")) || 500, 1000);

    const filter = {};
    if (campaignQuery) filter.campaignQuery = campaignQuery;
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (hasWebsite === "true") filter.website = { $nin: ["", null] };
    if (hasPhone === "true") filter.phone = { $nin: ["", null] };
    if (status) filter.status = status;
    if (favorite === "true") filter.favorite = true;

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json({ count: leads.length, leads });
  } catch (err) {
    console.error("Failed to list leads:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list leads" },
      { status: 500 }
    );
  }
}
