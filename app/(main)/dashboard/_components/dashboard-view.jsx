"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCcw, Loader2, Brain, Clock, Sparkles, AlertTriangle, Lock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { getIndustryInsights } from "@/actions/industryInsight";
import InsightSkeleton from "./InsightSkeleton";
import InsightTopHalf from "./InsightTopHalf";
import InsightBottomHalf from "./InsightBottomHalf";

export default function DashboardView({ insights: initialInsights, error: initialError }) {
  const router = useRouter();
  const [insights, setInsights] = useState(initialInsights);
  const [syncing, setSyncing] = useState(false);

  // Any error that isn't a profile-missing error
  const isProfileError = initialError?.includes("complete your profile");
  const isInternalError = initialError && !isProfileError;

  // ── Internal/schema errors — show retry instead of raw message ────────────────
  if (isInternalError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center">
          <Brain className="h-10 w-10 text-amber-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Insights Loading…</h2>
          <p className="text-slate-500 text-sm max-w-sm">
            Setting up your personalised dashboard. Please wait a moment and try again.
          </p>
        </div>
        <button onClick={() => router.refresh()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all">
          <RefreshCcw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  // ── Still generating (null insights) ──────────────
  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative h-20 w-20"
        >
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-indigo-600 border-b-transparent border-l-transparent" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <h2 className="text-xl font-black tracking-tight text-slate-800">Generating your personalized insights...</h2>
        </motion.div>
      </div>
    );
  }

  // ── Sync handler ─────────────────────────────────────────────
  const handleSync = async () => {
    // Check lock
    if (insights?.manualRefreshLocked) {
      const unlockDate = insights.manualRefreshUnlockAt
        ? format(new Date(insights.manualRefreshUnlockAt), "MMM dd, yyyy")
        : "next month";
      toast.error(`Refresh locked until ${unlockDate}. You can only refresh once per month.`);
      return;
    }
    setSyncing(true);
    try {
      const fresh = await getIndustryInsights(true);
      if (fresh?.manualRefreshLocked) {
        toast.warning("Refresh already used this month — showing latest data.");
      } else {
        toast.success("Industry insights refreshed!");
      }
      setInsights(fresh);
    } catch (err) {
      toast.error("Sync failed — " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const lastGen = insights.lastGeneratedAt
    ? formatDistanceToNow(new Date(insights.lastGeneratedAt), { addSuffix: true })
    : "just now";

  const nextUpd = insights.nextUpdate
    ? format(new Date(insights.nextUpdate), "MMM dd, yyyy")
    : "—";

  return (
    <div className="space-y-10 pb-24">

      {/* ── Page Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">
              Live Intelligence
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Market Live
            </div>
            {insights.fromCache && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="h-3 w-3" /> Cached · updated {lastGen}
              </div>
            )}
            {insights.aiError && (
              <div className="flex items-center gap-1 text-[10px] text-amber-500">
                <AlertTriangle className="h-3 w-3" /> Showing last available data
              </div>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter gradient-title leading-tight">
            Industry Insights
            <span className="text-primary/40 ml-2 text-2xl">({insights.industry})</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Last generated{" "}
            <span className="font-bold text-slate-600">{lastGen}</span>
            {" · "}Next auto-refresh{" "}
            <span className="font-bold text-slate-600">{nextUpd}</span>
          </p>
        </div>

        {/* Sync card */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
          <div className="text-center min-w-[40px]">
            <p className="text-[9px] font-black uppercase text-primary leading-none">
              {nextUpd.split(" ")[0]}
            </p>
            <p className="text-xl font-black leading-none">{nextUpd.split(" ")[1]}</p>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Next Auto-Sync</p>
            <p className="text-xs font-bold">6-Month Auto-Refresh</p>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-gradient-to-r from-primary to-primary/40 rounded-full" />
            </div>
          </div>
          {/* Refresh button — locked or active */}
          {insights?.manualRefreshLocked ? (
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                <Lock className="h-3.5 w-3.5" />
                Locked
              </div>
              <p className="text-[9px] text-slate-400 font-medium text-center leading-tight">
                Unlocks{" "}
                {insights.manualRefreshUnlockAt
                  ? format(new Date(insights.manualRefreshUnlockAt), "MMM dd")
                  : "next month"}
              </p>
            </div>
          ) : (
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-all disabled:opacity-50 flex-shrink-0">
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
              {syncing ? "Syncing…" : "Refresh"}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Content ─────────────────────────────────────────── */}
      {syncing ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-bold text-slate-600">Generating fresh AI insights…</p>
          <p className="text-xs text-slate-400">This takes 10–20 seconds</p>
        </div>
      ) : (
        <div className="space-y-10">
          <InsightTopHalf insights={insights} />
          <InsightBottomHalf insights={insights} />
        </div>
      )}
    </div>
  );
}
