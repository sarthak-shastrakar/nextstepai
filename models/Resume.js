import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    contactInfo: {
      email: String,
      mobile: String,
      linkedin: String,
      github: String,
    },
    summary: { type: String },
    skills: { type: String }, // Sticking to String to match existing form logic
    experience: [
      {
        title: String,
        organization: String,
        startDate: String,
        endDate: String,
        description: String,
        current: Boolean,
      },
    ],
    education: [
      {
        title: String,
        organization: String,
        startDate: String,
        endDate: String,
        description: String,
        current: Boolean,
      },
    ],
    projects: [
      {
        title: String,
        organization: String,
        link: String,
        startDate: String,
        endDate: String,
        description: String,
        current: Boolean,
      },
    ],
    content: { type: String }, // Kept for legacy data and manual markdown edits

    // ── AI Improve daily rate-limit ───────────────────────────────
    aiImproveCount: { type: Number, default: 0 },  // uses today
    aiImproveDate:  { type: String, default: "" },  // "YYYY-MM-DD"

    // ── ATS Check daily rate-limit ────────────────────────────────
    aiAtsCount: { type: Number, default: 0 },       // ATS checks today
    aiAtsDate:  { type: String, default: "" },       // "YYYY-MM-DD"
  },
  { timestamps: true }
);

const Resume = mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);

export default Resume;
