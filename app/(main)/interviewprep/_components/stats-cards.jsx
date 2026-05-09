"use client";

import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  const stats = [
    {
      title: "Average Score",
      value: `${getAverageScore()}%`,
      icon: Trophy,
      description: "Across all assessments",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Questions Practiced",
      value: getTotalQuestions(),
      icon: Brain,
      description: "Total questions",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Latest Score",
      value: `${getLatestAssessment()?.quizScore.toFixed(1) || 0}%`,
      icon: Target,
      description: "Most recent quiz",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ 
            rotateY: 10, 
            rotateX: -5, 
            perspective: 1000,
            scale: 1.02 
          }}
          className="h-full"
        >
          <Card className={`card-premium h-full border ${stat.border} shadow-xl bg-white/80 backdrop-blur-3xl overflow-hidden group transition-all duration-500`}>
            {/* Animated Background Mesh */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 ${stat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500`} />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black tracking-tighter text-foreground mb-1">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
