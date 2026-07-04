import { NextResponse } from "next/server";
import { geocodeLocation } from "@/app/lib/googleMaps";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    if (!location) {
      return NextResponse.json(
        { error: "location query param is required" },
        { status: 400 }
      );
    }

    const { lat, lng } = await geocodeLocation(location);
    return NextResponse.json({ lat, lng });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Geocoding failed" },
      { status: 500 }
    );
  }
}
