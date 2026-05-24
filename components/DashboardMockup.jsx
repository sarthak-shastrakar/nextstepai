"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText, MessageSquare, FileSignature,
  TrendingUp, BrainCircuit, CheckCircle2,
  Sparkles, ArrowRight, Star,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import { getHeroStats } from "@/actions/heroStats";

// ── Fallback static data (shown when user has no data yet) ───────
const FALLBACK = {
  resumeScore: 92,
  interviewsDone: 24,
  coverLetterCount: 8,
  profileStrength: 95,
  avgInterviewScore: 88,
  skills: ["React", "Node.js", "Python", "AWS", "System Design"],
  recentActivity: [
    { type: "resume",    text: "Resume updated",         time: new Date(Date.now() - 2 * 3600000).toISOString(),      href: "/resume" },
    { type: "interview", text: "Interview completed",    time: new Date(Date.now() - 1 * 86400000).toISOString(),     href: "/interviewprep" },
    { type: "cover",     text: "Cover letter generated", time: new Date(Date.now() - 2 * 86400000).toISOString(),     href: "/cover-letter" },
  ],
  hasResume: true,
};

// ── Resume weekly progress chart data ───────────────────────────
const CHART_DATA = [
  { name: "Week 1", score: 45 },
  { name: "Week 2", score: 58 },
  { name: "Week 3", score: 67 },
  { name: "Week 4", score: 78 },
  { name: "Week 5", score: 92 },
];

// ── Static interview breakdown bars ─────────────────────────────
const INTERVIEW_METRICS = [
  { label: "Technical",       color: "from-indigo-500 to-indigo-600"  },
  { label: "Communication",   color: "from-purple-500 to-purple-600"  },
  { label: "Problem Solving", color: "from-violet-500 to-violet-600"  },
];

// ── Activity icon map ────────────────────────────────────────────
const ACTIVITY_ICONS = {
  resume:    { Icon: CheckCircle2,  color: "text-emerald-500" },
  interview: { Icon: Star,          color: "text-amber-500"   },
  cover:     { Icon: FileSignature, color: "text-indigo-500"  },
};

// ── Time-ago helper ──────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

