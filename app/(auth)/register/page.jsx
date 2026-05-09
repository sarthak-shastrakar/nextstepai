"use client";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2,
  UserPlus, CheckCircle2, ChevronRight, ChevronLeft,
  Briefcase, Plus, X,
} from "lucide-react";
import { registerUser } from "@/actions/auth";
import { industries } from "@/data/industries";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Min 8 characters")
    .regex(/[A-Z]/, "At least 1 uppercase letter")
    .regex(/[0-9]/, "At least 1 number")
    .regex(/[^A-Za-z0-9]/, "At least 1 special character"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match", path: ["confirmPassword"],
});

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };
const slide = (dir) => ({
  hidden: { opacity: 0, x: dir * 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -dir * 50, transition: { duration: 0.25 } },
});

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function PasswordStrength({ password = "" }) {
  const checks = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const passed = checks.filter((r) => r.test(password)).length;
  const levels = [
    { label: "Weak", bar: "bg-red-500", text: "text-red-400" },
    { label: "Fair", bar: "bg-orange-500", text: "text-orange-400" },
    { label: "Good", bar: "bg-yellow-500", text: "text-yellow-400" },
    { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-400" },
  ];
  if (!password) return null;
  const level = levels[Math.min(passed - 1, 3)] || levels[0];
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} initial={{ scaleX: 0 }} animate={{ scaleX: i < passed ? 1 : 0.3 }}
            transition={{ duration: 0.3, delay: i * 0.05 }} style={{ transformOrigin: "left" }}
            className={`h-1 flex-1 rounded-full transition-all ${i < passed ? level.bar : "bg-white/10"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${level.text}`}>Password strength: {level.label}</p>
    </div>
  );
}

