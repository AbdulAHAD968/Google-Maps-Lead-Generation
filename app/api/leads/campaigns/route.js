import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import Lead from "@/app/models/Lead";

export async function GET() {
  try {
    await dbConnect();

    const campaigns = await Lead.aggregate([
      {
        $group: {
          _id: "$campaignQuery",
          count: { $sum: 1 },
          lastRun: { $max: "$updatedAt" },
        },
      },
      { $sort: { lastRun: -1 } },
    ]);

    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        campaignQuery: c._id,
        count: c.count,
        lastRun: c.lastRun,
      })),
    });
  } catch (err) {
    console.error("Failed to list campaigns:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list campaigns" },
      { status: 500 }
    );
  }
}
