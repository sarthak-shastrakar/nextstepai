"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FileSignature,
  LineChart,
  Settings,
  TrendingUp,
  BrainCircuit,
  Target,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { name: "Week 1", score: 45 },
  { name: "Week 2", score: 55 },
  { name: "Week 3", score: 68 },
  { name: "Week 4", score: 75 },
  { name: "Week 5", score: 85 },
];

// Animated Number Component
const AnimatedNumber = ({ value }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;

    let timer;
    if (current < value) {
      timer = setTimeout(() => {
        setCurrent((prev) => Math.min(prev + increment, value));
      }, stepTime);
    }
    return () => clearTimeout(timer);
  }, [current, value]);

  return <>{Math.floor(current)}</>;
};

export default function DashboardMockup() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-[1rem] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row text-slate-800">
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-white font-black text-xs">CF</span>
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">
            CareerForge <span className="text-indigo-600 text-[10px] align-top">AI</span>
          </span>
        </div>

        {/* Nav Items */}
        <div className="space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: FileText, label: "Resume Builder" },
            { icon: MessageSquare, label: "Interview Prep" },
            { icon: FileSignature, label: "Cover Letter" },
            { icon: LineChart, label: "Industry Insights" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                item.active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.active ? "text-indigo-200" : ""}`} />
              {item.label}
            </motion.div>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 md:p-8 bg-white overflow-hidden flex flex-col gap-6">
        <header className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Welcome back, {session?.user?.name ? session.user.name.split(" ")[0] : "Alex"}! 👋</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Here is your career progress today.</p>
          </div>
          <div className="hidden sm:flex h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            {session?.user?.image ? (
               <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
               <span className="font-bold text-xs">{session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AL"}</span>
            )}
          </div>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Resume Score", value: 85, suffix: "%", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Interviews Done", value: 12, suffix: "", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Cover Letters", value: 3, suffix: "", icon: FileSignature, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Profile Strength", value: 90, suffix: "%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                <AnimatedNumber value={stat.value} />
                <span className="text-lg">{stat.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-64">
          {/* Left Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2 p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">Resume Progress</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+15% this week</span>
            </div>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Performance Bars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4"
          >
            <h3 className="font-bold text-sm text-slate-900">Interview Performance</h3>
            <div className="flex flex-col gap-4 mt-2">
              {[
                { label: "Technical", score: 78, color: "bg-indigo-600" },
                { label: "Communication", score: 85, color: "bg-emerald-500" },
                { label: "Problem Solving", score: 72, color: "bg-blue-500" },
              ].map((skill, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">{skill.label}</span>
                    <span className="text-slate-900">{skill.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ delay: 1 + i * 0.2, duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${skill.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Skill Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-4 relative overflow-hidden"
          >
            <BrainCircuit className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-100 opacity-50" />
            <h3 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Skill Suggestions
            </h3>
            <div className="flex flex-wrap gap-2 relative z-10">
              {["React", "Node.js", "Python", "AWS", "System Design"].map((badge, i) => (
                <span key={i} className="px-3 py-1 bg-white text-indigo-700 text-[10px] font-bold rounded-full shadow-sm border border-indigo-100">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3"
          >
            <h3 className="font-bold text-sm text-slate-900">Recent Activity</h3>
            <div className="flex flex-col gap-3 mt-1">
              {[
                { icon: CheckCircle2, text: "Resume updated for Frontend Role", time: "2 hrs ago", color: "text-emerald-500" },
                { icon: Clock, text: "Completed System Design Interview", time: "1 day ago", color: "text-amber-500" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  <span className="text-xs font-semibold text-slate-700 flex-1">{activity.text}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
