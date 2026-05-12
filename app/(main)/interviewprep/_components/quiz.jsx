"use client";

import React from "react";
import { useState, useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader, Brain, ArrowRight, CheckCircle2, Zap, Trophy, MessageSquare, LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { generateQuestions, saveQuizResult, evaluateSTARResponse } from "@/actions/interview";
import QuizResult from "./quiz-result";

const Quiz = () => {
  const [mode, setMode] = useState(null); // 'technical' or 'behavioral'
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    techStack: "",
    difficulty: "Intermediate",
    count: 10,
    flavor: "Big Tech"
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [starAnswer, setStarAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);


  const {
    loading: generatingQuestions,
    fn: generateQuestionsFn,
    data: quizData,
  } = useFetch(generateQuestions);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (mode === "behavioral") {
       if (!starAnswer.trim()) {
           toast.error("Please provide an answer to continue.");
           return;
       }

       setEvaluating(true);
       try {
           const evaluation = await evaluateSTARResponse(quizData[currentQuestion].question, starAnswer);
           const newAnswers = [...answers];
           newAnswers[currentQuestion] = { answer: starAnswer, evaluation };
           setAnswers(newAnswers);
           setStarAnswer(""); // Reset for next
       } catch (error) {
           toast.error("AI Evaluation failed. Please try again.");
           console.error(error);
           return;
       } finally {
           setEvaluating(false);
       }
    }

    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateTechnicalScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const calculateBehavioralScore = () => {
     const total = answers.reduce((sum, item) => sum + (item.evaluation?.overallScore || 0), 0);
     return total / quizData.length;
  };

  const finishQuiz = async () => {
    const score = mode === "technical" ? calculateTechnicalScore() : calculateBehavioralScore();
    try {
      await saveQuizResultFn(quizData, answers, score, mode === "technical" ? "Technical" : "Behavioral");
      toast.success("Interview session completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save results");
    }
  };

  const startNewQuiz = (selectedMode) => {
    if (!showConfig && !quizData) {
        setShowConfig(true);
        setMode(selectedMode || mode);
        return;
    }
    
    setMode(selectedMode || mode);
    setCurrentQuestion(0);
    setAnswers([]);
    setStarAnswer("");
    setShowExplanation(false);
    
    const options = { ...config };
    generateQuestionsFn(selectedMode || mode, options);
    setResultData(null);
    setShowConfig(false);
  };


  if (generatingQuestions) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <BarLoader width={"200px"} color="#4F46E5" />
            <p className="text-sm font-black text-primary animate-pulse uppercase tracking-[0.3em]">Calibrating AI Simulator...</p>
        </div>
    );
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={() => setMode(null)} />
      </div>
    );
  }

  if (!mode) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8 mx-2 mt-8"
      >
        <Card className="card-premium border-2 border-primary/10 hover:border-primary/40 transition-all cursor-pointer group p-2 rounded-[2.5rem] bg-white/40 backdrop-blur-3xl overflow-hidden relative" onClick={() => startNewQuiz("technical")}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
             <Brain className="h-40 w-40 text-primary" />
          </div>
          <CardHeader className="p-8 pb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Brain className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Technical MCQ</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
             <p className="text-muted-foreground/80 leading-relaxed font-medium">Verify your domain expertise with 10 industry-specific technical questions.</p>
             <ul className="mt-6 space-y-3">
                {["Knowledge Check", "Instant Feedback", "Performance Trends"].map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}
                    </li>
                ))}
             </ul>
          </CardContent>
          <CardFooter className="p-8">
             <Button className="w-full bg-primary py-7 rounded-2xl font-black uppercase tracking-widest text-[11px] group-hover:translate-x-2 transition-transform">Start Technical Protocol</Button>
          </CardFooter>
        </Card>

        <Card className="card-premium border-2 border-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-pointer group p-2 rounded-[2.5rem] bg-white/40 backdrop-blur-3xl overflow-hidden relative" onClick={() => startNewQuiz("behavioral")}>
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
             <Trophy className="h-40 w-40 text-indigo-500" />
          </div>
          <CardHeader className="p-8 pb-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Trophy className="h-7 w-7 text-indigo-500" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">STAR Behavioral</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
             <p className="text-muted-foreground/80 leading-relaxed font-medium">Master interpersonal scenarios using the Situation-Task-Action-Result framework.</p>
             <ul className="mt-6 space-y-3">
                {["AI STAR Scoring", "Deep Feedback", "Behavioral Calibration"].map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest">
                       <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {t}
                    </li>
                ))}
             </ul>
          </CardContent>
          <CardFooter className="p-8">
             <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-7 rounded-2xl font-black uppercase tracking-widest text-[11px] group-hover:translate-x-2 transition-transform shadow-xl shadow-indigo-500/20">Init STAR Protocol</Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  if (showConfig) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 pt-20">
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-sapphire p-1 gap-1 rounded-[3rem] overflow-hidden gradient-border"
             >
                <div className="bg-white/40 backdrop-blur-3xl p-10 md:p-16 rounded-[2.8rem] space-y-12">
                    <div className="space-y-4 text-center">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-floating">
                            <Zap className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter gradient-title">Simulation Protocol</h2>
                        <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">Configure your assessment heuristics</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Tech Stack — Auto-Detect from Profile */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Domain / Tech Stack</Label>
                            <div className="w-full bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Brain className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-primary">Auto-Detect from Profile</p>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Questions tailored to your industry & skills</p>
                                </div>
                            </div>
                        </div>

                        {/* Level */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Difficulty Level</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Beginner", "Intermediate", "Expert"].map((lvl) => (
                                    <button 
                                        key={lvl}
                                        onClick={() => setConfig({...config, difficulty: lvl})}
                                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                            config.difficulty === lvl 
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                            : "bg-white/40 border-border/40 text-muted-foreground hover:border-primary/20"
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Count */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Matrix Quantity</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 10, 15, 20].map((c) => (
                                    <button 
                                        key={c}
                                        onClick={() => setConfig({...config, count: c})}
                                        className={`py-4 rounded-xl text-sm font-black transition-all border-2 ${
                                            config.count === c 
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                            : "bg-white/40 border-border/40 text-muted-foreground hover:border-primary/20"
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Flavor Selection */}
                        <div className="col-span-full space-y-6 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Company Flavor & Culture</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: "Startup", icon: Zap, title: "Agile Startup", desc: "High growth, multi-role versatile expectations." },
                                    { id: "MNC", icon: LayoutDashboard, title: "MNC Corporate", desc: "Process-driven, structured domain expertise." },
                                    { id: "Big Tech", icon: Trophy, title: "Big Tech", desc: "High scalability and high precision technical bar." }
                                ].map((flav) => (
                                    <button 
                                        key={flav.id}
                                        onClick={() => setConfig({...config, flavor: flav.id})}
                                        className={`p-6 rounded-[2rem] text-left transition-all border-2 flex flex-col gap-3 relative overflow-hidden group ${
                                            config.flavor === flav.id 
                                            ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" 
                                            : "bg-white/40 border-border/40 hover:border-primary/20"
                                        }`}
                                    >
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                                            config.flavor === flav.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                        }`}>
                                            <flav.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black tracking-tight ${config.flavor === flav.id ? "text-primary" : "text-foreground"}`}>{flav.title}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-1">{flav.desc}</p>
                                        </div>
                                        {config.flavor === flav.id && (
                                            <motion.div layoutId="flavor-check" className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="h-4 w-4 text-white" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex flex-col justify-end">
                            <Button 
                                onClick={() => startNewQuiz("technical")}
                                className="w-full bg-primary hover:bg-primary/90 py-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/20 group"
                            >
                                Begin Simulation <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
             </motion.div>
        </div>
    )
  }

  if (mode && (!quizData || quizData.length === 0)) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <BarLoader width={"200px"} color="#4F46E5" />
            <p className="text-sm font-black text-primary animate-pulse uppercase tracking-[0.3em]">Initializing Assessment Data...</p>
        </div>
    );
  }

  const question = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="mb-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{mode === "technical" ? "Technical" : "Behavioral"} Simulation</p>
             <h2 className="text-2xl font-black tracking-tighter text-foreground">Assessment Protocol</h2>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right">Question</p>
             <p className="text-2xl font-black text-foreground">{currentQuestion + 1}<span className="text-muted-foreground/20 mx-1">/</span>{quizData.length}</p>
          </div>
        </div>
        
        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20 shadow-inner">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             className="h-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
           />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={currentQuestion}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="perspective-1000"
        >
          <Card className="card-premium border border-primary/20 shadow-2xl bg-white/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <CardHeader className="p-10 pt-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="p-3 bg-primary/5 rounded-2xl w-fit border border-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  {mode === "behavioral" && (
                    <div className="p-2 px-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       Category: {question.category || "General"}
                    </div>
                  )}
               </div>
               <CardTitle className="text-2xl font-black leading-tight tracking-tight text-foreground">
                 {question.question}
               </CardTitle>
               {mode === "behavioral" && question.description && (
                   <p className="text-xs font-bold text-muted-foreground/60 mt-4 italic">Context: {question.description}</p>
               )}
            </CardHeader>

            <CardContent className="px-10 pb-10 space-y-6">
              {mode === "technical" ? (
                <RadioGroup
                  onValueChange={handleAnswer}
                  value={answers[currentQuestion]}
                  className="grid grid-cols-1 gap-4"
                >
                  {question.options.map((option, index) => (
                    <motion.div key={index} whileHover={{ x: 5 }}>
                      <Label
                        htmlFor={`option-${index}`}
                        className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                          answers[currentQuestion] === option
                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                            : "bg-white/40 border-border/40 hover:border-primary/20 hover:bg-white/60"
                        }`}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} className="sr-only" />
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                           answers[currentQuestion] === option ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}>
                          {answers[currentQuestion] === option && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <span className={`text-[15px] font-black tracking-tight ${
                          answers[currentQuestion] === option ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {option}
                        </span>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-6">
                   <div className="relative">
                      <Textarea 
                        placeholder="Structure your answer: Situation -> Task -> Action -> Result..."
                        value={starAnswer}
                        onChange={(e) => setStarAnswer(e.target.value)}
                        className="min-h-[300px] p-8 rounded-3xl bg-white/40 border-border/40 focus:border-primary/30 transition-all text-[15px] font-medium leading-relaxed shadow-inner"
                      />
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-40">
                         <MessageSquare className="h-4 w-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">STAR AI Console</span>
                      </div>
                   </div>
                   
                   {/* STAR Guide Toggle */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {["Situation", "Task", "Action", "Result"].map(word => (
                           <div key={word} className="p-3 text-center bg-muted/20 border border-border/40 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors hover:bg-primary/5 hover:text-primary hover:border-primary/20">
                               {word}
                           </div>
                       ))}
                   </div>
                </div>
              )}

              <AnimatePresence>
                {showExplanation && mode === "technical" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4"
                  >
                    <Zap className="h-5 w-5 text-indigo-600 mt-1" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Expert Insight</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">{question.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="p-10 bg-slate-50/50 border-t border-border/40 flex items-center justify-between">
              {mode === "technical" ? (
                <Button
                  onClick={() => setShowExplanation(true)}
                  variant="ghost"
                  disabled={!answers[currentQuestion]}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  Show Explanation
                </Button>
              ) : (
                <Button
                   variant="ghost" 
                   onClick={() => setMode(null)}
                   className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500"
                >
                   Abort Session
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={evaluating || savingResult || (mode === "technical" && !answers[currentQuestion]) || (mode === "behavioral" && !starAnswer.trim())}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-95 flex items-center gap-3"
              >
                {evaluating || savingResult ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {currentQuestion < quizData.length - 1 ? "Next Protocol" : "Execute Finish"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
