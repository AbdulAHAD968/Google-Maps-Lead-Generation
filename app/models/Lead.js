import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["stage_change", "note", "call", "email", "assignment", "research_note", "research_completed", "recording_uploaded"],
      required: true,
    },
    message: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CallSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }, // minutes
    outcome: {
      type: String,
      enum: ["No answer", "Left voicemail", "Spoke", "Not interested", "Follow-up scheduled"],
      required: true,
    },
    notes: { type: String, default: "" },
    recordingUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    author: String,
    rating: Number,
    text: String,
    relativeDate: String,
  },
  { _id: false }
);

const ResearchDocumentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema = new mongoose.Schema(
  {
    // Identity - shared between manually-entered CRM leads and scraped leads
    placeId: { type: String, unique: true, sparse: true, index: true },
    company: { type: String, required: true, trim: true },

    // CRM contact fields
    contactName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },

    // Google Maps scraper fields
    category: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    lat: Number,
    lng: Number,
    website: { type: String, default: "" },
    googleMapsUrl: { type: String, default: "" },
    rating: Number,
    reviewsCount: Number,
    businessHours: { type: [String], default: [] },
    businessStatus: { type: String, default: "" },
    photos: { type: [String], default: [] },
    priceLevel: { type: String, default: "" },
    verified: Boolean,
    openNow: Boolean,
    campaignQuery: { type: String, default: "" },

    // Deep-extraction fields (populated by the Playwright scraper)
    description: { type: String, default: "" },
    ownerRespondsToReviews: Boolean,
    recentReviews: { type: [ReviewSchema], default: [] },
    photosCountDetailed: Number,
    deepExtractedAt: Date,

    // CRM pipeline fields
    source: {
      type: String,
      enum: ["LinkedIn", "Referral", "Website", "Cold Outreach", "Google Maps", "Other"],
      default: "Other",
    },
    serviceInterest: {
      type: String,
      enum: ["AI Agent", "Automation", "VAPT", "SaaS"],
      default: null,
    },
    dealValue: { type: Number, default: 0 },
    priority: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      default: "Warm",
    },
    stage: {
      type: String,
      enum: [
        "Researching",
        "New",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Negotiating",
        "Won",
        "Lost",
      ],
      default: "Researching",
    },
    favorite: { type: Boolean, default: false },
    notes: { type: String, default: "" },

    // Research phase - a lead sits here until a researcher attaches findings
    // and marks it done, at which point it becomes visible to cold callers.
    researchNotes: { type: String, default: "" },
    researchDocuments: { type: [ResearchDocumentSchema], default: [] },
    researchCompletedAt: { type: Date, default: null },
    researchCompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    activityLog: { type: [ActivitySchema], default: [] },
    calls: { type: [CallSchema], default: [] },
    nextFollowUpDate: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now },

    // Full original row, kept verbatim for leads imported from an external
    // spreadsheet - guarantees no column is silently lost even if it has
    // no dedicated field above.
    rawImport: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema, "leads");
