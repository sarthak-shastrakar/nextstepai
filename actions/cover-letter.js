"use server";

import { auth } from "@/lib/auth";
import { runAI } from "@/lib/ai-service";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import CoverLetter from "@/models/CoverLetter";

export async function GenerateCoverLetter(data) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  const task = `Write a professional cover letter for ${data.jobTitle} at ${data.companyName}.`;
  const inputData = `Industry: ${user.industry}, Experience: ${user.experience}yrs, Skills: ${user.skills.join(", ")}, Bio: ${user.bio}, Job Description: ${data.jobDescription}`;

  try {
    const response = await runAI(task, inputData, { maxTokens: 500 });
    const content = typeof response === "string" ? response : response.coverLetter || response.content || JSON.stringify(response);

    const coverLetter = await CoverLetter.create({
      content, jobDescription: data.jobDescription, companyName: data.companyName,
      jobTitle: data.jobTitle, status: "completed", userId: user._id,
    });

    const serialized = JSON.parse(JSON.stringify(coverLetter.toObject()));
    return { ...serialized, id: serialized._id.toString() };
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter" + error.message);
  }
}

export async function getCoverLetters() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  const letters = await CoverLetter.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  const serialized = JSON.parse(JSON.stringify(letters));
  return serialized.map((l) => ({ ...l, id: l._id.toString() }));
}

export async function getCoverLetter(id) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  const letter = await CoverLetter.findOne({ _id: id, userId: user._id }).lean();
  const serialized = letter ? JSON.parse(JSON.stringify(letter)) : null;
  return serialized ? { ...serialized, id: serialized._id.toString() } : null;
}

export async function deleteCoverLetter(id) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  await CoverLetter.findOneAndDelete({ _id: id, userId: user._id });
  return { success: true };
}