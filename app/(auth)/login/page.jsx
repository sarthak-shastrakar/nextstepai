"use client";
import { useState, useTransition, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, Phone, AlertCircle, Loader2,
  LogIn, ChevronRight,
} from "lucide-react";

// ── Schemas ────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const mobileSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
});

// ── Animation Variants ─────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const slideLeft = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35 } }, exit: { opacity: 0, x: -30, transition: { duration: 0.25 } } };

// ── Google SVG Icon ────────────────────────────────────────
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

// ── Error Alert ────────────────────────────────────────────
function ErrorAlert({ message }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 mb-4"
        >
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm leading-relaxed">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Tab Button ─────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [tab, setTab] = useState("email"); // "email" | "mobile"
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Email form ─────────────────────────────────────────────
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const mobileForm = useForm({ resolver: zodResolver(mobileSchema) });

  // ── Handle redirect after login ────────────────────────────
  const handlePostLogin = (profileCompleted) => {
    if (!profileCompleted) {
      router.push("/complete-profile");
    } else {
      router.push(callbackUrl);
    }
    router.refresh();
  };

  // ── Email + Password Submit ────────────────────────────────
  const onEmailSubmit = (data) => {
    setServerError("");
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        // res.code carries the real message from our AuthError class
        setServerError(res.code || "Invalid email or password. Please try again.");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        handlePostLogin(session?.user?.profileCompleted);
      }
    });
  };

  // ── Mobile Submit ──────────────────────────────────────────
  const onMobileSubmit = (data) => {
    setServerError("");
    startTransition(async () => {
      const res = await signIn("mobile", {
        phone: data.phone,
        redirect: false,
      });
      if (res?.error) {
        // res.code carries the real message from our AuthError class
        setServerError(res.code || "Could not sign in with this mobile number.");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        handlePostLogin(session?.user?.profileCompleted);
      }
    });
  };

  const isLoading = isPending || googleLoading;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 py-10">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 80, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -60, 40, 0], y: [0, 80, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -40, 60, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]"
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.1] rounded-3xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">

          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
              <LogIn className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your NextStep AI account</p>
          </motion.div>

          {/* Google Button */}
          <motion.button
            variants={fadeUp}
            onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/api/auth/post-login" }); }}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            id="google-login-btn"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 mb-5"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <motion.div variants={fadeUp} className="relative flex items-center mb-5">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 text-slate-500 text-xs uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10" />
          </motion.div>

          {/* Login Method Tabs */}
          <motion.div variants={fadeUp} className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] mb-5">
            <TabBtn active={tab === "email"} onClick={() => { setTab("email"); setServerError(""); }} icon={Mail} label="Email" />
            <TabBtn active={tab === "mobile"} onClick={() => { setTab("mobile"); setServerError(""); }} icon={Phone} label="Mobile" />
          </motion.div>

          {/* Error */}
          <ErrorAlert message={serverError} />

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === "email" ? (
              <motion.form
                key="email-form"
                variants={slideLeft}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      {...emailForm.register("email")}
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1.5">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">Password</label>
                    <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      {...emailForm.register("password")}
                      id="login-password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {emailForm.formState.errors.password && (
                    <p className="text-red-400 text-xs mt-1.5">{emailForm.formState.errors.password.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  id="login-email-btn"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <><span>Sign In</span><ChevronRight className="h-4 w-4" /></>}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="mobile-form"
                variants={slideLeft}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={mobileForm.handleSubmit(onMobileSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      {...mobileForm.register("phone")}
                      id="login-phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  {mobileForm.formState.errors.phone && (
                    <p className="text-red-400 text-xs mt-1.5">{mobileForm.formState.errors.phone.message}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    Your mobile number must be registered during profile setup.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  id="login-mobile-btn"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : <><span>Continue with Mobile</span><ChevronRight className="h-4 w-4" /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Sign up link */}
          <motion.p variants={fadeUp} className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create one
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <Login />
    </Suspense>
  );
}
