import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Lead = (await import("../app/models/Lead.js")).default;

  const { placeId, ...rest } = {
    placeId: "TEST_PLACE_123",
    company: "Test Bakery",
    category: "Bakery",
    address: "123 Main St",
    city: "Testville",
    country: "US",
    phone: "555-1234",
    website: "https://testbakery.example",
    googleMapsUrl: "https://maps.google.com/?q=test",
    rating: 4.5,
    reviewsCount: 12,
    businessStatus: "OPERATIONAL",
    verified: true,
    campaignQuery: "bakery in Testville",
  };

  const saved = await Lead.findOneAndUpdate(
    { placeId },
    { $set: rest, $setOnInsert: { source: "Google Maps" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(JSON.stringify(saved, null, 2));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
