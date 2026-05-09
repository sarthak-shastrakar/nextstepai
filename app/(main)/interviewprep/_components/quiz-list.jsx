"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <Card className="card-premium border border-border/40 shadow-2xl glass-subtle overflow-hidden">
        <CardHeader className="pb-8 border-b border-border/40 mx-4 px-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-title text-3xl font-black tracking-tighter">
                Assessment History
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">
                Review your journey toward industry mastery
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/interviewprep/mock")}
              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Start New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-8">
          <div className="space-y-6">
            {assessments?.length > 0 ? (
              assessments.map((assessment, i) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ 
                    scale: 1.01, 
                    x: 10,
                    perspective: 1000,
                    rotateY: -2
                  }}
                  className="cursor-pointer group"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <Card className="border border-border/40 bg-white/40 backdrop-blur-xl group-hover:bg-white/60 group-hover:border-primary/30 transition-all duration-300 shadow-sm group-hover:shadow-xl rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-black text-foreground tracking-tight mb-1">
                            Mock Interview Assessment
                          </CardTitle>
                          <div className="flex items-center gap-3">
                             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-tighter">
                                Score: {assessment.quizScore.toFixed(1)}%
                             </Badge>
                             <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                              {format(new Date(assessment.createdAt), "MMMM dd, yyyy • HH:mm")}
                             </CardDescription>
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                           <ArrowRight className="h-5 w-5 opacity-40 group-hover:opacity-100" />
                        </div>
                      </div>
                    </CardHeader>
                    {assessment.improvementTip && (
                      <CardContent className="px-6 pb-6 pt-0">
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                           <p className="text-[11px] font-bold text-indigo-600/70 leading-relaxed italic">
                             💡 {assessment.improvementTip}
                           </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))
            ) : (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                   <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No assessments yet</p>
                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-2">Start your first mock interview to see analytics</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