// ── Animated Number ──────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    setCur(0);
    const steps = 40;
    let count = 0;
    const inc = value / steps;
    const timer = setInterval(() => {
      count++;
      setCur((p) => { const n = p + inc; return n >= value ? value : n; });
      if (count >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{Math.floor(cur)}</>;
}

// ── Skeleton shimmer block ───────────────────────────────────────
function Shimmer({ className = "" }) {
  return (
    <div className={`rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${className}`} />
  );
}

// ── Animated bar ─────────────────────────────────────────────────
function AnimatedBar({ value, color, delay = 0 }) {
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay, duration: 1.2, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

export default function DashboardMockup() {
  const { data: session } = useSession();
  const [mounted, setMounted]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch real user data once mounted
  useEffect(() => {
    if (!mounted) return;
    getHeroStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [mounted]);

  if (!mounted) return null;

  // Merge: real data first, fallback for missing fields
  const d = {
    resumeScore:      stats?.resumeScore      || FALLBACK.resumeScore,
    interviewsDone:   stats?.interviewsDone   ?? FALLBACK.interviewsDone,
    coverLetterCount: stats?.coverLetterCount ?? FALLBACK.coverLetterCount,
    profileStrength:  stats?.profileStrength  || FALLBACK.profileStrength,
    avgInterviewScore:stats?.avgInterviewScore|| FALLBACK.avgInterviewScore,
    skills:           stats?.skills?.length   ? stats.skills            : FALLBACK.skills,
    recentActivity:   stats?.recentActivity?.length ? stats.recentActivity : FALLBACK.recentActivity,
    hasResume:        stats?.hasResume        ?? FALLBACK.hasResume,
  };

  const isLoggedIn = !!session?.user;
  const displayName = session?.user?.name?.split(" ")[0] ?? "Alex";
  const userInitials = session?.user?.name?.substring(0, 2)?.toUpperCase() ?? "AL";
  const userImage = session?.user?.image ?? null;

  // stat cards driven by real data
  const statCards = [
    { label: "Resume Score",    value: d.resumeScore,      suffix: "%", sub: "ATS Optimized",  icon: FileText,     color: "text-indigo-600",  bg: "bg-indigo-50",  href: "/resume"       },
    { label: "Interviews Done", value: d.interviewsDone,   suffix: "",  sub: "Mock sessions",   icon: MessageSquare,color: "text-emerald-600", bg: "bg-emerald-50", href: "/interviewprep" },
    { label: "Cover Letters",   value: d.coverLetterCount, suffix: "",  sub: "AI-generated",    icon: FileSignature,color: "text-amber-600",   bg: "bg-amber-50",   href: "/cover-letter" },
    { label: "Profile Strength",value: d.profileStrength,  suffix: "%", sub: "Elite tier",      icon: TrendingUp,   color: "text-violet-600",  bg: "bg-violet-50",  href: "/dashboard"    },
  ];

  // Interview bars: use real avg across 3 metrics if available
  const interviewBars = INTERVIEW_METRICS.map((m, i) => ({
    ...m,
    value: [d.avgInterviewScore, Math.min(100, d.avgInterviewScore + 4), Math.max(0, d.avgInterviewScore - 3)][i] || 75,
  }));

  return (
    <>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="relative w-full max-w-5xl mx-auto rounded-[1rem] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden text-slate-800">
        <div className="p-6 md:p-8 bg-white flex flex-col gap-6">

          {/* ── Top bar ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
                <span className="text-white font-black text-xs">CF</span>
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                CareerForge <span className="text-indigo-600 text-[10px] align-top">AI</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-indigo-700">
                  {isLoggedIn ? `Hi, ${displayName}!` : "Dashboard Live"}
                </span>
              </div>

              {/* User avatar (only if logged in) */}
              {isLoggedIn && (
                <Link href="/dashboard">
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-200 shadow-sm overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all shrink-0">
                    {userImage
                      ? <img src={userImage} alt="User" className="w-full h-full object-cover" />
                      : <span className="font-bold text-[10px]">{userInitials}</span>
                    }
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* ── Stats Row ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <Link href={stat.href} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(79,70,229,0.10)" }}
                  className="group p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2.5 cursor-pointer hover:border-indigo-200 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</span>
                    <div className={`p-1.5 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    </div>
                  </div>

                  <div className="text-3xl font-black text-slate-900 flex items-baseline gap-0.5 tabular-nums">
                    {loading ? (
                      <Shimmer className="w-12 h-8" />
                    ) : (
                      <>
                        <AnimatedNumber value={stat.value} />
                        <span className="text-lg font-bold text-slate-500">{stat.suffix}</span>
                      </>
                    )}
                  </div>

                </motion.div>
              </Link>
            ))}
          </div>

          {/* ── Middle Row ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Resume Progress Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="lg:col-span-2 p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Resume Progress</h3>
                {!loading && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    {d.resumeScore}% complete
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex-1 min-h-[160px] flex flex-col gap-3 justify-end pb-2">
                  {[60, 80, 50, 90, 70].map((w, i) => (
                    <Shimmer key={i} className={`h-2 w-[${w}%] rounded-full`} />
                  ))}
                  <Shimmer className="h-24 w-full rounded-xl mt-2" />
                </div>
              ) : (
                <div className="flex-1 min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA} margin={{ top: 5, right: 4, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cgScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#1e293b" }}
                        itemStyle={{ color: "#4f46e5", fontWeight: 700 }}
                        cursor={{ stroke: "#4f46e5", strokeWidth: 1, strokeDasharray: "4 4" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#cgScore)"
                        animationDuration={1800}
                        dot={{ fill: "#4f46e5", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Interview Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-4"
            >
              <h3 className="font-bold text-sm text-slate-900">Interview Performance</h3>

              {loading ? (
                <div className="flex flex-col gap-4 mt-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <Shimmer className="h-3 w-28" />
                      <Shimmer className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-1">
                  {interviewBars.map((m, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-600">{m.label}</span>
                        <span className="text-xs font-black text-slate-800">{m.value}%</span>
                      </div>
                      <AnimatedBar value={m.value} color={m.color} delay={0.7 + i * 0.15} />
                    </div>
                  ))}
                </div>
              )}

              {/* Sessions summary */}
              <div className="mt-auto pt-2 flex items-center gap-2 bg-indigo-50/70 rounded-xl px-3 py-2.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Total Sessions</p>
                  <p className="text-sm font-extrabold text-slate-800">
                    {loading ? "—" : `${d.interviewsDone} Completed`}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom Row ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* AI Skill Suggestions */}
            <Link href="/industry-insights">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                whileHover={{ scale: 1.015 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-violet-50/60 border border-indigo-100 flex flex-col gap-4 relative overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <BrainCircuit className="absolute -right-5 -bottom-5 w-28 h-28 text-indigo-100 opacity-60 group-hover:opacity-90 transition-opacity" />
                <h3 className="font-bold text-sm text-indigo-900 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  {stats?.skills?.length ? "Your Skills" : "AI Skill Suggestions"}
                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                </h3>

                <div className="flex flex-wrap gap-2 relative z-10">
                  {loading
                    ? [1, 2, 3, 4, 5].map(i => <Shimmer key={i} className="h-6 w-16 rounded-full" />)
                    : d.skills.map((badge, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.75 + i * 0.07 }}
                          className="px-3 py-1 bg-white text-indigo-700 text-[10px] font-bold rounded-full shadow-sm border border-indigo-100 group-hover:border-indigo-300 transition-colors"
                        >
                          {badge}
                        </motion.span>
                      ))
                  }
                </div>
                <p className="text-[10px] text-indigo-500 font-semibold relative z-10">
                  Based on your profile &amp; market trends
                </p>
              </motion.div>
            </Link>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3"
            >
              <h3 className="font-bold text-sm text-slate-900">Recent Activity</h3>

              <div className="flex flex-col gap-1.5 mt-1">
                {loading
                  ? [1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Shimmer className="w-4 h-4 rounded-full" />
                        <Shimmer className="flex-1 h-3 rounded" />
                        <Shimmer className="w-12 h-2 rounded" />
                      </div>
                    ))
                  : d.recentActivity.map((activity, i) => {
                      const { Icon, color } = ACTIVITY_ICONS[activity.type] ?? ACTIVITY_ICONS.resume;
                      return (
                        <Link href={activity.href} key={i}>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.85 + i * 0.1 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <Icon className={`w-4 h-4 ${color} shrink-0`} />
                            <span className="text-xs font-semibold text-slate-700 flex-1 group-hover:text-indigo-700 transition-colors line-clamp-1">
                              ✅ {activity.text}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                              {timeAgo(activity.time)}
                            </span>
                          </motion.div>
                        </Link>
                      );
                    })
                }
              </div>

              {/* Weekly goal footer */}
              {!loading && (
                <div className="mt-auto pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                    <span>Weekly Goal</span>
                    <span className="text-indigo-600">
                      {Math.min(d.recentActivity.length, 3)} / 3 done
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.round((d.recentActivity.length / 3) * 100), 100)}%` }}
                      transition={{ delay: 1.1, duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
