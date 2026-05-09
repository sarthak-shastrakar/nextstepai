"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import IndustryInsight from "@/models/IndustryInsight";
import { runAI } from "@/lib/ai-service";

// ─── AI Wrapper ──────────────────────────────────────────────────────────────
// Uses existing runAI (OpenRouter → google/gemini-3-flash-preview) which is
// already proven to work across the rest of the app.
async function generateWithAI(prompt, userContext) {
  return await runAI(
    prompt,
    userContext,
    {
      maxTokens: 2000,
      retryCount: 3,
      isText: false,
      system:
        "You are a professional career analyst for the Indian job market 2025. Output JSON ONLY — no markdown, no extra text, no code fences.",
    }
  );
}

// ─── Readiness Score Calculator ──────────────────────────────────────────────

function calcReadinessScore(user, topSkills = []) {
  let score = 0;

  // 40% — Skills match
  if (topSkills.length > 0 && user.skills?.length > 0) {
    const userSet = new Set(user.skills.map((s) => s.toLowerCase()));
    const matched = topSkills.filter((s) => userSet.has(s.toLowerCase())).length;
    score += Math.round((matched / topSkills.length) * 40);
  }

  // 30% — Experience level
  const expMap = { fresher: 10, junior: 20, mid: 28, senior: 30 };
  score += expMap[user.experience] ?? 10;

  // 30% — Profile completeness
  const checks = [
    !!user.name,
    !!user.email,
    !!user.industry,
    !!user.skills?.length,
    !!user.experience,
    !!user.bio,
    !!user.location,
    !!user.phone,
    !!user.username,
    user.profileCompleted,
  ];
  const completePct = checks.filter(Boolean).length / checks.length;
  score += Math.round(completePct * 30);

  return Math.min(score, 100);
}

// ─── AI Prompt Builder ───────────────────────────────────────────────────────

function buildPrompt(user) {
  const skillsList = user.skills?.join(", ") || "General skills";
  const expLabel =
    user.experience === "fresher"
      ? "0-1 year"
      : user.experience === "junior"
      ? "1-3 years"
      : user.experience === "mid"
      ? "3-6 years"
      : user.experience === "senior"
      ? "6+ years"
      : "Entry level";

  return `You are a market analyst for the Indian job market in 2025.
Generate comprehensive industry data for:
- Industry: ${user.industry}
- Sub-industry: ${user.subIndustry || "General"}
- User Skills: ${skillsList}
- Experience: ${expLabel}

Return ONLY this exact JSON structure (no markdown, no extra text):
{
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "growthRate": <number: realistic YoY % growth, e.g. 18.5>,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "salaryRanges": [
    { "role": "<role name>", "min": <INR annual>, "max": <INR annual>, "median": <INR annual> }
  ],
  "salaryByExperience": {
    "fresher": { "min": <INR>, "max": <INR>, "label": "0-1 year" },
    "junior": { "min": <INR>, "max": <INR>, "label": "1-3 years" },
    "mid": { "min": <INR>, "max": <INR>, "label": "3-6 years" },
    "senior": { "min": <INR>, "max": <INR>, "label": "6+ years" }
  },
  "hiringTrends": { "remote": <0-100>, "hybrid": <0-100>, "onsite": <0-100> },
  "topSkills": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
  "skillSalaryBoost": [
    { "skill": "<name>", "boostPercent": <number> }
  ],
  "topJobTitles": ["<title1>", "<title2>", "<title3>", "<title4>", "<title5>"],
  "topCompanies": [
    { "name": "<company>", "role": "<top role>", "location": "<city, India>", "badge": "Hiring Now" }
  ],
  "keyTrends": ["<trend1>", "<trend2>", "<trend3>", "<trend4>", "<trend5>"],
  "entryLevelTips": ["<tip1>", "<tip2>", "<tip3>"],
  "switchTips": ["<tip1>", "<tip2>", "<tip3>"],
  "certifications": [
    { "name": "<certification name>", "provider": "<provider>", "boostPercent": <number>, "link": "" }
  ]
}

Rules:
- ALL salary values must be in Indian Rupees (INR) as full numbers (e.g. 600000 for 6 LPA)
- salaryRanges: exactly 5 real roles common in ${user.industry} in India
- hiringTrends values must sum to exactly 100
- topSkills: 5 most in-demand skills for this industry in India
- skillSalaryBoost: exactly 4 high-value skills with realistic boost %
- topJobTitles: 5 most commonly hired roles right now
- topCompanies: exactly 5 top Indian/MNC companies actively hiring
- keyTrends: 5 major trends reshaping this industry
- certifications: exactly 3 certifications that significantly boost salary
- entryLevelTips and switchTips: 3 actionable tips each`;
}

