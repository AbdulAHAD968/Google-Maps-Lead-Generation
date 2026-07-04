import mongoose from "mongoose";

const IndeedLeadSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    jobTitle: { type: String, required: true },
    location: String,
    snippet: String,
    salary: String,
    jobUrl: { type: String, unique: true, sparse: true },
    postedText: String,
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
  },
  { timestamps: true }
);

export default mongoose.models.IndeedLead ||
  mongoose.model("IndeedLead", IndeedLeadSchema);
