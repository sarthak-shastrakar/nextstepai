import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true },
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ userId: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
