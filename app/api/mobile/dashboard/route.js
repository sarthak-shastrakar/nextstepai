import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Resume from "@/models/Resume";
import Assessment from "@/models/Assessment";
import CoverLetter from "@/models/CoverLetter";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function calcProfileStrength(user) {
  if (!user) return 0;
  const checks = [
    !!user.name,
    !!user.bio,
    !!user.industry,
    !!user.experience,
    !!user.location,
    !!user.phone,
    user.skills?.length > 0,
    !!user.socialLinks?.linkedin,
    !!user.socialLinks?.github,
    !!(user.profilePicture || user.image),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function calcResumeScore(resume) {
  if (!resume) return 0;
  const checks = [
    !!resume.summary,
    !!resume.skills,
    (resume.experience?.length ?? 0) > 0,
    (resume.education?.length ?? 0) > 0,
    (resume.projects?.length ?? 0) > 0,
    !!resume.contactInfo?.email,
    !!resume.contactInfo?.mobile,
    !!resume.contactInfo?.linkedin,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided. Unauthorized." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token. Unauthorized." },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Malformed token. Unauthorized." },
        { status: 401 }
      );
    }

    await dbConnect();

    const [user, resume, assessments, coverLetters] = await Promise.all([
      User.findById(decoded.id).lean(),
      Resume.findOne({ userId: decoded.id }).lean(),
      Assessment.find({ userId: decoded.id }).sort({ createdAt: -1 }).lean(),
      CoverLetter.find({ userId: decoded.id }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Unauthorized." },
        { status: 401 }
      );
    }

    const profileStrength = calcProfileStrength(user);
    const resumeScore = calcResumeScore(resume);
    const resumesCount = resume ? 1 : 0; // The platform seems to support one primary resume
    
    const interviewsDone = assessments.length;
    const avgInterviewScore =
      interviewsDone > 0
        ? Math.round(
            assessments.reduce((sum, a) => sum + (a.quizScore ?? 0), 0) /
              interviewsDone
          )
        : 0;

    const coverLetterCount = coverLetters.length;

    // Build recent activity mapping
    const activityItems = [];

    if (resume?.updatedAt) {
      activityItems.push({
        id: "resume-updated",
        type: "resume",
        title: "Resume updated",
        date: new Date(resume.updatedAt).toISOString(),
        meta: `Score: ${resumeScore}%`,
      });
    }

    assessments.slice(0, 2).forEach((a, index) => {
      activityItems.push({
        id: `assessment-${a._id || index}`,
        type: "interview",
        title: `Completed ${a.category} mock interview`,
        date: new Date(a.createdAt).toISOString(),
        meta: `Score: ${a.quizScore}%`,
      });
    });

    coverLetters.slice(0, 2).forEach((cl, index) => {
      activityItems.push({
        id: `coverletter-${cl._id || index}`,
        type: "cover-letter",
        title: `Generated letter for ${cl.companyName || "Employer"}`,
        date: new Date(cl.createdAt).toISOString(),
        meta: cl.jobTitle,
      });
    });

    // Sort by date desc
    activityItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivity = activityItems.slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        resumesCount,
        averageInterviewScore: avgInterviewScore,
        coverLettersCount: coverLetterCount,
        profileCompletion: profileStrength,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("[Mobile Dashboard API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
