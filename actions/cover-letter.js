"use server";

import { auth } from "@/lib/auth";
import { runAI } from "@/lib/ai-service";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import CoverLetter from "@/models/CoverLetter";
import { format } from "date-fns";
import { buildPlainText } from "@/lib/cover-letter-utils";

// ── Helper: serialize Mongoose doc ─────────────────────────────
function serialize(doc) {
  const plain = JSON.parse(JSON.stringify(doc));
  return { ...plain, id: plain._id.toString() };
}



// ══════════════════════════════════════════════════════════════
// 1. Generate Cover Letter
// ══════════════════════════════════════════════════════════════
export async function GenerateCoverLetter(data) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  const today = format(new Date(), "MMMM d, yyyy");

  const task = `
Generate a professional cover letter as a JSON object with exactly these keys:
{
  "recipient": "Hiring Manager",
  "company": "${data.companyName}",
  "position": "${data.jobTitle}",
  "date": "${today}",
  "salutation": "Dear Hiring Manager",
  "introduction": "<2-3 sentence opening paragraph expressing interest>",
  "body_paragraph_1": "<paragraph highlighting relevant skills and experience>",
  "body_paragraph_2": "<paragraph with specific achievements or fit for role>",
  "conclusion": "<closing paragraph with call to action>",
  "closing": "Sincerely",
  "signature": "${user.name || "Applicant"}",
  "senderName": "${user.name || ""}",
  "senderEmail": "${user.email || ""}",
  "senderPhone": "${user.phone || ""}"
}
Output ONLY valid JSON. No markdown. No explanation.
`;

  const inputData = `
Applicant: ${user.name}
Industry: ${user.industry || "Not specified"}
Experience Level: ${user.experience || "Not specified"}
Skills: ${(user.skills || []).join(", ")}
Bio: ${user.bio || "Not provided"}
Company: ${data.companyName}
Position: ${data.jobTitle}
Job Description: ${data.jobDescription}
`;

  try {
    const aiResponse = await runAI(task, inputData, {
      maxTokens: 900,
      system: "You are a professional cover letter writer. Output ONLY a valid JSON object with the specified keys. No markdown, no code blocks, no explanations.",
    });

    // aiResponse is already parsed JSON by runAI
    const structured = {
      recipient:        aiResponse.recipient        || "Hiring Manager",
      company:          aiResponse.company          || data.companyName,
      position:         aiResponse.position         || data.jobTitle,
      date:             aiResponse.date             || today,
      salutation:       aiResponse.salutation       || "Dear Hiring Manager",
      introduction:     aiResponse.introduction     || "",
      body_paragraph_1: aiResponse.body_paragraph_1 || "",
      body_paragraph_2: aiResponse.body_paragraph_2 || "",
      conclusion:       aiResponse.conclusion       || "",
      closing:          aiResponse.closing          || "Sincerely",
      signature:        aiResponse.signature        || user.name || "",
      senderName:       aiResponse.senderName       || user.name  || "",
      senderEmail:      aiResponse.senderEmail      || user.email || "",
      senderPhone:      aiResponse.senderPhone      || user.phone || "",
    };

    const coverLetter = await CoverLetter.create({
      content:        buildPlainText(structured),
      structured,
      jobDescription: data.jobDescription,
      companyName:    data.companyName,
      jobTitle:       data.jobTitle,
      status:         "completed",
      userId:         user._id,
    });

    return serialize(coverLetter);
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter: " + error.message);
  }
}

// ══════════════════════════════════════════════════════════════
// 2. Get all cover letters for current user
// ══════════════════════════════════════════════════════════════
export async function getCoverLetters() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const letters = await CoverLetter.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return letters.map(serialize);
}

// ══════════════════════════════════════════════════════════════
// 3. Get single cover letter
// ══════════════════════════════════════════════════════════════
export async function getCoverLetter(id) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  const letter = await CoverLetter.findOne({
    _id: id,
    userId: session.user.id,
  }).lean();

  return letter ? serialize(letter) : null;
}

// ══════════════════════════════════════════════════════════════
// 4. Update cover letter (structured fields)
// ══════════════════════════════════════════════════════════════
export async function updateCoverLetter(id, structured) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();

  const plainContent = buildPlainText(structured);

  const updated = await CoverLetter.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { structured, content: plainContent, updatedAt: new Date() },
    { new: true }
  ).lean();

  if (!updated) throw new Error("Cover letter not found");
  return serialize(updated);
}

// ══════════════════════════════════════════════════════════════
// 5. Delete cover letter
// ══════════════════════════════════════════════════════════════
export async function deleteCoverLetter(id) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  await CoverLetter.findOneAndDelete({ _id: id, userId: session.user.id });
  return { success: true };
}