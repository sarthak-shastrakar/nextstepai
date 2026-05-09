"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Loader2,
  CheckCircle2, ArrowLeft, ShieldCheck, KeyRound,
} from "lucide-react";
import { verifyIdentity, resetPasswordDirect } from "@/actions/auth";

// ── Schemas ────────────────────────────────────────────────
const identitySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "At least 1 uppercase letter")
      .regex(/[0-9]/, "At least 1 number")
      .regex(/[^A-Za-z0-9]/, "At least 1 special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Animations ──────────────────────────────────────────────
const card = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -40, scale: 0.97, transition: { duration: 0.3 } },
};

// ── Password Strength ──────────────────────────────────────
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
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? level.bar : "bg-white/10"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${level.text}`}>Password strength: {level.label}</p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = verify identity, 2 = reset password
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isPending, startTransition] = useTransition();

  const identityForm = useForm({ resolver: zodResolver(identitySchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });
  const watchPassword = passwordForm.watch("password", "");

  // ── Step 1: Verify Identity ────────────────────────────────
  const onVerifyIdentity = (data) => {
    setServerError("");
    startTransition(async () => {
      const res = await verifyIdentity(data.email, data.phone);
      if (res.success) {
        setVerifiedEmail(data.email);
        setVerifiedPhone(data.phone);
        setStep(2);
      } else {
        setServerError(res.message);
      }
    });
  };

  // ── Step 2: Reset Password ─────────────────────────────────
  const onResetPassword = (data) => {
    setServerError("");
    startTransition(async () => {
      const res = await resetPasswordDirect(
        verifiedEmail,
        verifiedPhone,
        data.password,
        data.confirmPassword
      );
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setServerError(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 py-10">
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x: [0, 60, -30, 0], y: [0, -50, 70, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 60, -50, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= s ? "#6366f1" : "rgba(255,255,255,0.1)",
                  scale: step === s ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </motion.div>
              {s < 2 && (
                <motion.div
                  animate={{ backgroundColor: step > s ? "#6366f1" : "rgba(255,255,255,0.1)" }}
                  transition={{ duration: 0.4 }}
                  className="w-12 h-0.5 rounded-full"
                />
              )}
            </div>
          ))}
        </div>

        <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.1] rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                variants={card}
                initial="hidden"
                animate="visible"
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-5"
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-extrabold text-white mb-3">Password Reset!</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                  Your password has been reset successfully. Redirecting you to login…
                </p>
                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin mx-auto mt-4" />
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                variants={card}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-8"
              >
                {/* Header */}
                <div className="text-center mb-7">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
                    <ShieldCheck className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Verify your identity</h1>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    Enter your registered email <span className="text-indigo-400">&amp;</span> mobile number to proceed.
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 mb-5"
                    >
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{serverError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={identityForm.handleSubmit(onVerifyIdentity)} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        {...identityForm.register("email")}
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    {identityForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1.5">{identityForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        {...identityForm.register("phone")}
                        id="forgot-phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    {identityForm.formState.errors.phone && (
                      <p className="text-red-400 text-xs mt-1.5">{identityForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    id="verify-identity-btn"
                    disabled={isPending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : "Verify Identity"}
                  </motion.button>
                </form>

                <div className="text-center mt-6">
                  <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                variants={card}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-8"
              >
                {/* Header */}
                <div className="text-center mb-7">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-4">
                    <KeyRound className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Set new password</h1>
                  <p className="text-slate-400 text-sm mt-1.5">
                    Identity verified for{" "}
                    <span className="text-indigo-400 font-medium">{verifiedEmail}</span>
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 mb-5"
                    >
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-sm">{serverError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        {...passwordForm.register("password")}
                        id="reset-new-password"
                        type={showPw ? "text" : "password"}
                        placeholder="Min 8 chars, uppercase, number, symbol"
                        autoComplete="new-password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={watchPassword} />
                    {passwordForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1.5">{passwordForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        {...passwordForm.register("confirmPassword")}
                        id="reset-confirm-password"
                        type={showConfirmPw ? "text" : "password"}
                        placeholder="Repeat your new password"
                        autoComplete="new-password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1.5">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    id="reset-password-btn"
                    disabled={isPending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</> : "Reset Password"}
                  </motion.button>
                </form>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setServerError(""); }}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to verification
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
