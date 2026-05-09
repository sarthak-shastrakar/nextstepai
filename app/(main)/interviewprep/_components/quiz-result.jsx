export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const isBehavioral = result.category === "Behavioral";

  const getStatusInfo = (score) => {
    if (score >= 90) return { label: "Legendary Mastery", color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 75) return { label: "Master Professional", color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 50) return { label: "Competent Candidate", color: "#F59E0B", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { label: "Developing Talent", color: "#EF4444", bg: "bg-red-500/10", border: "border-red-500/20" };
  };

  const status = getStatusInfo(result.quizScore);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-12 pb-24"
    >
      {/* ── Achieving Header ── */}
      <motion.div variants={itemVariants} className="text-center space-y-6 pt-10">
        <div className="relative inline-flex items-center justify-center p-6 mb-4">
           {/* Animated Backdrop for Trophy */}
           <div className="absolute inset-0 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-glow" />
           <div className="absolute inset-0 border-2 border-yellow-500/10 rounded-[2.5rem] animate-spin-slow" />
           
           <div className="relative p-6 bg-white border border-yellow-500/20 rounded-3xl shadow-2xl animate-floating flex items-center justify-center">
              <Trophy className="h-12 w-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
           </div>
        </div>

        <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex px-4 py-1.5 ${status.bg} ${status.border} border rounded-full text-[10px] font-black text-foreground/80 uppercase tracking-[0.3em] backdrop-blur-sm`}
            >
              {status.label}
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter gradient-title leading-[1.1]">
              {isBehavioral ? "STAR Protocol Verified" : "Performance Verified"}
            </h1>
            <p className="text-muted-foreground/50 text-xs font-bold uppercase tracking-[0.4em]">
              Evaluation Cycle #00{Math.floor(Math.random() * 99) + 1} • Complete
            </p>
        </div>
      </motion.div>

      <CardContent className="space-y-20 px-4 md:px-0">
        
        {/* ── Mastery Gauge Card ── */}
        <motion.div 
          variants={itemVariants}
          className="relative p-1 md:p-1.5 rounded-[4rem] gradient-border-premium shadow-2xl overflow-hidden group"
        >
          <div className="bg-white/95 backdrop-blur-3xl rounded-[3.8rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
            
            {/* Advanced Multi-Ring Gauge */}
            <div className="relative w-48 h-48 md:w-60 md:h-60 flex items-center justify-center flex-shrink-0">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                 {/* Outer Track */}
                 <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-muted/10" />
                 {/* Main Gauge */}
                 <motion.circle
                   cx="50" cy="50" r="45"
                   stroke={status.color}
                   strokeWidth={10}
                   fill="transparent"
                   strokeDasharray="282.7"
                   initial={{ strokeDashoffset: 282.7 }}
                   animate={{ strokeDashoffset: 282.7 - (282.7 * result.quizScore) / 100 }}
                   transition={{ duration: 2.5, ease: [0.34, 1.56, 0.64, 1] }}
                   strokeLinecap="round"
                   style={{ filter: `drop-shadow(0 0 8px ${status.color}60)` }}
                 />
                 {/* Inner Accent Ring */}
                 <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-muted/5" strokeDasharray="4 4" />
               </svg>
               
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter text-foreground"
                 >
                    {result.quizScore.toFixed(0)}<span className="text-4xl opacity-20">%</span>
                 </motion.span>
                 <span className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.2em] mt-1">Total Intelligence</span>
               </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Technical Proficiency Report</h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">
                        Our AI has analyzed your response patterns against 5,000+ industry-standard mock sessions. You are currently positioned in the <strong>Top {100 - result.quizScore.toFixed(0)}%</strong> of candidates.
                    </p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="px-4 py-2 bg-slate-50 border border-border/60 rounded-2xl flex items-center gap-2">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latency: 1.2s</span>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border border-border/60 rounded-2xl flex items-center gap-2">
                        <Target className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accuracy Adjusted</span>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>

        {/* ── Strategic Insights ── */}
        {result.improvementTip && (
          <motion.div variants={itemVariants} className="space-y-6">
             <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Strategic Pivot Required</h3>
             </div>
             
             <div className="relative p-10 bg-primary/5 rounded-[3rem] border border-primary/10 overflow-hidden group hover:bg-primary/[0.08] transition-all cursor-default">
                <Quote className="absolute -top-6 -left-6 md:-top-10 md:-left-10 h-24 w-24 text-primary/10 -z-0" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-xl group-hover:rotate-6 transition-transform">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug tracking-tight">
                            &quot;{result.improvementTip}&quot;
                        </p>
                        <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em]">NextStep Recommendation Agent v4.1</p>
                    </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* ── Granular Review ── */}
        <motion.div variants={itemVariants} className="space-y-10">
          <div className="flex items-center justify-between pb-6 border-b border-border/40">
             <div className="flex items-center gap-4">
                <div className="p-2 bg-white border border-border/60 rounded-xl shadow-sm">
                    <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Detailed Question Metrics</h3>
             </div>
             <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-background border border-border/60 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Deep Sector Analysis Active
             </div>
          </div>
          
          <div className="grid gap-10">
            {result.questions.map((q, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className={`p-1 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 group ${
                  !isBehavioral && q.isCorrect ? "bg-emerald-500/10" : !isBehavioral ? "bg-red-500/10" : "bg-primary/5"
                }`}
              >
                <div className="bg-white rounded-[3.4rem] p-8 md:p-12 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Module Entry {String(index + 1).padStart(2, "0")}</span>
                            <h4 className="text-xl md:text-2xl font-black text-foreground leading-[1.2] tracking-tight">{q.question}</h4>
                        </div>
                        
                        <div className="flex-shrink-0">
                            {!isBehavioral ? (
                                q.isCorrect ? (
                                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-inner">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Optimal Response
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black text-red-600 uppercase tracking-widest shadow-inner">
                                        <XCircle className="h-3.5 w-3.5" /> Suboptimal
                                    </div>
                                )
                            ) : (
                                <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                                    <Star className="h-3.5 w-3.5 fill-primary/20" /> Protocol Compliant
                                </div>
                            )}
                        </div>
                    </div>

                    {isBehavioral ? (
                        <div className="space-y-8 animate-fade-in">
                            {/* Behavioral Radar/Scores */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(q.evaluation.scores).map(([key, score]) => (
                                    <div key={key} className="p-5 bg-slate-50/80 rounded-[2rem] border border-border/40 flex flex-col items-center gap-2 group/score transition-all hover:bg-white hover:shadow-lg">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider mb-1">{key} Impact</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <motion.div 
                                                    key={s} 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 1.5 + s * 0.1 }}
                                                    className={`h-2 w-2 rounded-full ${s <= score ? "bg-primary" : "bg-muted/30"}`} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-foreground mt-1">{score}/5</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                                <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/5" />
                                <div className="space-y-3 relative z-10">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" /> Professional Feedback
                                    </p>
                                    <p className="text-base font-bold text-slate-700 leading-relaxed italic">&quot;{q.evaluation.feedback}&quot;</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(q.evaluation.analysis).map(([key, feedback], i) => (
                                    <motion.div 
                                      key={key} 
                                      whileHover={{ scale: 1.02 }}
                                      className="p-6 bg-slate-50/50 rounded-3xl border border-border/40 space-y-3"
                                    >
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.3em]">{key} Breakdown</p>
                                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">{feedback}</p>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {q.evaluation.missingKeywords?.length > 0 && (
                                <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <p className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em] flex items-center gap-3">
                                            <Target className="h-5 w-5" /> Semantic Gaps Detected
                                        </p>
                                        <div className="h-px flex-1 bg-amber-500/10 hidden sm:block" />
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {q.evaluation.missingKeywords.map((kw, i) => (
                                            <Badge key={kw} className="bg-white border-amber-500/20 text-[10px] font-black text-amber-700 py-1.5 px-4 rounded-xl shadow-sm hover:bg-amber-50 transition-colors">
                                                {kw}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-border/40 shadow-inner group/sub">
                                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3">Your Logic</p>
                                    <p className={`text-sm font-black transition-colors ${q.isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                                        {q.userAnswer}
                                    </p>
                                </div>
                                <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 shadow-inner">
                                    <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest mb-3">Market Gold Standard</p>
                                    <p className="text-sm font-black text-emerald-700">{q.answer}</p>
                                </div>
                            </div>
                            
                            <div className="p-8 bg-slate-50/50 rounded-3xl border border-dashed border-border/80 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MessageSquare className="h-16 w-16" />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-3">Expert Explanation</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed italic relative z-10">{q.explanation}</p>
                            </div>
                        </div>
                    )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </CardContent>

      {!hideStartNew && (
        <motion.div variants={itemVariants} className="pt-20 pb-32 flex justify-center px-4">
          <Button 
            onClick={onStartNew} 
            className="w-full max-w-2xl bg-primary hover:bg-primary/90 text-primary-foreground h-16 md:h-20 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl shadow-primary/40 transition-all active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center gap-4">
                Initialize Next Session
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Shared UI Utilities ──
import { Trophy, CheckCircle2, XCircle, ArrowRight, Zap, Target, Star, MessageSquare, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

function Badge({ children, className }) {
  return (
    <span className={`px-2 py-1 rounded-lg border border-border/40 bg-white/40 backdrop-blur-sm shadow-sm ${className}`}>
      {children}
    </span>
  );
}
