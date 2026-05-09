import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    jobDescription: { type: String },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    status: { type: String, default: "draft" },
  },
  { timestamps: true }
);

CoverLetterSchema.index({ userId: 1 });

const CoverLetter =
  mongoose.models.CoverLetter ||
  mongoose.model("CoverLetter", CoverLetterSchema);

export default CoverLetter;
