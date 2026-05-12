import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Raw content (legacy / fallback)
    content: { type: String, default: "" },

    // Structured fields from AI JSON response
    structured: {
      recipient:        { type: String, default: "Hiring Manager" },
      company:          { type: String, default: "" },
      position:         { type: String, default: "" },
      date:             { type: String, default: "" },
      salutation:       { type: String, default: "Dear Hiring Manager" },
      introduction:     { type: String, default: "" },
      body_paragraph_1: { type: String, default: "" },
      body_paragraph_2: { type: String, default: "" },
      conclusion:       { type: String, default: "" },
      closing:          { type: String, default: "Sincerely" },
      signature:        { type: String, default: "" },
      senderName:       { type: String, default: "" },
      senderEmail:      { type: String, default: "" },
      senderPhone:      { type: String, default: "" },
    },

    jobDescription: { type: String },
    companyName:    { type: String, required: true },
    jobTitle:       { type: String, required: true },
    status:         { type: String, default: "completed" },
  },
  { timestamps: true }
);

CoverLetterSchema.index({ userId: 1 });

const CoverLetter =
  mongoose.models.CoverLetter ||
  mongoose.model("CoverLetter", CoverLetterSchema);

export default CoverLetter;
