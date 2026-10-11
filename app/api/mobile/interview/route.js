import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Assessment from "@/models/Assessment";
import jwt from "jsonwebtoken";
import { runAI } from "@/lib/ai-service";
import { mockInterviews, industryMap } from "@/data/mock-interviews";
import { NextResponse } from "next/server";

function getMockData(industryId, type = "technical", count = 5) {
  const category = industryMap[industryId] || "behavioral";
  const source = type === "behavioral" ? mockInterviews.behavioral : (mockInterviews[category] || mockInterviews.tech);
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
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
    const assessments = await Assessment.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: assessments.map(doc => ({ ...doc, id: doc._id.toString() })),
    });
  } catch (error) {
    console.error("[Mobile Interview GET Error]:", error);
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

    if (action === "generate") {
      const { type = "technical", difficulty = "Intermediate", count = 5, techStack } = body;
      const isBehavioral = type === "behavioral";
      const flavor = "General";
      const prompt = isBehavioral
        ? `Input: Industry:${user.industry}, Flavor:${flavor}, Difficulty:${difficulty}. Task: Generate 5 behavioral questions for STAR method matching ${flavor} culture. Rules: JSON ONLY, concise.`
        : `Input: TechStack:${techStack || user.skills?.join(", ") || "software engineering"}, Lv:${difficulty}, Count:${count}, Flavor:${flavor}. Task: Generate technical MCQs. Output: JSON {questions:[{question,options,correctAnswer,explanation}]}. Rules: JSON ONLY.`;

      try {
        const result = await runAI(prompt, "Generate Interview Questions", { maxTokens: 1000 });
        const finalQuestions = result.questions || result;
        return NextResponse.json({ success: true, questions: finalQuestions });
      } catch (err) {
        console.warn("AI Question Generation failed, using fallback:", err.message);
        const fallback = getMockData(user.industry?.toLowerCase() || "tech", type, count);
        return NextResponse.json({ success: true, questions: fallback });
      }
    }

    if (action === "submit") {
      const { questions, answers, score, category = "Technical" } = body;

      if (!questions || !answers || score === undefined) {
        return NextResponse.json({ success: false, message: "Missing request parameters" }, { status: 400 });
      }

      const isTechnical = category === "Technical";
      const questionResults = questions.map((q, index) => {
        if (isTechnical) {
          return {
            question: q.question,
            answer: q.correctAnswer,
            userAnswer: answers[index],
            isCorrect: q.correctAnswer === answers[index],
            explanation: q.explanation || "",
          };
        } else {
          return {
            question: q.question,
            userAnswer: answers[index]?.answer || "",
            evaluation: answers[index]?.evaluation || "Reviewed",
          };
        }
      });

      let improvementTip = null;

      if (isTechnical) {
        const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
        if (wrongAnswers.length > 0) {
          const wrongText = wrongAnswers.map((q) => `Q: ${q.question}, Correct: ${q.answer}, User: ${q.userAnswer}`).join("\n");
          const prompt = `Input: Wrong:${wrongText}, Industry:${user.industry}. Task: Give 1-2 sentence encouraging improvement tip. Rules: plain text only.`;
          try {
            improvementTip = await runAI(prompt, "Generate Improvement Tip", { maxTokens: 150, isText: true });
          } catch (error) {
            console.error("Error generating improvement tip:", error);
          }
        }
      } else {
        improvementTip = "Focus on quantifying your results and clarifying your specific actions using the STAR method.";
      }

      const assessment = await Assessment.create({
        userId,
        quizScore: score,
        questions: questionResults,
        category,
        improvementTip,
      });

      const serialized = JSON.parse(JSON.stringify(assessment));

      return NextResponse.json({
        success: true,
        data: { ...serialized, id: serialized._id.toString() },
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Mobile Interview POST Error]:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
