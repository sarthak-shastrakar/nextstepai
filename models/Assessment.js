import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizScore: { type: Number, required: true },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    category: { type: String, required: true },
    improvementTip: { type: String },
  },
  { timestamps: true }
);

AssessmentSchema.index({ userId: 1 });

const Assessment =
  mongoose.models.Assessment ||
  mongoose.model("Assessment", AssessmentSchema);

export default Assessment;
