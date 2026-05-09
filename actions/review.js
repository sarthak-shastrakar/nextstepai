"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Review from "@/models/Review";

export async function addReview(rating, content) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  try {
    const review = await Review.create({ rating, content, userId: user._id });
    revalidatePath("/");
    return {
      id: review._id.toString(),
      rating: review.rating,
      content: review.content,
      userId: review.userId.toString(),
      createdAt: review.createdAt?.toISOString(),
      updatedAt: review.updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error("Error adding review:", error);
    throw new Error(`Failed to add review: ${error.message}`);
  }
}

export async function getReviews() {
  try {
    await dbConnect();
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "name image industry")
      .lean();

    return reviews.map((r) => ({
      id: r._id.toString(),
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
      user: r.userId
        ? { 
            id: r.userId._id.toString(), 
            name: r.userId.name, 
            imageUrl: r.userId.image, 
            industry: r.userId.industry 
          }
        : null,
    }));
  } catch (error) {
    console.warn("Could not fetch reviews (DB may be unreachable):", error.message);
    return [];
  }
}

export async function deleteReview(id) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  try {
    const review = await Review.findById(id).lean();
    if (!review) throw new Error("Review not found");
    if (review.userId.toString() !== user._id.toString()) throw new Error("Unauthorized to delete this review");

    await Review.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}
