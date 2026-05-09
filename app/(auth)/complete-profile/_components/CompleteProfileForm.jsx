"use client";
import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, AtSign, Phone, Briefcase, Code, ChevronRight, ChevronLeft,
  Loader2, CheckCircle2, AlertCircle, X, Plus, Camera, FileText, Lock, Eye, EyeOff
} from "lucide-react";
import { completeProfile, checkUsernameAvailability, setProfilePassword } from "@/actions/auth";
import { useSession } from "next-auth/react";

// ── Zod schemas per step ───────────────────────────────────
const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
});

const step2Schema = z.object({
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().min(1, "Please select a sub-industry"),
  experience: z.enum(["fresher", "junior", "mid", "senior"], {
    errorMap: () => ({ message: "Please select your experience level" }),
  }),
});

const step4Schema = z.object({
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.password) {
    if (data.password.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Min 8 characters", path: ["password"] });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "1 uppercase required", path: ["password"] });
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "1 number required", path: ["password"] });
    }
    if (!/[^A-Za-z0-9]/.test(data.password)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "1 special character required", path: ["password"] });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirmPassword"] });
    }
  }
});

// ── Animations ─────────────────────────────────────────────
const slide = (dir) => ({
  hidden: { opacity: 0, x: dir * 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -dir * 60, transition: { duration: 0.25 } },
});

