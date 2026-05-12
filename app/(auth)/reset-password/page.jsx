"use client";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle, Loader2, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/actions/auth";

const schema = z.object({
  password: z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "1 uppercase required").regex(/[0-9]/, "1 number required").regex(/[^A-Za-z0-9]/, "1 special char required"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

function PasswordStrength({ password = "" }) {
  const checks = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const passed = checks.filter(r => r.test(password)).length;
  const levels = [{ color:"bg-red-500" },{ color:"bg-orange-500" },{ color:"bg-yellow-500" },{ color:"bg-emerald-500" }];
  const labels = ["Weak","Fair","Good","Strong"];
  if (!password) return null;
  const colorClass = ["text-red-400","text-orange-400","text-yellow-400","text-emerald-400"][passed-1] || "text-red-400";
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">{[0,1,2,3].map(i=><div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i<passed?(levels[passed-1]||levels[0]).color:"bg-white/10"}`}/>)}</div>
      <p className={`text-xs font-medium ${colorClass}`}>Password strength: {labels[passed-1] || "Weak"}</p>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const password = watch("password", "");

  const onSubmit = (data) => {
    if (!token) { setServerError("Reset token is missing. Please use the link from your email."); return; }
    setServerError("");
    startTransition(async () => {
      const res = await resetPassword(token, data);
      if (res.success) { setSuccess(true); setTimeout(() => router.push("/login"), 3500); }
      else { setServerError(res.message); }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x:[0,60,-30,0], y:[0,-50,70,0] }} transition={{ duration:20, repeat:Infinity, ease:"easeInOut" }} className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]"/>
        <motion.div animate={{ x:[0,-50,30,0], y:[0,60,-50,0] }} transition={{ duration:24, repeat:Infinity, ease:"easeInOut", delay:3 }} className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full bg-indigo-600/20 blur-[120px]"/>
      </div>

      <motion.div variants={container} initial="hidden" animate="visible" className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-2xl bg-white/[0.06] border border-white/[0.12] rounded-3xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div variants={item} className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 mb-4">
                    <ShieldCheck className="h-7 w-7 text-white"/>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Set new password</h1>
                  <p className="text-slate-400 text-sm mt-1.5">Choose a strong password for your account.</p>
                </motion.div>

                <AnimatePresence>
                  {serverError && (
                    <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0"/><p className="text-red-300 text-sm">{serverError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div variants={item}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"/>
                      <input {...register("password")} id="reset-password" type={showPw ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol" autoComplete="new-password" className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"/>
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </button>
                    </div>
                    <PasswordStrength password={password}/>
                    {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
                  </motion.div>

                  <motion.div variants={item}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"/>
                      <input {...register("confirmPassword")} id="reset-confirm-password" type={showConfirmPw ? "text" : "password"} placeholder="Repeat your new password" autoComplete="new-password" className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"/>
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showConfirmPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                  </motion.div>

                  <motion.button variants={item} type="submit" id="reset-submit-btn" disabled={isPending} whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {isPending ? <><Loader2 className="h-4 w-4 animate-spin"/> Updating…</> : "Reset Password"}
                  </motion.button>
                </form>

                <motion.div variants={item} className="text-center mt-6">
                  <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    <ArrowLeft className="h-4 w-4"/> Back to Login
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-4">
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400"/>
                </motion.div>
                <h2 className="text-2xl font-extrabold text-white mb-3">Password Updated! 🔐</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Your password has been reset successfully. Redirecting you to login…</p>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-4">
                  <Loader2 className="h-3 w-3 animate-spin"/> Redirecting in 3 seconds…
                </div>
                <Link href="/login" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">Go to Login →</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
