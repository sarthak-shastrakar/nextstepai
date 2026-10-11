import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import IndustryInsight from "@/models/IndustryInsight";
import { runAI } from "@/lib/ai-service";
import { NextResponse } from "next/server";

const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function calcReadinessScore(user, topSkills = []) {
  let score = 0;
  if (topSkills.length > 0 && user.skills?.length > 0) {
    const userSet = new Set(user.skills.map((s) => s.toLowerCase()));
    const matched = topSkills.filter((s) => userSet.has(s.toLowerCase())).length;
    score += Math.round((matched / topSkills.length) * 40);
  }
  const expMap = { fresher: 10, junior: 20, mid: 28, senior: 30 };
  score += expMap[user.experience] ?? 10;
  const checks = [!!user.name, !!user.email, !!user.industry, !!user.skills?.length, !!user.experience];
  score += Math.round((checks.filter(Boolean).length / checks.length) * 30);
  return Math.min(score, 100);
}

function buildPrompt(user) {
  const skillsList = user.skills?.join(", ") || "General skills";
  const expLabel =
    user.experience === "fresher" ? "0-1 year" :
    user.experience === "junior" ? "1-3 years" :
    user.experience === "mid"    ? "3-6 years" :
    user.experience === "senior" ? "6+ years"  : "Entry level";

  return `You are a market analyst for the Indian job market in 2025.
Generate comprehensive industry data for:
- Industry: ${user.industry}
- Sub-industry: ${user.subIndustry || "General"}
- User Skills: ${skillsList}
- Experience: ${expLabel}

Return ONLY this exact JSON structure (no markdown, no extra text):
{
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "growthRate": <number>,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "salaryRanges": [{ "role": "<role>", "min": <INR>, "max": <INR>, "median": <INR> }],
  "salaryByExperience": {
    "fresher": { "min": <INR>, "max": <INR> },
    "junior": { "min": <INR>, "max": <INR> },
    "mid": { "min": <INR>, "max": <INR> },
    "senior": { "min": <INR>, "max": <INR> }
  },
  "hiringTrends": { "remote": <0-100>, "hybrid": <0-100>, "onsite": <0-100> },
  "topSkills": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
  "skillSalaryBoost": [{ "skill": "<name>", "boostPercent": <number> }],
  "topJobTitles": ["<title1>", "<title2>", "<title3>", "<title4>", "<title5>"],
  "topCompanies": [{ "name": "<company>", "role": "<role>", "location": "<city, India>" }],
  "keyTrends": ["<trend1>", "<trend2>", "<trend3>", "<trend4>", "<trend5>"],
  "entryLevelTips": ["<tip1>", "<tip2>", "<tip3>"],
  "switchTips": ["<tip1>", "<tip2>", "<tip3>"],
  "certifications": [{ "name": "<cert>", "provider": "<provider>", "boostPercent": <number> }]
}
Rules:
- ALL salaries in INR full numbers (e.g. 600000 for 6 LPA)
- salaryRanges: exactly 5 real roles in ${user.industry} in India
- hiringTrends values must sum to exactly 100
- topSkills: 5 most in-demand skills for this industry in India
- skillSalaryBoost: exactly 4 skills
- topJobTitles: 5 most hired roles right now
- topCompanies: exactly 5 top companies actively hiring
- keyTrends: 5 major trends
- certifications: exactly 3
- entryLevelTips and switchTips: 3 tips each`;
}

