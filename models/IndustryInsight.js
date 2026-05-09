import mongoose from "mongoose";

const IndustryInsightSchema = new mongoose.Schema(
  {
    // ── Per-user record ──────────────────────────────────────────
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    industry: { type: String, required: true },
    subIndustry: { type: String, default: "" },

    // ── Core market data ─────────────────────────────────────────
    marketOutlook: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"], default: "NEUTRAL" },
    growthRate: { type: Number, default: 0 },
    demandLevel: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },

    // ── Readiness ────────────────────────────────────────────────
    readinessScore: { type: Number, default: 0 },

    // ── Salary ───────────────────────────────────────────────────
    salaryRanges: { type: [mongoose.Schema.Types.Mixed], default: [] },
    salaryByExperience: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── Hiring trends ─────────────────────────────────────────────
    hiringTrends: { type: mongoose.Schema.Types.Mixed, default: { remote: 35, hybrid: 45, onsite: 20 } },

    // ── Skills ────────────────────────────────────────────────────
    topSkills: { type: [String], default: [] },
    skillSalaryBoost: { type: [mongoose.Schema.Types.Mixed], default: [] },
    skillsGap: { type: [String], default: [] },

    // ── Jobs / roles ──────────────────────────────────────────────
    topJobTitles: { type: [String], default: [] },
    topCompanies: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // ── Trends & tips ─────────────────────────────────────────────
    keyTrends: { type: [String], default: [] },
    entryLevelTips: { type: [String], default: [] },
    switchTips: { type: [String], default: [] },
    certifications: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // ── Timestamps ────────────────────────────────────────────────
    lastGeneratedAt: { type: Date, default: Date.now },
    nextUpdate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Compound index: one record per user
IndustryInsightSchema.index({ userId: 1 }, { unique: true });

// ── Force model refresh on hot-reload (same pattern as User.js) ──
if (mongoose.models.IndustryInsight) {
  delete mongoose.models["IndustryInsight"];
}
const IndustryInsight = mongoose.model("IndustryInsight", IndustryInsightSchema);

export default IndustryInsight;
