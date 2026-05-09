"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, LineChart, Target, Laptop, Zap,
  Star, Brain, ArrowRight, BarChart2,
} from "lucide-react";
import { AnimatedCount, ReadinessGauge, AnimatedBar } from "./InsightPrimitives";

// ─── Item animation variant ───────────────────────────────────
const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 18 } },
};

// ─── Helpers ─────────────────────────────────────────────────
function lpa(val) { return `₹${(val / 100000).toFixed(1)}L`; }

function getOutlookInfo(o) {
  switch ((o || "").toUpperCase()) {
    case "POSITIVE": return { icon: TrendingUp, color: "#10B981", label: "Positive" };
    case "NEGATIVE": return { icon: TrendingDown, color: "#EF4444", label: "Negative" };
    default: return { icon: LineChart, color: "#F59E0B", label: "Neutral" };
  }
}

function readinessColor(score) {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function readinessLabel(score) {
  if (score >= 70) return "Strong Match";
  if (score >= 40) return "Developing";
  return "Needs Work";
}

// ─── Sub-components ──────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <motion.div variants={item} whileHover={{ y: -4 }}>
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-full">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Icon className="h-3 w-3" style={{ color: accent }} />{label}
        </p>
        <div className="text-2xl font-black tracking-tight mb-1" style={{ color: accent }}>{value}</div>
        {sub && <p className="text-[10px] text-slate-400 font-semibold uppercase">{sub}</p>}
      </div>
    </motion.div>
  );
}

function SalaryChart({ data }) {
  const mapped = (data || []).map((r) => ({
    name: r.role?.split(" ").slice(0, 2).join(" ") || "",
    Entry: r.min / 100000,
    Median: r.median / 100000,
    Peak: r.max / 100000,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={mapped} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
        <defs>
          {[["entry", "#CBD5E1"], ["med", "#4F46E5"], ["peak", "#10B981"]].map(([id, c]) => (
            <linearGradient key={id} id={`area${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={c} stopOpacity={0.4} />
              <stop offset="95%" stopColor={c} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
        <XAxis dataKey="name" axisLine={false} tickLine={false}
          tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }}
          interval={0} angle={-18} textAnchor="end" />
        <YAxis axisLine={false} tickLine={false}
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          tickFormatter={(v) => `₹${v}L`} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
          <div className="bg-white shadow-xl border border-slate-100 rounded-xl p-3">
            <p className="font-black text-xs mb-2">{label}</p>
            {payload.map((p) => (
              <div key={p.name} className="flex justify-between gap-4">
                <span className="text-[10px] text-slate-500">{p.name}</span>
                <span className="text-xs font-bold" style={{ color: p.color }}>₹{p.value.toFixed(1)}L</span>
              </div>
            ))}
          </div>
        ) : null} />
        <Area type="monotone" dataKey="Entry" stroke="#CBD5E1" fill="url(#areaentry)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="Median" stroke="#4F46E5" fill="url(#areamed)" strokeWidth={2.5} dot={false} />
        <Area type="monotone" dataKey="Peak" stroke="#10B981" fill="url(#areapeak)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HiringPie({ data }) {
  const pieData = [
    { name: "Remote", value: data?.remote ?? 35, color: "#6366F1" },
    { name: "Hybrid", value: data?.hybrid ?? 45, color: "#10B981" },
    { name: "On-Site", value: data?.onsite ?? 20, color: "#F59E0B" },
  ];
  return (
    <div className="flex flex-col items-center h-full justify-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={76}
            paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={1400}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}>
            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3">
        {pieData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────
export default function InsightTopHalf({ insights }) {
  const { icon: OutlookIcon, color: outlookColor, label: outlookLabel } = getOutlookInfo(insights.marketOutlook);
  const score = insights.readinessScore ?? 0;
  const rColor = readinessColor(score);
  const userSkillsSet = new Set((insights.userSkills || []).map((s) => s.toLowerCase()));

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Market Outlook" value={outlookLabel}
          sub="Industry sentiment" icon={OutlookIcon} accent={outlookColor} />
        <StatCard label="YoY Growth"
          value={<><AnimatedCount value={insights.growthRate ?? 0} />%</>}
          sub="Annual rate" icon={TrendingUp} accent="#10B981" />
        <StatCard label="Talent Demand" value={insights.demandLevel ?? "—"}
          sub="Hiring velocity" icon={BarChart2} accent="#4F46E5" />
        <motion.div variants={item} whileHover={{ y: -4 }}>
          <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm h-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">
              <Target className="h-3 w-3 text-indigo-500" />Your Readiness
            </p>
            <ReadinessGauge score={score} color={rColor} />
            <p className="text-center text-xs font-black mt-2" style={{ color: rColor }}>
              {readinessLabel(score)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Salary + Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-black text-base">Salary Benchmark</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Market Distribution (INR)</p>
              </div>
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2 py-1">
                2025 DATA
              </span>
            </div>
            <div className="flex-1">
              <SalaryChart data={insights.salaryRanges} />
            </div>
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 h-[380px] flex flex-col">
            <p className="font-black text-base mb-1">Where Jobs Are</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Work Format Breakdown</p>
            <div className="flex-1">
              <HiringPie data={insights.hiringTrends} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Skill salary boost ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-50 rounded-lg"><Zap className="h-4 w-4 text-emerald-500" /></div>
              <div>
                <p className="font-black text-sm">Skill Salary Boost</p>
                <p className="text-[10px] text-slate-400">Learn these to increase market value</p>
              </div>
            </div>
            <div className="space-y-4">
              {(insights.skillSalaryBoost || []).map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-tight">{s.skill}</span>
                    <span className="text-xs font-black text-emerald-500">+{s.boostPercent}% salary</span>
                  </div>
                  <AnimatedBar pct={Math.min(s.boostPercent * 5, 100)} color="#10B981" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Roles hiring now ── */}
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary/10 rounded-lg"><Star className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="font-black text-sm">Roles Hiring Now</p>
                <p className="text-[10px] text-slate-400">Most in-demand job titles</p>
              </div>
            </div>
            <div className="space-y-2">
              {(insights.topJobTitles || []).map((title, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <span className="text-xs font-semibold flex-1">{title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
