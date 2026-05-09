"use server";

import { auth } from "@/lib/auth";
import { generateAIInsights } from "./dashboard";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import IndustryInsight from "@/models/IndustryInsight";

export async function updateUser(data) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User Not Found");

  try {
    let industryInsight = await IndustryInsight.findOne({ industry: data.industry }).lean();

    if (!industryInsight) {
      const insights = await generateAIInsights(data.industry);
      const created = await IndustryInsight.create({
        industry: data.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      industryInsight = created.toObject();
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { industry: data.industry, experience: data.experience, bio: data.bio, skills: data.skills },
      { returnDocument: "after" }
    ).lean();

    const serializedUser = JSON.parse(JSON.stringify(updatedUser));
    const serializedInsight = JSON.parse(JSON.stringify(industryInsight));

    return {
      success: true,
      updatedUser: { ...serializedUser, id: serializedUser._id },
      industryInsight: { ...serializedInsight, id: serializedInsight._id },
    };
  } catch (error) {
    console.log("Error updating user profile:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await dbConnect();
    const user = await User.findById(session.user.id, { profileCompleted: 1, industry: 1 }).lean();
    // profileCompleted flag is the canonical source of truth
    return { isOnboarded: !!user?.profileCompleted };
  } catch (error) {
    console.warn("Database connection issue:", error.message);
    return { isOnboarded: false };
  }
}

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  const serializedUser = JSON.parse(JSON.stringify(user));
  return { ...serializedUser, id: serializedUser._id };
}
