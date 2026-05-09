"use server";

// ── This file is kept for backward compatibility only ──────────
// All industry insight logic has been moved to actions/industryInsight.js
// which uses per-user MongoDB caching + Gemini/OpenRouter AI.

// export { getIndustryInsights } from "@/actions/industryInsight";

import { getIndustryInsights as _getIndustryInsights } from "@/actions/industryInsight";

export async function getIndustryInsights(...args) {
  return _getIndustryInsights(...args);
}
//  newcode

// Legacy AI helper kept for other actions (resume, cover letter, etc.)
import { runAI } from "@/lib/ai-service";

export const generateAIInsights = async (industry) => {
  const prompt = `Generate real 2025 market data for the "${industry}" industry in India. Respond ONLY with minified JSON matching this exact schema (no extra text, no markdown):
   {"salaryRanges":[{"role":"","min":0,"max":0,"median":0}],"growthRate":0,"demandLevel":"HIGH|MEDIUM|LOW","topSkills":[],"marketOutlook":"POSITIVE|NEUTRAL|NEGATIVE","keyTrends":[],"recommendedSkills":[],"hiringTrends":{"remote":0,"hybrid":0,"onsite":0},"skillSalaryBoost":[{"skill":"","boostPercent":0}],"entryLevelTips":[],"switchTips":[],"topJobTitles":[]}
   Rules: salaryRanges=5 roles based in India, growthRate=realistic YoY%, topSkills=5, keyTrends=5, hiringTrends sums to 100, skillSalaryBoost=4 skills, entryLevelTips=3 items, switchTips=3 items, topJobTitles=5.
   IMPORTANT: ALL SALARY VALUES MUST BE IN INDIAN RUPEES (INR). Use large numbers like 700000 for 7 Lakhs. DO NOT USE USD.`;
  try {
    return await runAI(prompt, industry, { maxTokens: 1100 });
  } catch (error) {
    console.error("AI Insight Generation Error:", error);
    return {
      salaryRanges: [], growthRate: 0, demandLevel: "MEDIUM", topSkills: [],
      marketOutlook: "NEUTRAL", keyTrends: [], recommendedSkills: [],
      hiringTrends: { remote: 35, hybrid: 45, onsite: 20 },
      skillSalaryBoost: [], entryLevelTips: [], switchTips: [], topJobTitles: [],
    };
  }
};
