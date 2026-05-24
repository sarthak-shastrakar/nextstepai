"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, CheckCircle2, GraduationCap, Repeat2,
  Award, TrendingUp, MapPin, ShieldCheck, Brain,
} from "lucide-react";
import { AnimatedBar } from "./InsightPrimitives";

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 18 } },
};

function lpa(val) {
  const n = parseInt(val, 10);
  if (!n) return "—";
  return `₹${(n / 100000).toFixed(0)}L`;
}

// ── Salary by Experience ──────────────────────────────────────
function SalaryByExp({ data, userExp }) {
  const levels = [
    { key: "fresher", label: "Fresher", color: "#64748B" },
    { key: "junior", label: "Junior", color: "#4F46E5" },
    { key: "mid", label: "Mid-level", color: "#10B981" },
    { key: "senior", label: "Senior", color: "#F59E0B" },
  ];
  return (
    <div className="space-y-3">
      {levels.map(({ key, label, color }) => {
        const d = data?.[key] || {};
        const isUser = key === userExp;
        return (
          <div key={key} className={`p-3.5 rounded-xl border transition-all ${isUser ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-bold">{label}</span>
                {isUser && <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">You</span>}
              </div>
              <span className="text-xs font-black" style={{ color }}>
                {lpa(d.min)} – {lpa(d.max)}
              </span>
            </div>
            <AnimatedBar pct={key === "fresher" ? 20 : key === "junior" ? 45 : key === "mid" ? 70 : 100} color={color} />
          </div>
        );
      })}
    </div>
  );
}

// ── Top Companies ─────────────────────────────────────────────
function TopCompanies({ companies }) {
  return (
    <div className="space-y-2">
      {(companies || []).slice(0, 5).map((c, i) => (
        <motion.div key={i} whileHover={{ x: 4 }}
          className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
            {(c.name || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{c.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{c.role}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Certifications ────────────────────────────────────────────
function Certifications({ certs }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {(certs || []).slice(0, 3).map((c, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">{c.name}</p>
            <p className="text-[10px] text-slate-500">{c.provider}</p>
          </div>
          <span className="text-sm font-black text-amber-600 flex-shrink-0">
            +{c.boostPercent}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Skills Gap ────────────────────────────────────────────────
function SkillsGap({ topSkills, userSkills }) {
  const userSet = new Set((userSkills || []).map((s) => s.toLowerCase()));
  const missing = (topSkills || []).filter((s) => !userSet.has(s.toLowerCase()));
  const matched = (topSkills || []).filter((s) => userSet.has(s.toLowerCase()));
  if (!topSkills?.length) return <p className="text-sm text-slate-400 text-center py-8">No data available</p>;
  if (!missing.length) return (
    <div className="flex flex-col items-center py-8">
      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
      <p className="text-sm font-black text-emerald-600">Full Coverage!</p>
      <p className="text-xs text-slate-400">You match all top industry skills</p>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {matched.map((s) => (
        <span key={s} className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1">
          <CheckCircle2 className="h-3 w-3" />{s}
        </span>
      ))}
      {missing.map((s) => (
        <span key={s} className="text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100 rounded-full px-3 py-1">
          ✕ {s}
        </span>
      ))}
    </div>
  );
}

// ── Career Playbook ───────────────────────────────────────────
function CareerPlaybook({ entryTips, switchTips }) {
  const [tab, setTab] = useState("entry");
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[
          { id: "entry", label: "Fresh Graduate", icon: GraduationCap, color: "indigo" },
          { id: "switch", label: "Career Switch", icon: Repeat2, color: "emerald" },
        ].map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${tab === id ? `bg-${color}-600 text-white shadow` : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="space-y-3">
          {(tab === "entry" ? entryTips : switchTips || []).map((tip, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${tab === "entry" ? "bg-indigo-50/60 border-indigo-100" : "bg-emerald-50/60 border-emerald-100"}`}>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${tab === "entry" ? "bg-indigo-600" : "bg-emerald-600"}`}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{tip}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function InsightBottomHalf({ insights }) {
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Key Trends */}
      <motion.div variants={item}>
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-50 rounded-lg"><TrendingUp className="h-4 w-4 text-amber-500" /></div>
            <p className="font-black text-sm">Key Industry Trends</p>
            <span className="ml-auto text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">Live</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(insights.keyTrends || []).map((t, i) => (
              <motion.div key={i} whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-100 hover:border-amber-100 transition-all">
                <div className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: i % 3 === 0 ? "#4F46E5" : i % 3 === 1 ? "#10B981" : "#F59E0B" }} />
                <p className="text-xs font-semibold text-slate-700 leading-snug">{t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Salary by Exp + Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-50 rounded-lg"><Brain className="h-4 w-4 text-purple-500" /></div>
              <p className="font-black text-sm">Salary by Experience</p>
            </div>
            <SalaryByExp data={insights.salaryByExperience} userExp={insights.userExperience} />
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-50 rounded-lg"><Building2 className="h-4 w-4 text-indigo-500" /></div>
              <p className="font-black text-sm">Top Companies Hiring</p>
            </div>
            <TopCompanies companies={insights.topCompanies} />
          </div>
        </motion.div>
      </div>

      {/* Certifications + Skills Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-50 rounded-lg"><Award className="h-4 w-4 text-amber-500" /></div>
              <p className="font-black text-sm">Related Certifications</p>
              <span className="text-[9px] text-slate-400 ml-1">Boosts salary</span>
            </div>
            <Certifications certs={insights.certifications} />
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary/10 rounded-lg"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
              <p className="font-black text-sm">Your Skills Gap</p>
              <span className="text-[9px] text-slate-400 ml-1">vs industry top skills</span>
            </div>
            <SkillsGap topSkills={insights.topSkills} userSkills={insights.userSkills} />
          </div>
        </motion.div>
      </div>

      {/* Career Playbook */}
      <motion.div variants={item}>
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 rounded-lg"><Brain className="h-4 w-4 text-indigo-500" /></div>
            <p className="font-black text-sm">Your Career Playbook</p>
          </div>
          <CareerPlaybook entryTips={insights.entryLevelTips} switchTips={insights.switchTips} />
        </div>
      </motion.div>
    </motion.div>
  );
}
