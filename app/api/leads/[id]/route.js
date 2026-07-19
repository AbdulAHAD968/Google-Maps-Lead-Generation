import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import Lead from "@/app/models/Lead";

const EDITABLE_FIELDS = ["stage", "favorite", "notes"];

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) updates[field] = body[field];
    }

    await dbConnect();
    const lead = await Lead.findByIdAndUpdate(id, updates, { new: true });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (err) {
    console.error("Failed to update lead:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
