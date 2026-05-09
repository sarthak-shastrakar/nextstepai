import React from "react";
import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import { Badge } from "@/components/ui/badge";

const InterviewPage = async () => {
  const assessments = await getAssessments();

  return (
    <div className="relative">
      {/* Background Mesh for Immersive Feel */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              Simulation Protocol Active
            </div>
            <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 text-[9px] font-black uppercase tracking-widest hidden sm:flex">
              Power Insight v2.0
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-black gradient-title tracking-tighter leading-none">
            Interview Preparation
          </h1>
          <p className="text-muted-foreground/60 text-sm font-medium tracking-tight">
            Master your narrative and industry expertise with <span className="text-foreground font-black">AI-Driven Simulations</span>.
          </p>
        </div>
      </div>

      <div className="space-y-10 pb-20">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
};

export default InterviewPage;
