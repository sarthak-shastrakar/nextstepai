"use client";
import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { verifyEmail, resendVerificationEmail } from "@/actions/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, startResend] = useTransition();
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Verification token is missing from the URL."); return; }
    verifyEmail(token).then((res) => {
      if (res.success) {
        setStatus("success");
        setMessage(res.message);
        setTimeout(() => router.push("/login"), 4000);
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    });
  }, [token, router]);

  const handleResend = () => {
    if (!resendEmail) return;
    startResend(async () => {
      const res = await resendVerificationEmail(resendEmail);
      setResendMsg(res.message);
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x:[0,60,-30,0], y:[0,-40,60,0] }} transition={{ duration:18, repeat:Infinity, ease:"easeInOut" }} className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]"/>
        <motion.div animate={{ x:[0,-50,30,0], y:[0,50,-40,0] }} transition={{ duration:22, repeat:Infinity, ease:"easeInOut", delay:3 }} className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-violet-600/20 blur-[120px]"/>
      </div>

      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-2xl bg-white/[0.06] border border-white/[0.12] rounded-3xl p-10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] text-center">

          {/* Loading */}
          {status === "loading" && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6">
                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin"/>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Verifying your email…</h2>
              <p className="text-slate-400 text-sm">Please wait a moment.</p>
            </motion.div>
          )}

          {/* Success */}
          {status === "success" && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200, delay:0.1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-400"/>
              </motion.div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Email Verified! 🎉</h2>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="h-3 w-3 animate-spin"/>
                Redirecting to login in 4 seconds…
              </div>
              <Link href="/login" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">Go to Login now →</Link>
            </motion.div>
          )}

          {/* Error */}
          {status === "error" && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                <XCircle className="h-10 w-10 text-red-400"/>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Verification Failed</h2>
              <p className="text-slate-400 text-sm mb-8">{message}</p>
              
              <div className="text-left space-y-3">
                <p className="text-slate-400 text-sm font-medium">Resend verification email:</p>
                <input
                  type="email" value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button onClick={handleResend} disabled={resendPending || !resendEmail} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {resendPending ? <><Loader2 className="h-4 w-4 animate-spin"/> Sending…</> : <><Mail className="h-4 w-4"/> Resend Email</>}
                </button>
                {resendMsg && <p className="text-emerald-400 text-xs text-center">{resendMsg}</p>}
              </div>

              <Link href="/login" className="inline-block mt-6 text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back to Login</Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