function SkillsInput({ skills, setSkills }) {
  const [input, setInput] = useState("");
  const add = () => {
    const s = input.trim();
    if (s && !skills.includes(s) && skills.length < 20) { setSkills([...skills, s]); setInput(""); }
  };
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        Skills <span className="text-slate-500 text-xs">({skills.length}/20)</span>
      </label>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="e.g. React, Python, Excel…"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
        <button type="button" onClick={add}
          className="px-3 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 transition-all">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {skills.length === 0 && <p className="text-slate-500 text-xs mb-2">Add at least one skill.</p>}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {skills.map((sk) => (
            <motion.span key={sk} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              {sk}
              <button type="button" onClick={() => setSkills(skills.filter((s) => s !== sk))} className="text-indigo-400 hover:text-red-400 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Step 2 career state
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSubIndustry, setSelectedSubIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState([]);
  const [careerError, setCareerError] = useState("");

  // Step 1 form data (saved when going to step 2)
  const [step1Data, setStep1Data] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(step1Schema) });
  const password = watch("password", "");

  const subIndustries = industries.find((i) => i.name === selectedIndustry)?.subIndustries || [];

  const onStep1 = handleSubmit((data) => {
    setStep1Data(data);
    setDir(1);
    setStep(2);
  });

  const onStep2Submit = () => {
    setCareerError("");
    if (!selectedIndustry) return setCareerError("Please select an industry.");
    if (!selectedSubIndustry) return setCareerError("Please select a sub-industry.");
    if (!experience) return setCareerError("Please select your experience level.");
    if (skills.length === 0) return setCareerError("Please add at least one skill.");

    startTransition(async () => {
      const res = await registerUser({
        ...step1Data,
        industry: selectedIndustry,
        subIndustry: selectedSubIndustry,
        experience,
        skills,
      });
      if (res.success) setSuccess(true);
      else setServerError(res.message || "Registration failed.");
    });
  };

  const BG = (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div animate={{ x: [0, 80, -40, 0], y: [0, -60, 80, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
      <motion.div animate={{ x: [0, -60, 40, 0], y: [0, 80, -60, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
        {BG}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center p-10 max-w-sm mx-4 backdrop-blur-2xl bg-white/[0.06] border border-white/[0.12] rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-5">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Check your email!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-7">
            We&apos;ve sent a verification link to your inbox. Click it to activate your account.
          </p>
          <Link href="/login"
            className="inline-block w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm text-center shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-opacity">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 py-10">
      {BG}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {["Account", "Career"].map((label, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-500"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx}
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-indigo-400" : done ? "text-emerald-400" : "text-slate-500"}`}>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div animate={{ width: step === 1 ? "50%" : "100%" }} transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
          </div>
        </div>

        <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.1] rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Account ── */}
            {step === 1 && (
              <motion.div key="step1" variants={slide(dir)} initial="hidden" animate="visible" exit="exit" className="p-8 space-y-5">
                <div className="text-center mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg mb-3">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
                  <p className="text-slate-400 text-sm mt-1">Step 1 of 2 — Basic info</p>
                </div>

                {/* Google */}
                <button onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/api/auth/post-login" }); }}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white font-semibold text-sm transition-all disabled:opacity-50">
                  {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  Sign up with Google
                </button>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="mx-4 text-slate-500 text-xs uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <AnimatePresence>
                  {serverError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{serverError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={onStep1} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...register("name")} id="register-name" type="text" placeholder="John Doe" autoComplete="name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...register("email")} id="register-email" type="email" placeholder="you@example.com" autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...register("password")} id="register-password" type={showPw ? "text" : "password"}
                        placeholder="Min 8 chars, uppercase, number, symbol" autoComplete="new-password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                    {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...register("confirmPassword")} id="register-confirm-password" type={showConfirmPw ? "text" : "password"}
                        placeholder="Repeat your password" autoComplete="new-password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                  </div>

                  <button type="submit" id="register-next-btn"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2">
                    Next: Career Info <ChevronRight className="h-4 w-4" />
                  </button>
                </form>

                <p className="text-center text-slate-500 text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Career Info ── */}
            {step === 2 && (
              <motion.div key="step2" variants={slide(dir)} initial="hidden" animate="visible" exit="exit" className="p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/30 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Career Info</h2>
                    <p className="text-xs text-slate-400">Step 2 of 2 — Personalizes your insights</p>
                  </div>
                </div>

                <AnimatePresence>
                  {careerError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{careerError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Industry</label>
                  <select value={selectedIndustry} onChange={(e) => { setSelectedIndustry(e.target.value); setSelectedSubIndustry(""); }}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all appearance-none">
                    <option value="" className="bg-slate-900">Select your industry…</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.name} className="bg-slate-900">{ind.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-Industry */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Sub-Industry</label>
                  <select value={selectedSubIndustry} onChange={(e) => setSelectedSubIndustry(e.target.value)}
                    disabled={!selectedIndustry}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all appearance-none disabled:opacity-40">
                    <option value="" className="bg-slate-900">{selectedIndustry ? "Select sub-industry…" : "Select industry first"}</option>
                    {subIndustries.map((s) => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "fresher", label: "Fresher", desc: "0–1 year" },
                      { value: "junior", label: "Junior", desc: "1–3 years" },
                      { value: "mid", label: "Mid-level", desc: "3–5 years" },
                      { value: "senior", label: "Senior", desc: "5+ years" },
                    ].map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setExperience(opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${experience === opt.value ? "bg-indigo-600/30 border-indigo-500/60 shadow-lg" : "bg-white/[0.05] border-white/[0.1] hover:border-white/20"}`}>
                        <p className={`text-sm font-semibold ${experience === opt.value ? "text-indigo-300" : "text-white"}`}>{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <SkillsInput skills={skills} setSkills={setSkills} />

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setDir(-1); setStep(1); }} disabled={isPending}
                    className="flex-1 py-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" id="register-submit-btn" onClick={onStep2Submit} disabled={isPending}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><CheckCircle2 className="h-4 w-4" /> Create Account</>}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
