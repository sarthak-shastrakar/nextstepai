import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Resume from "@/models/Resume";
import jwt from "jsonwebtoken";
import { runAI } from "@/lib/ai-service";
import { NextResponse } from "next/server";

async function verifyToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded?.id || null;
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const [user, resume] = await Promise.all([
      User.findById(userId).lean(),
      Resume.findOne({ userId }).lean(),
    ]);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    let formattedResume = null;
    if (resume) {
      const serialized = JSON.parse(JSON.stringify(resume));
      formattedResume = {
        ...serialized,
        id: serialized._id.toString(),
        experience: serialized.experience || [],
        education: serialized.education || [],
        projects: serialized.projects || [],
        skills: serialized.skills || [],
      };
    }

    return NextResponse.json({
      success: true,
      resume: formattedResume,
      user: {
        name: user.name,
        email: user.email,
        industry: user.industry,
        skills: user.skills || [],
      },
    });
  } catch (error) {
    console.error("[Mobile Resume GET Error]:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (action === "save") {
      const { resume: resumeInput } = body;
      if (!resumeInput) {
        return NextResponse.json({ success: false, message: "No resume data provided" }, { status: 400 });
      }

      const { _id, id, userId: omittedUserId, createdAt, updatedAt, __v, ...cleanData } = resumeInput;

      const saved = await Resume.findOneAndUpdate(
        { userId },
        { ...cleanData },
        { returnDocument: "after", upsert: true, runValidators: true }
      ).lean();

      const serialized = JSON.parse(JSON.stringify(saved));
      return NextResponse.json({
        success: true,
        resume: { ...serialized, id: serialized._id.toString() }
      });
    }

    if (action === "ats") {
      const { content, targetRole = "Professional" } = body;
      if (!content) {
        return NextResponse.json({ success: false, message: "No resume content provided for analysis" }, { status: 400 });
      }

      const DAILY_LIMIT = 2;
      const today = new Date().toISOString().slice(0, 10);

      // Check daily ATS usage
      const resumeDoc = await Resume.findOne({ userId }, { aiAtsCount: 1, aiAtsDate: 1 }).lean();
      const sameDay = resumeDoc?.aiAtsDate === today;
      const usedToday = sameDay ? (resumeDoc.aiAtsCount || 0) : 0;

      if (usedToday >= DAILY_LIMIT) {
        return NextResponse.json({
          success: false,
          message: `Daily ATS limit reached (${DAILY_LIMIT} checks/day). Resets in 24h.`
        }, { status: 429 });
      }

      const task = `Analyze resume for "${targetRole}" in ${user.industry}. 
Return JSON:
- qualityScore, matchScore (0-100)
- summary (concise)
- strengths, weaknesses (3 each)
- suggestions (3 quick fixes)
- missingSkills: { hard: string[], soft: string[] } (Top skills missing for role)
- similarRoles (3 related job titles)`;

      try {
        const result = await runAI(task, `Resume: ${content}`, { maxTokens: 600 });
        
        await Resume.findOneAndUpdate(
          { userId },
          { aiAtsDate: today, aiAtsCount: sameDay ? usedToday + 1 : 1 },
          { upsert: true }
        );

        return NextResponse.json({ success: true, result });
      } catch (err) {
        console.error("AI ATS analysis error:", err.message);
        return NextResponse.json({ success: false, message: "Analysis service is currently busy. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Mobile Resume POST Error]:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
