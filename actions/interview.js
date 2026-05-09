"use server";

import { auth } from "@/lib/auth";
import { runAI } from "@/lib/ai-service";
import { mockInterviews, industryMap } from "@/data/mock-interviews";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Assessment from "@/models/Assessment";

function getMockData(industryId, type = "technical", count = 5) {
  const category = industryMap[industryId] || "behavioral";
  const source = type === "behavioral" ? mockInterviews.behavioral : (mockInterviews[category] || mockInterviews.tech);
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function smartInterview({ type = "technical", options = {}, answers = null }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await dbConnect();
  const user = await User.findById(session.user.id, { industry: 1, skills: 1 }).lean();
  if (!user) throw new Error("User not found");

  try {
    if (answers) {
      const prompt = `Input: Q&A:${JSON.stringify(answers)}, Industry:${user.industry}. Task: Evaluate using STAR method (0-5 per category, 0-100 overall). Output: JSON {scores:{situation,task,action,result}, overallScore, feedback, analysis:{situation,task,action,result}, missingKeywords:[3 essential traits/keywords missed]}. Rules: JSON ONLY, < 2 sentences feedback.`;
      try {
        return await runAI(prompt, "Evaluate Interview Answers", { maxTokens: 600 });
      } catch (error) {
        console.error("AI Evaluation failed:", error);
        return {
          scores: { situation: 4, task: 4, action: 4, result: 3 },
          overallScore: 75,
          feedback: "Good response. Try to add more specific metrics to your results.",
          analysis: { situation: "Clear", task: "Defined", action: "Active", result: "Presented" }
        };
      }
    } else {
      const isBehavioral = type === "behavioral";
      const flavor = options.flavor || "General";
      const difficulty = options.difficulty || "Intermediate";
      const prompt = isBehavioral
        ? `Input: Industry:${user.industry}, Flavor:${flavor}, Difficulty:${difficulty}. Task: Generate 5 behavioral questions for STAR method matching ${flavor} culture. Rules: JSON ONLY, concise.`
        : `Input: TechStack:${options.techStack || user.skills}, Lv:${difficulty}, Count:${options.count || 5}, Flavor:${flavor}. Task: Generate technical MCQs. Output: JSON {questions:[{question,options,correctAnswer,explanation}]}. Rules: JSON ONLY.`;

      try {
        const result = await runAI(prompt, "Generate Interview Questions", { maxTokens: 1000 });
        return result.questions || result;
      } catch (error) {
        console.warn("AI Generation failed, using Mock Fallback:", error.message);
        return getMockData(user.industry?.toLowerCase() || "tech", type, options.count || 5);
      }
    }
  } catch (error) {
    console.error("Critical Interview Error:", error);
    throw new Error(`Interview system error: ${error?.message || "Internal error"}`);
  }
}

export async function generateQuestions(type = "technical", options = {}) {
  return await smartInterview({ type, options });
}

export async function generateQuiz() {
  return await generateQuestions("technical");
}

export async function evaluateSTARResponse(question, answer) {
  return await smartInterview({ answers: [{ question, answer }] });
}

export async function saveQuizResult(questions, answers, score, category = "Technical") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  const isTechnical = category === "Technical";

  const questionResults = questions.map((q, index) => {
    if (isTechnical) {
      return {
        question: q.question, answer: q.correctAnswer,
        userAnswer: answers[index], isCorrect: q.correctAnswer === answers[index],
        explanation: q.explanation,
      };
    } else {
      return { question: q.question, userAnswer: answers[index].answer, evaluation: answers[index].evaluation };
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

  try {
    const assessment = await Assessment.create({ userId: user._id, quizScore: score, questions: questionResults, category, improvementTip });
    const serialized = JSON.parse(JSON.stringify(assessment.toObject()));
    return { ...serialized, id: serialized._id.toString() };
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) throw new Error("User not found");

  try {
    const assessments = await Assessment.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const serialized = JSON.parse(JSON.stringify(assessments));
    return serialized.map((a) => ({ ...a, id: a._id.toString() }));
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