// ── Step Indicator ─────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 w-full max-w-sm mx-auto">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  background: done ? "#10b981" : active ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "rgba(255,255,255,0.08)",
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : idx}
              </motion.div>
              <span className={`text-[10px] mt-1 font-medium absolute translate-y-9 w-20 text-center ${active ? "text-indigo-400" : done ? "text-emerald-400" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <motion.div
                animate={{ backgroundColor: done ? "#10b981" : "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.4 }}
                className="w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 rounded-full"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Skills Input ───────────────────────────────────────────
function SkillsInput({ skills, setSkills, disabled = false }) {
  const [input, setInput] = useState("");
  const addSkill = () => {
    const s = input.trim();
    if (s && !skills.includes(s) && skills.length < 20 && !disabled) {
      setSkills([...skills, s]);
      setInput("");
    }
  };
  const remove = (sk) => { if (!disabled) setSkills(skills.filter((s) => s !== sk)); };
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        Skills <span className="text-slate-500 text-xs">({skills.length}/20)</span>
      </label>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // prevent form submit
              e.stopPropagation();
              addSkill();
            }
          }}
          disabled={disabled}
          placeholder="Type a skill and press Enter or +"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={disabled}
          className="px-3 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {skills.length === 0 && (
        <p className="text-slate-500 text-xs">Add at least one skill to continue.</p>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        <AnimatePresence>
          {skills.map((sk) => (
            <motion.span
              key={sk}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
            >
              {sk}
              <button
                type="button"
                onClick={() => remove(sk)}
                disabled={disabled}
                className="text-indigo-400 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-indigo-400"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Username Field with Live Check ─────────────────────────
function UsernameField({ register, errors, watch }) {
  const username = watch("username");
  const [status, setStatus] = useState(null); // { available, message }
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!username || username.length < 3) { setStatus(null); return; }
    if (!/^[a-z0-9_]+$/.test(username)) { setStatus(null); return; }
    setChecking(true);
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailability(username);
      setStatus(res);
      setChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [username]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">Username <span className="text-slate-500 text-xs">(unique @handle)</span></label>
      <div className="relative">
        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          {...register("username")}
          id="profile-username"
          type="text"
          placeholder="your_handle"
          autoComplete="off"
          className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.07] border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all ${
            status?.available === false ? "border-red-500/50" : status?.available ? "border-emerald-500/50" : "border-white/[0.12]"
          }`}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {checking ? <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
            : status?.available ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            : status?.available === false ? <X className="h-4 w-4 text-red-400" />
            : null}
        </span>
      </div>
      {errors.username && <p className="text-red-400 text-xs mt-1.5">{errors.username.message}</p>}
      {!errors.username && status && (
        <p className={`text-xs mt-1.5 ${status.available ? "text-emerald-400" : "text-red-400"}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function CompleteProfileForm({ prefill, industries }) {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [skills, setSkills] = useState(prefill.skills || []);
  const [bio, setBio] = useState(prefill.bio || "");
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 form
  const s1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: prefill.name, username: prefill.username, phone: prefill.phone },
  });

  // Step 2 form
  const s2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { industry: prefill.industry, subIndustry: prefill.subIndustry, experience: prefill.experience },
  });

  // Step 4 form
  const s4 = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const selectedIndustry = s2.watch("industry");
  const subIndustries = industries.find((i) => i.name === selectedIndustry)?.subIndustries || [];

  const goNext = () => { setDir(1); setStep((p) => p + 1); };
  const goBack = () => { setDir(-1); setStep((p) => p - 1); };

  const onStep1 = s1.handleSubmit(() => goNext());
  const onStep2 = s2.handleSubmit(() => {
    if (skills.length === 0) return;
    goNext();
  });
  const onStep3 = () => goNext();

  const onSubmit = async (skipped = false) => {
    setServerError("");
    const s1v = s1.getValues();
    const s2v = s2.getValues();
    const s4v = s4.getValues();
    
    startTransition(async () => {
      const res = await completeProfile({
        name: s1v.name,
        username: s1v.username,
        phone: s1v.phone,
        industry: s2v.industry,
        subIndustry: s2v.subIndustry,
        experience: s2v.experience,
        skills,
        bio,
        profilePicture: prefill.profilePicture,
      });
      
      if (!res.success) {
        setServerError(res.message);
        return;
      }
      
      const passRes = await setProfilePassword(s4v.password, s4v.confirmPassword, skipped);
      if (!passRes.success) {
        setServerError(passRes.message);
        return;
      }

      await update({ profileCompleted: true });
      window.location.href = "/";
    });
  };

  const STEPS = ["Personal", "Career", "About", "Security"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 py-12 px-4">
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x: [0, 60, -30, 0], y: [0, -50, 70, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 60, -50, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm mt-2">Help us personalize your AI career experience</p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          />
        </div>

        <StepIndicator current={step} steps={STEPS} />

        <div className="mt-8"></div>

        {/* Card */}
        <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.1] rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {/* ── STEP 1: Personal Info ─── */}
            {step === 1 && (
              <motion.div key="step1" variants={slide(dir)} initial="hidden" animate="visible" exit="exit" className="p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Personal Info</h2>
                    <p className="text-xs text-slate-400">Tell us who you are</p>
                  </div>
                </div>

                <form onSubmit={onStep1} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...s1.register("name")} id="profile-name" type="text" placeholder="Your full name" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
                    </div>
                    {s1.formState.errors.name && <p className="text-red-400 text-xs mt-1.5">{s1.formState.errors.name.message}</p>}
                  </div>

                  {/* Username with live check */}
                  <UsernameField register={s1.register} errors={s1.formState.errors} watch={s1.watch} />

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...s1.register("phone")} id="profile-phone" type="tel" maxLength={10} placeholder="10-digit number" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all" />
                    </div>
                    {s1.formState.errors.phone && <p className="text-red-400 text-xs mt-1.5">{s1.formState.errors.phone.message}</p>}
                  </div>

                  <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
                    Next: Career Info <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: Career Info ─── */}
            {step === 2 && (
              <motion.div key="step2" variants={slide(dir)} initial="hidden" animate="visible" exit="exit" className="p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/30 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Career Info</h2>
                    <p className="text-xs text-slate-400">Tell us about your professional journey</p>
                  </div>
                </div>

                <form onSubmit={onStep2} className="space-y-4">
                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Industry</label>
                    <select {...s2.register("industry")} id="profile-industry"
                      onChange={(e) => { s2.setValue("industry", e.target.value); s2.setValue("subIndustry", ""); }}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all appearance-none">
                      <option value="" className="bg-slate-900">Select your industry…</option>
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.name} className="bg-slate-900">{ind.name}</option>
                      ))}
                    </select>
                    {s2.formState.errors.industry && <p className="text-red-400 text-xs mt-1.5">{s2.formState.errors.industry.message}</p>}
                  </div>

                  {/* Sub-Industry */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Sub-Industry</label>
                    <select {...s2.register("subIndustry")} id="profile-subindustry" disabled={!selectedIndustry}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all appearance-none disabled:opacity-40">
                      <option value="" className="bg-slate-900">{selectedIndustry ? "Select sub-industry…" : "Select industry first"}</option>
                      {subIndustries.map((s) => (
                        <option key={s} value={s} className="bg-slate-900">{s}</option>
                      ))}
                    </select>
                    {s2.formState.errors.subIndustry && <p className="text-red-400 text-xs mt-1.5">{s2.formState.errors.subIndustry.message}</p>}
                  </div>

                  {/* Skills */}
                  <SkillsInput skills={skills} setSkills={setSkills} disabled={isPending} />
                  {skills.length === 0 && <p className="text-red-400 text-xs -mt-2">Please add at least one skill.</p>}

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "fresher", label: "Fresher", desc: "0–1 year" },
                        { value: "junior", label: "Junior", desc: "1–3 years" },
                        { value: "mid", label: "Mid-level", desc: "3–5 years" },
                        { value: "senior", label: "Senior", desc: "5+ years" },
                      ].map((opt) => {
                        const selected = s2.watch("experience") === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            id={`exp-${opt.value}`}
                            onClick={() => s2.setValue("experience", opt.value, { shouldValidate: true })}
                            className={`p-3 rounded-xl border text-left transition-all ${selected ? "bg-indigo-600/30 border-indigo-500/60 shadow-lg shadow-indigo-500/10" : "bg-white/[0.05] border-white/[0.1] hover:border-white/20"}`}
                          >
                            <p className={`text-sm font-semibold ${selected ? "text-indigo-300" : "text-white"}`}>{opt.label}</p>
                            <p className="text-xs text-slate-400">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                    {s2.formState.errors.experience && <p className="text-red-400 text-xs mt-1.5">{s2.formState.errors.experience.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={goBack} className="flex-1 py-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
                      Next: About <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: About ─── */}
            {step === 3 && (
              <motion.div key="step3" variants={slide(dir)} initial="hidden" animate="visible" exit="exit" className="p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">About You</h2>
                    <p className="text-xs text-slate-400">Optional — but helps the AI coach you better</p>
                  </div>
                </div>

                {/* Bio — disabled when saving */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Bio <span className="text-slate-500">(optional)</span>
                    </label>
                    <span className={`text-xs ${bio.length > 180 ? "text-orange-400" : "text-slate-500"}`}>
                      {bio.length}/200
                    </span>
                  </div>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => { if (e.target.value.length <= 200) setBio(e.target.value); }}
                    disabled={isPending}
                    rows={4}
                    placeholder="Tell us a bit about yourself, your goals, what you're passionate about…"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isPending}
                    className="flex-1 py-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={onStep3}
                    disabled={isPending}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    Next: Security <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Security ─── */}
            {step === 4 && (
              <motion.div key="step4" variants={slide(dir)} initial="hidden" animate="visible" exit="exit" className="p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Secure Your Account 🔐</h2>
                    <p className="text-xs text-slate-400 leading-snug mt-1">Set a CareerForge AI password.<br/>This is different from your Google password and lets you login with email + password too.</p>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {serverError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{serverError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={s4.handleSubmit(() => onSubmit(false))} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Platform Password <span className="text-slate-500 text-xs">(optional)</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input {...s4.register("password")} type={showPassword ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special" className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {s4.formState.errors.password && <p className="text-red-400 text-xs mt-1.5">{s4.formState.errors.password.message}</p>}
                    
                    {/* Password Strength Indicator */}
                    {s4.watch("password")?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {[
                          { test: (p) => p?.length >= 8 },
                          { test: (p) => /[A-Z]/.test(p) },
                          { test: (p) => /[0-9]/.test(p) },
                          { test: (p) => /[^A-Za-z0-9]/.test(p) }
                        ].map((req, i) => {
                          const pass = req.test(s4.watch("password"));
                          return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pass ? "bg-emerald-500" : "bg-white/10"}`} />
                        })}
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {s4.watch("password")?.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 mt-2">Confirm Password <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                          <input {...s4.register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="Must match password" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all" />
                        </div>
                        {s4.formState.errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{s4.formState.errors.confirmPassword.message}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={isPending}
                      whileHover={{ scale: isPending ? 1 : 1.01 }}
                      whileTap={{ scale: isPending ? 1 : 0.98 }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Set Password & Continue</>}
                    </motion.button>
                    
                    <button
                      type="button"
                      onClick={() => onSubmit(true)}
                      disabled={isPending || (s4.watch("password")?.length > 0)}
                      className="w-full py-3 rounded-xl border border-white/[0.1] hover:bg-white/[0.05] text-slate-400 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Skip for now — I'll use Google login only
                    </button>
                    
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={isPending}
                      className="w-full py-2 text-slate-500 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1 mt-2"
                    >
                      <ChevronLeft className="h-3 w-3" /> Back
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
