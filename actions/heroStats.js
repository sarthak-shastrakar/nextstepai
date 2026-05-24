"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Resume from "@/models/Resume";
import Assessment from "@/models/Assessment";
import CoverLetter from "@/models/CoverLetter";

/**
 * Calculate profile strength (0-100) based on how many fields the user has filled.
 */
function calcProfileStrength(user) {
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

/**
 * Calculate resume completeness score (0-100) based on filled resume fields.
 */
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

export async function getHeroStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      resumeScore: 0,
      interviewsDone: 0,
      avgInterviewScore: 0,
      coverLetterCount: 0,
      profileStrength: 0,
      skills: [],
      recentActivity: [],
      hasResume: false,
    };
  }

  await dbConnect();

  const [user, resume, assessments, coverLetters] = await Promise.all([
    User.findById(session.user.id).lean(),
    Resume.findOne({ userId: session.user.id }).lean(),
    Assessment.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    CoverLetter.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
  ]);

  // ── Resume score ──────────────────────────────────────────────
  const resumeScore = calcResumeScore(resume);

  // ── Interview stats ───────────────────────────────────────────
  const interviewsDone = assessments.length;
  const avgInterviewScore =
    interviewsDone > 0
      ? Math.round(
          assessments.reduce((sum, a) => sum + (a.quizScore ?? 0), 0) /
            interviewsDone
        )
      : 0;

  // ── Cover letters ─────────────────────────────────────────────
  const coverLetterCount = coverLetters.length;

  // ── Profile strength ──────────────────────────────────────────
  const profileStrength = calcProfileStrength(user);

  // ── Skills ───────────────────────────────────────────────────
  const skills = user?.skills?.slice(0, 5) ?? [];

  // ── Recent Activity (last 4 events across all docs) ───────────
  const activityItems = [];

  if (resume?.updatedAt) {
    activityItems.push({
      type: "resume",
      text: "Resume updated",
      time: new Date(resume.updatedAt).toISOString(),
      href: "/resume",
    });
  }

  assessments.slice(0, 2).forEach((a) => {
    activityItems.push({
      type: "interview",
      text: `Completed ${a.category} interview — ${a.quizScore}%`,
      time: new Date(a.createdAt).toISOString(),
      href: "/interviewprep",
    });
  });

  coverLetters.slice(0, 2).forEach((cl) => {
    activityItems.push({
      type: "cover",
      text: `Cover letter for ${cl.companyName || "a company"}`,
      time: new Date(cl.createdAt).toISOString(),
      href: "/cover-letter",
    });
  });

  // Sort by date desc, take top 3
  activityItems.sort((a, b) => new Date(b.time) - new Date(a.time));
  const recentActivity = activityItems.slice(0, 3);

  return {
    resumeScore,
    interviewsDone,
    avgInterviewScore,
    coverLetterCount,
    profileStrength,
    skills,
    recentActivity,
    hasResume: !!resume,
  };
}