function getLockInfo(doc) {
  if (!doc?.lastManualRefreshAt) return { manualRefreshLocked: false, manualRefreshUnlockAt: null };
  const elapsed = Date.now() - new Date(doc.lastManualRefreshAt).getTime();
  const locked = elapsed < THIRTY_DAYS;
  return {
    manualRefreshLocked: locked,
    manualRefreshUnlockAt: locked ? new Date(new Date(doc.lastManualRefreshAt).getTime() + THIRTY_DAYS) : null,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, forceRefresh = false } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    if (!user.industry) return NextResponse.json({ success: false, message: "Please complete your profile to view industry insights." }, { status: 400 });

    let existing = await IndustryInsight.findOne({ userId: user._id }).lean();

    // Manual refresh lock guard
    if (forceRefresh && existing) {
      const { manualRefreshLocked, manualRefreshUnlockAt } = getLockInfo(existing);
      if (manualRefreshLocked) {
        const readinessScore = calcReadinessScore(user, existing.topSkills);
        return NextResponse.json({
          success: true,
          fromCache: true,
          manualRefreshLocked: true,
          manualRefreshUnlockAt,
          readinessScore,
          userSkills: user.skills || [],
          userExperience: user.experience,
          ...JSON.parse(JSON.stringify(existing)),
        });
      }
    }

    const isExpired =
      !existing ||
      existing.industry !== user.industry ||
      Date.now() - new Date(existing.lastGeneratedAt).getTime() > SIX_MONTHS;

    if (existing && !isExpired && !forceRefresh) {
      const readinessScore = calcReadinessScore(user, existing.topSkills);
      return NextResponse.json({
        success: true,
        fromCache: true,
        readinessScore,
        userSkills: user.skills || [],
        userExperience: user.experience,
        ...getLockInfo(existing),
        ...JSON.parse(JSON.stringify(existing)),
      });
    }

    // Generate fresh AI data
    const prompt = buildPrompt(user);
    const userContext = `Industry: ${user.industry}, SubIndustry: ${user.subIndustry || "General"}, Skills: ${(user.skills || []).join(", ")}, Experience: ${user.experience || "fresher"}`;
    let aiData;

    try {
      aiData = await runAI(prompt, userContext, {
        maxTokens: 2000,
        retryCount: 3,
        isText: false,
        system: "You are a professional career analyst for the Indian job market 2025. Output JSON ONLY — no markdown, no extra text, no code fences.",
      });
    } catch (err) {
      console.error("[Mobile Insights] AI generation failed:", err.message);
      if (existing) {
        const readinessScore = calcReadinessScore(user, existing.topSkills);
        return NextResponse.json({
          success: true,
          fromCache: true,
          aiError: true,
          readinessScore,
          userSkills: user.skills || [],
          userExperience: user.experience,
          ...getLockInfo(existing),
          ...JSON.parse(JSON.stringify(existing)),
        });
      }
      return NextResponse.json({ success: false, message: "AI generation failed and no cached data available" }, { status: 500 });
    }

    // Normalize hiringTrends
    if (aiData.hiringTrends) {
      const ht = aiData.hiringTrends;
      const total = (ht.remote || 0) + (ht.hybrid || 0) + (ht.onsite || 0);
      if (total !== 100 && total > 0) {
        ht.remote = Math.round((ht.remote / total) * 100);
        ht.hybrid = Math.round((ht.hybrid / total) * 100);
        ht.onsite = 100 - ht.remote - ht.hybrid;
      }
    }

    const nextUpdate = new Date(Date.now() + SIX_MONTHS);
    const manualRefreshStamp = forceRefresh ? { lastManualRefreshAt: new Date() } : {};

    const docPayload = {
      userId: user._id,
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
      topJobTitles: aiData.topJobTitles || [],
      topCompanies: aiData.topCompanies || [],
      keyTrends: aiData.keyTrends || [],
      entryLevelTips: aiData.entryLevelTips || [],
      switchTips: aiData.switchTips || [],
      certifications: aiData.certifications || [],
      lastGeneratedAt: new Date(),
      nextUpdate,
      ...manualRefreshStamp,
    };

    const saved = await IndustryInsight.findOneAndUpdate(
      { userId: user._id },
      { $set: docPayload },
      { upsert: true, returnDocument: "after" }
    ).lean();

    const readinessScore = calcReadinessScore(user, docPayload.topSkills);

    return NextResponse.json({
      success: true,
      fromCache: false,
      manualRefreshLocked: false,
      manualRefreshUnlockAt: forceRefresh ? new Date(Date.now() + THIRTY_DAYS) : null,
      readinessScore,
      userSkills: user.skills || [],
      userExperience: user.experience,
      ...JSON.parse(JSON.stringify(saved)),
    });
  } catch (error) {
    console.error("[Mobile Insights API Error]:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
