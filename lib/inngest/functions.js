import { inngest } from "./client";
import dbConnect from "../mongoose";
import IndustryInsight from "@/models/IndustryInsight";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights", id: "generate-industry-insights" },
  { cron: "0 0 1 1,7 *" }, // Every 6 months: Jan 1 and Jul 1 at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      await dbConnect();
      const docs = await IndustryInsight.find({}, { industry: 1 }).lean();
      return docs;
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      try {
        const res = await step.ai.wrap(
          "gemini",
          async (p) => {
            return await model.generateContent(p);
          },
          prompt
        );

        const text = res.response.candidates[0].content.parts[0].text || "";
        
        // More robust JSON extraction - look for start { and end }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in AI response");
        
        const insights = JSON.parse(jsonMatch[0].trim());

        await step.run(`Update ${industry} insights`, async () => {
          await dbConnect();
          await IndustryInsight.findOneAndUpdate(
            { industry },
            {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
            },
            { new: true }
          );
        });
      } catch (error) {
        console.error(`Error processing ${industry}:`, error.message);
        // Continue to next industry if one fails
        continue;
      }
    }
  }
);
