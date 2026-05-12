"use server";

import { revalidatePath } from "next/cache";
import { runAI } from "@/lib/ai-service";
import { checkUser } from "@/lib/checkUser";
import dbConnect from "@/lib/mongoose";
import Resume from "@/models/Resume";

export async function saveResume(inputData) {
  const user = await checkUser();

  if (!user) throw new Error("User not found");

  try {
    await dbConnect();
    
    // Check if input is a JSON string or an object
    let updateData;
    if (typeof inputData === "string") {
      try {
        updateData = JSON.parse(inputData);
      } catch {
        updateData = { content: inputData };
      }
    } else {
      updateData = inputData;
    }

    // CRITICAL: Strip all internal fields before saving
    // 'id' is often passed back from the client but isn't in the schema
    const { _id, id, userId, createdAt, updatedAt, __v, ...cleanData } = updateData;

    console.log(`Saving resume for user ${user.id}...`);

    const resume = await Resume.findOneAndUpdate(
      { userId: user.id },
      { ...cleanData },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).lean();

    if (!resume) {
      throw new Error("Failed to update or create resume");
    }

    console.log("Resume saved successfully");

    const serialized = JSON.parse(JSON.stringify(resume));
    revalidatePath("/resume");
    return { ...serialized, id: serialized._id.toString() };
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error(error.message || "Failed to save resume");
  }
}

export async function getResume() {
  const user = await checkUser();

  if (!user) return null;

  try {
    await dbConnect();
    let resume = await Resume.findOne({ userId: user.id }).lean();

    if (resume) {
      // Legacy Migration: If new fields are missing but content looks like JSON
      if (!resume.summary && resume.content) {
        try {
          const parsed = JSON.parse(resume.content);
          if (parsed && typeof parsed === "object") {
             resume = { ...resume, ...parsed };
          }
        } catch {
          // Regular markdown, leave as is
        }
      }
      
      const serializedResume = JSON.parse(JSON.stringify(resume));
      return {
        resume: { 
          ...serializedResume, 
          id: serializedResume._id.toString(),
          experience: serializedResume.experience || [],
          education: serializedResume.education || [],
          projects: serializedResume.projects || [],
        },
        user,
      };
    }

    return { resume: null, user };
  } catch (error) {
    console.error("Error fetching resume:", error);
    return { resume: null, user };
  }
}


export async function improveWithAI({ current, type }) {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const DAILY_LIMIT = 2;
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  await dbConnect();

  // ── Check daily usage ────────────────────────────────────────────
  const resumeDoc = await Resume.findOne(
    { userId: user.id },
    { aiImproveCount: 1, aiImproveDate: 1 }
  ).lean();

  const sameDay   = resumeDoc?.aiImproveDate === today;
  const usedToday = sameDay ? (resumeDoc.aiImproveCount || 0) : 0;

  if (usedToday >= DAILY_LIMIT) {
    // Time until midnight (IST = UTC+5:30, but we use server local — tell user in hours)
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursLeft = Math.ceil((tomorrow - now) / (1000 * 60 * 60));
    throw new Error(
      `Daily AI limit reached (${DAILY_LIMIT} uses/day). Resets in ${hoursLeft}h.`
    );
  }

  const prompts = {
    summary:    "Hook + top skills. Max 50 words.",
    experience: "Action verbs + metrics. Max 60 words.",
    project:    "Problem + Stack + Outcome. Max 60 words.",
  };

  const task = `Resume Expert: Polish this "${type}". Rule: ${prompts[type] || "Concise."} No intro.`;
  const data = `Industry: ${user.industry}, Text: "${current}"`;

  try {
    const response = await runAI(task, data, { maxTokens: 200, isText: true });

    // ── Increment usage counter ──────────────────────────────────
    await Resume.findOneAndUpdate(
      { userId: user.id },
      { aiImproveDate: today, aiImproveCount: sameDay ? usedToday + 1 : 1 },
      { upsert: true }
    );

    return response;
  } catch (error) {
    // Re-throw limit errors as-is; wrap AI errors
    if (error.message?.startsWith("Daily AI limit")) throw error;
    console.error("Error improving with AI:", error);
    throw new Error("Failed to improve content. Please try again.");
  }
}

export async function getATSScore(resumeContent, targetRole = "Professional") {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const DAILY_LIMIT = 2;
  const today = new Date().toISOString().slice(0, 10);

  await dbConnect();

  // ── Check daily ATS usage ────────────────────────────────────────
  const resumeDoc = await Resume.findOne(
    { userId: user.id },
    { aiAtsCount: 1, aiAtsDate: 1 }
  ).lean();

  const sameDay   = resumeDoc?.aiAtsDate === today;
  const usedToday = sameDay ? (resumeDoc.aiAtsCount || 0) : 0;

  if (usedToday >= DAILY_LIMIT) {
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursLeft = Math.ceil((tomorrow - now) / (1000 * 60 * 60));
    throw new Error(
      `Daily ATS limit reached (${DAILY_LIMIT} checks/day). Resets in ${hoursLeft}h.`
    );
  }

  const task = `Analyze resume for "${targetRole}" in ${user.industry}. 
  Return JSON:
  - qualityScore, matchScore (0-100)
  - summary (concise)
  - strengths, weaknesses (3 each)
  - suggestions (3 quick fixes)
  - missingSkills: { hard: string[], soft: string[] } (Top skills missing for role)
  - similarRoles (3 related job titles)`;

  const data = `Resume: ${resumeContent}`;

  try {
    const result = await runAI(task, data, { maxTokens: 600 });

    // ── Increment ATS usage counter ─────────────────────────────
    await Resume.findOneAndUpdate(
      { userId: user.id },
      { aiAtsDate: today, aiAtsCount: sameDay ? usedToday + 1 : 1 },
      { upsert: true }
    );

    return result;
  } catch (error) {
    if (error.message?.startsWith("Daily ATS limit")) throw error;
    console.error("Error getting ATS score:", error);
    throw new Error("Analysis failed.");
  }
}

export async function generateSummary({ skills, experience }) {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const task = "Write a 3-sentence professional summary. No preamble.";
  const data = `Industry: ${user.industry}, Skills: ${skills}, Experience: ${JSON.stringify(experience)}`;

  try {
    return await runAI(task, data, { maxTokens: 250, isText: true });
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary.");
  }
}

/**
 * Consolidated Resume Analysis: ONE call for all resume metadata
 */
export async function analyzeResume(resumeContent) {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const task = `Perform comprehensive resume analysis. Return: improvedResume, summary, score (0-100), and improvementTips (array).`;
  const data = `Industry: ${user.industry}, ResumeContent: "${resumeContent}"`;

  try {
    const response = await runAI(task, data, {
      maxTokens: 800,
    });
    
    return {
      improvedResume: response.improvedResume || "",
      summary: response.summary || "",
      score: response.score || 0,
      tips: response.improvementTips || response.tips || [],
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to perform comprehensive resume analysis.");
  }
}
