import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import CoverLetter from "@/models/CoverLetter";
import jwt from "jsonwebtoken";
import { runAI } from "@/lib/ai-service";
import { format } from "date-fns";
import { buildPlainText } from "@/lib/cover-letter-utils";
import { NextResponse } from "next/server";

const DAILY_CL_LIMIT = 3;

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

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
    const letters = await CoverLetter.find({ userId }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({
      success: true,
      data: letters.map(doc => ({ ...doc, id: doc._id.toString() })),
    });
  } catch (error) {
    console.error("[Mobile Cover Letter GET Error]:", error);
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
    const { companyName, jobTitle, jobDescription } = body;

    if (!companyName || !jobTitle || !jobDescription) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Daily limit check
    const { start, end } = getTodayRange();
    const usedToday = await CoverLetter.countDocuments({
      userId,
      createdAt: { $gte: start, $lt: end },
    });

    if (usedToday >= DAILY_CL_LIMIT) {
      return NextResponse.json({
        success: false,
        message: `Daily limit reached (${DAILY_CL_LIMIT} cover letters/day). Try again tomorrow.`
      }, { status: 429 });
    }

    const today = format(new Date(), "MMMM d, yyyy");

    const task = `
Generate a professional cover letter as a JSON object with exactly these keys:
{
  "recipient": "Hiring Manager",
  "company": "${companyName}",
  "position": "${jobTitle}",
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
Company: ${companyName}
Position: ${jobTitle}
Job Description: ${jobDescription}
`;

    const aiResponse = await runAI(task, inputData, {
      maxTokens: 900,
      system: "You are a professional cover letter writer. Output ONLY a valid JSON object with the specified keys. No markdown, no code blocks, no explanations.",
    });

    const structured = {
      recipient:        aiResponse.recipient        || "Hiring Manager",
      company:          aiResponse.company          || companyName,
      position:         aiResponse.position         || jobTitle,
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
      jobDescription,
      companyName,
      jobTitle,
      status:         "completed",
      userId,
    });

    const serialized = JSON.parse(JSON.stringify(coverLetter));

    return NextResponse.json({
      success: true,
      data: { ...serialized, id: serialized._id.toString() },
    });
  } catch (error) {
    console.error("[Mobile Cover Letter POST Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to generate cover letter" }, { status: 500 });
  }
}
