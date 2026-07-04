import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import Lead from "@/app/models/Lead";

const TONE_INSTRUCTIONS = {
  email: "Write a short, personalized cold email (under 120 words). Include a subject line on the first line prefixed with 'Subject:'.",
  dm: "Write a short, casual DM (under 60 words) suitable for Instagram or Facebook, no subject line.",
  linkedin: "Write a short, professional LinkedIn connection/outreach message (under 60 words), no subject line.",
};

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { type = "email", offer = "" } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    await dbConnect();
    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const context = [
      `Business name: ${lead.businessName}`,
      lead.category && `Category: ${lead.category}`,
      lead.city && `City: ${lead.city}`,
      lead.rating ? `Google rating: ${lead.rating} (${lead.reviewsCount} reviews)` : "No rating yet",
      lead.website ? `Website: ${lead.website}` : "No website found",
      lead.description && `Business description: ${lead.description}`,
      lead.ownerRespondsToReviews != null &&
        `Owner ${lead.ownerRespondsToReviews ? "actively responds" : "does not respond"} to reviews`,
    ]
      .filter(Boolean)
      .join("\n");

    const instruction = TONE_INSTRUCTIONS[type] || TONE_INSTRUCTIONS.email;

    const prompt = `You are writing outreach on behalf of a lead-generation/marketing agency reaching out to a local business as a potential client.

Business context:
${context}

${offer ? `What we offer them: ${offer}` : "We offer marketing, website, and lead-generation services."}

${instruction}
Reference something specific from the business context above (e.g. missing website, low review count, no owner responses) to make it feel personalized, not generic. Do not use placeholders like [Name] - write it as final copy. No emojis.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "OpenAI request failed");
    }

    const message = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ message });
  } catch (err) {
    console.error("Outreach generation failed:", err);
    return NextResponse.json(
      { error: err.message || "Outreach generation failed" },
      { status: 500 }
    );
  }
}
