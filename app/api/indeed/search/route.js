import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import IndeedLead from "@/app/models/IndeedLead";
import { searchIndeedJobs } from "@/app/lib/indeed";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { keyword, location, maxResults = 50 } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: "keyword is required" },
        { status: 400 }
      );
    }

    const jobs = await searchIndeedJobs({
      keyword,
      location,
      maxResults: Number(maxResults),
    });

    const campaignQuery = location ? `${keyword} in ${location}` : keyword;

    await dbConnect();

    const saved = await Promise.all(
      jobs.map((job) => {
        const filter = job.jobUrl
          ? { jobUrl: job.jobUrl }
          : { company: job.company, jobTitle: job.jobTitle };
        return IndeedLead.findOneAndUpdate(
          filter,
          { ...job, campaignQuery },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      })
    );

    return NextResponse.json({ count: saved.length, leads: saved });
  } catch (err) {
    console.error("Indeed search failed:", err);
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