// ─── Main Server Action ───────────────────────────────────────────────────────

export async function getIndustryInsights(forceRefresh = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await dbConnect();
  
  // Removed IndustryInsight.syncIndexes() from here - it's a heavy operation and should not run on every request.
  // It's better to manage indexes in the model definition or via a migration script.

  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");
  if (!user.industry)
    throw new Error("Please complete your profile to view industry insights.");

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const userId = user._id;

  // ── Step 1: Check MongoDB cache ──────────────────────────────────────────
  let existing = await IndustryInsight.findOne({ userId }).lean();

  const isExpired =
    !existing ||
    existing.industry !== user.industry ||
    Date.now() - new Date(existing.lastGeneratedAt).getTime() > THIRTY_DAYS;

  if (existing && !isExpired && !forceRefresh) {
    // ── Step 2: Serve from cache ─────────────────────────────────────────
    const readinessScore = calcReadinessScore(user, existing.topSkills);
    const serialized = JSON.parse(JSON.stringify(existing));
    return {
      ...serialized,
      readinessScore,
      userSkills: user.skills || [],
      userExperience: user.experience,
      fromCache: true,
      daysAgo: Math.floor(
        (Date.now() - new Date(existing.lastGeneratedAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }

  // ── Step 3: Generate fresh AI data ──────────────────────────────────────
  const prompt = buildPrompt(user);
  const userContext = `Industry: ${user.industry}, SubIndustry: ${user.subIndustry || 'General'}, Skills: ${(user.skills || []).join(', ')}, Experience: ${user.experience || 'fresher'}`;
  let aiData;
  try {
    aiData = await generateWithAI(prompt, userContext);
  } catch (err) {
    console.error("[Industry Insights] AI generation failed:", err.message);
    // Return cached data if we have it (even if expired) rather than nothing
    if (existing) {
      const readinessScore = calcReadinessScore(user, existing.topSkills);
      const serialized = JSON.parse(JSON.stringify(existing));
      return {
        ...serialized,
        readinessScore,
        userSkills: user.skills || [],
        userExperience: user.experience,
        fromCache: true,
        aiError: true,
        daysAgo: Math.floor(
          (Date.now() - new Date(existing.lastGeneratedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
    }
    throw err;
  }

  const nextUpdate = new Date(Date.now() + THIRTY_DAYS);

  // Normalize hiringTrends to sum to 100
  if (aiData.hiringTrends) {
    const ht = aiData.hiringTrends;
    const total = (ht.remote || 0) + (ht.hybrid || 0) + (ht.onsite || 0);
    if (total !== 100 && total > 0) {
      ht.remote = Math.round((ht.remote / total) * 100);
      ht.hybrid = Math.round((ht.hybrid / total) * 100);
      ht.onsite = 100 - ht.remote - ht.hybrid;
    }
  }

  const docPayload = {
    userId,
    industry: user.industry,
    subIndustry: user.subIndustry || "",
    marketOutlook: aiData.marketOutlook || "NEUTRAL",
    growthRate: aiData.growthRate || 0,
    demandLevel: aiData.demandLevel || "MEDIUM",
    salaryRanges: aiData.salaryRanges || [],
    salaryByExperience: aiData.salaryByExperience || {},
    hiringTrends: aiData.hiringTrends || { remote: 35, hybrid: 45, onsite: 20 },
    topSkills: aiData.topSkills || [],
    skillSalaryBoost: aiData.skillSalaryBoost || [],
    skillsGap: [], // computed client-side from topSkills vs userSkills
    topJobTitles: aiData.topJobTitles || [],
    topCompanies: aiData.topCompanies || [],
    keyTrends: aiData.keyTrends || [],
    entryLevelTips: aiData.entryLevelTips || [],
    switchTips: aiData.switchTips || [],
    certifications: aiData.certifications || [],
    lastGeneratedAt: new Date(),
    nextUpdate,
  };

  // ── Step 4: Save to MongoDB (upsert) ────────────────────────────────────
  const saved = await IndustryInsight.findOneAndUpdate(
    { userId },
    { $set: docPayload },
    { upsert: true, returnDocument: "after" }
  ).lean();

  const readinessScore = calcReadinessScore(user, docPayload.topSkills);
  const serialized = JSON.parse(JSON.stringify(saved));

  return {
    ...serialized,
    readinessScore,
    userSkills: user.skills || [],
    userExperience: user.experience,
    fromCache: false,
    daysAgo: 0,
  };
}
