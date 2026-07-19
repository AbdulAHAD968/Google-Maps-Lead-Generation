const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.regularOpeningHours",
  "places.currentOpeningHours",
  "places.businessStatus",
  "places.priceLevel",
  "places.photos",
  "places.primaryTypeDisplayName",
  "places.types",
  "nextPageToken",
].join(",");

export async function geocodeLocation(location) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", location);
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Could not geocode location "${location}"`);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

export async function searchPlacesText({
  keyword,
  lat,
  lng,
  radiusMeters,
  maxResults,
}) {
  const places = [];
  let pageToken = null;
  const cappedMax = Math.min(maxResults, 60); // Text Search caps at ~3 pages / 60 results

  do {
    const body = {
      textQuery: keyword,
      pageSize: 20,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
    };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Places API request failed");
    }

    places.push(...(data.places || []));
    pageToken = data.nextPageToken || null;

    if (pageToken) {
      // Google requires a short delay before the next page token becomes valid
      await new Promise((r) => setTimeout(r, 2000));
    }
  } while (pageToken && places.length < cappedMax);

  return places.slice(0, cappedMax);
}

function addressComponent(components, type) {
  return components?.find((c) => c.types?.includes(type))?.longText || "";
}

const PRICE_LEVEL_MAP = {
  PRICE_LEVEL_FREE: "Free",
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

export function mapPlaceToLead(place, campaignQuery) {
  const components = place.addressComponents || [];

  return {
    placeId: place.id,
    company: place.displayName?.text || "",
    category: place.primaryTypeDisplayName?.text || place.types?.[0] || "",
    address: place.formattedAddress || "",
    city:
      addressComponent(components, "locality") ||
      addressComponent(components, "postal_town"),
    postalCode: addressComponent(components, "postal_code"),
    country: addressComponent(components, "country"),
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
    website: place.websiteUri || "",
    googleMapsUrl: place.googleMapsUri || "",
    rating: place.rating || 0,
    reviewsCount: place.userRatingCount || 0,
    businessHours: place.regularOpeningHours?.weekdayDescriptions || [],
    businessStatus: place.businessStatus || "",
    photos: (place.photos || []).slice(0, 3).map((p) => p.name),
    priceLevel: PRICE_LEVEL_MAP[place.priceLevel] || "",
    verified: place.businessStatus === "OPERATIONAL",
    openNow: place.currentOpeningHours?.openNow ?? null,
    campaignQuery,
  };
}
