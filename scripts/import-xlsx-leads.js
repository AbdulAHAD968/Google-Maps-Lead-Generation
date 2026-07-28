/**
 * One-off importer for external lead spreadsheets (SevenLabs quality-leads
 * xlsx files). Reads the "Quality Leads" tab (2nd tab) of each file and
 * upserts every row into the Lead collection.
 *
 * Every row is stored twice over: mapped onto the closest matching CRM
 * fields (for filtering/display), AND kept verbatim in `rawImport` (Mixed)
 * so no column is ever silently lost, even ones with no dedicated field.
 *
 * Usage: node scripts/import-xlsx-leads.js
 */

require("dotenv").config();
const path = require("path");
const XLSX = require("xlsx");
const mongoose = require("mongoose");

// app/models/Lead.js uses ES module syntax (import/export), which plain
// Node/CommonJS can't require() directly. Rather than transpile it for this
// one-off script, define a minimal, non-strict schema against the same
// "leads" collection - strict:false means writes here can never clobber
// fields this script doesn't know about.
const Lead =
  mongoose.models.Lead ||
  mongoose.model(
    "Lead",
    new mongoose.Schema({}, { strict: false, timestamps: true }),
    "leads"
  );

const IMPORTS = [
  {
    file: "C:\\Users\\abdul\\Desktop\\SEVENLABS\\LEAD_GENERATION\\sevenlabs_mexico_quality_leads.xlsx",
    countryCode: "MX",
    defaultCountry: "Mexico",
  },
  {
    file: "C:\\Users\\abdul\\Desktop\\SEVENLABS\\LEAD_GENERATION\\sevenlabs_canada_quality_leads.xlsx",
    countryCode: "CA",
    defaultCountry: "Canada",
  },
];

const PRIORITY_MAP = { High: "Hot", Medium: "Warm", Low: "Cold" };

function mapStage(outreachStatus) {
  const s = (outreachStatus || "").trim().toLowerCase();
  if (s === "contacted") return "Contacted";
  if (s === "qualified") return "Qualified";
  if (s === "proposal sent") return "Proposal Sent";
  if (s === "negotiating") return "Negotiating";
  if (s === "won") return "Won";
  if (s === "lost") return "Lost";
  return "New"; // covers "Not Contacted" and blanks
}

function parseDateLoose(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function buildResearchNotes(row) {
  const lines = [];
  const add = (label, value) => {
    if (value) lines.push(`${label}: ${value}`);
  };
  add("Lead ID", row["Lead ID"]);
  add("Channel", row["Channel"]);
  add("Best SevenLabs Offer", row["Best SevenLabs Offer"]);
  add("Quality Reason", row["Quality Reason"]);
  add("Pain Point", row["Pain Point"]);
  add("Quality Signal", row["Quality Signal"]);
  add("Source URL", row["Source URL"]);
  add("Owner", row["Owner"]);
  add("Last Contacted", row["Last Contacted"]);
  add("Next Follow-up (raw)", row["Next Follow-up"]);
  return lines.join("\n");
}

async function importFile({ file, countryCode, defaultCountry }) {
  const wb = XLSX.readFile(file);
  const tabName = wb.SheetNames[1]; // "Quality Leads" is always the 2nd tab
  const sheet = wb.Sheets[tabName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`\n${path.basename(file)} -> tab "${tabName}" (${rows.length} rows)`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const leadId = String(row["Lead ID"] || "").trim();
    const businessName = String(row["Business Name"] || "").trim();

    if (!leadId || !businessName) {
      skipped++;
      continue;
    }

    const city = [row["City / Area"] || row["City"], row["Province"]]
      .filter(Boolean)
      .join(", ");

    const doc = {
      placeId: `xlsx:${countryCode}:${leadId}`,
      company: businessName,
      contactName: String(row["Contact Name / Legal Name"] || row["Contact / Notes"] || "").trim(),
      email: String(row["Email"] || "").trim(),
      phone: String(row["Phone"] || "").trim(),
      website: String(row["Website"] || "").trim(),
      country: String(row["Country"] || defaultCountry).trim(),
      city,
      category: String(row["Industry"] || "").trim(),
      priority: PRIORITY_MAP[row["Priority"]] || "Warm",
      stage: mapStage(row["Outreach Status"]),
      source: "Other",
      campaignQuery: `${defaultCountry} - ${row["Channel"] || "External import"}`,
      notes: String(row["Notes"] || "").trim(),
      researchNotes: buildResearchNotes(row),
      nextFollowUpDate: parseDateLoose(row["Next Follow-up"]),
      lastActivityAt: new Date(),
      rawImport: row,
    };

    const existing = await Lead.findOne({ placeId: doc.placeId });
    await Lead.findOneAndUpdate({ placeId: doc.placeId }, doc, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`  created: ${created}, updated: ${updated}, skipped (no Lead ID/Business Name): ${skipped}`);
  return { created, updated, skipped, total: rows.length };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set - check your .env file");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const totals = { created: 0, updated: 0, skipped: 0, total: 0 };
  for (const cfg of IMPORTS) {
    const result = await importFile(cfg);
    totals.created += result.created;
    totals.updated += result.updated;
    totals.skipped += result.skipped;
    totals.total += result.total;
  }

  console.log("\n=== Totals ===");
  console.log(totals);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
