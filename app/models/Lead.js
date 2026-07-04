import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    placeId: { type: String, required: true, unique: true, index: true },
    businessName: String,
    category: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    lat: Number,
    lng: Number,
    phone: String,
    website: String,
    googleMapsUrl: String,
    rating: Number,
    reviewsCount: Number,
    businessHours: [String],
    businessStatus: String,
    photos: [String],
    priceLevel: String,
    verified: Boolean,
    openNow: Boolean,
    campaignQuery: String,
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "interested",
        "meeting_booked",
        "proposal_sent",
        "won",
        "lost",
      ],
      default: "new",
    },
    favorite: { type: Boolean, default: false },
    notes: String,

    // Deep-extraction fields (populated by the Playwright scraper)
    description: String,
    ownerRespondsToReviews: Boolean,
    recentReviews: [
      {
        author: String,
        rating: Number,
        text: String,
        relativeDate: String,
      },
    ],
    photosCountDetailed: Number,
    deepExtractedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
