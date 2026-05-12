"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Briefcase, Building2, FileText, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerateCoverLetter } from "@/actions/cover-letter";
import { useRouter } from "next/navigation";

const schema = z.object({
  companyName:    z.string().min(1, "Company name is required"),
  jobTitle:       z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(20, "Please provide at least 20 characters of job description"),
});

const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white placeholder:text-slate-400 resize-none";

export default function CoverLetterGenerator({ dailyUsage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localUsed, setLocalUsed] = useState(dailyUsage?.used || 0);

  const limit     = dailyUsage?.limit || 3;
  const remaining = Math.max(0, limit - localUsed);
  const isLocked  = remaining <= 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => {
    if (isLocked) {
      toast.error(`Daily limit reached (${limit}/day). Try again tomorrow!`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await GenerateCoverLetter(data);
        setLocalUsed((prev) => prev + 1);
        toast.success("Cover letter generated!");
        reset();
        router.push(`/cover-letter/${result.id}`);
      } catch (error) {
        toast.error(error.message || "Failed to generate cover letter");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">AI Cover Letter Generator</h2>
                <p className="text-indigo-200 text-sm">
                  Your profile skills, experience & bio will be auto-included
                </p>
              </div>
            </div>

            {/* Daily usage badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isLocked
                ? "bg-red-500/20 text-red-100 border-red-400/30"
                : remaining === 1
                  ? "bg-amber-500/20 text-amber-100 border-amber-400/30"
                  : "bg-white/15 text-white/90 border-white/20"
            }`}>
              {isLocked ? <Lock className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {localUsed}/{limit} used today
            </div>
          </div>
        </div>

        {/* Limit reached banner */}
        {isLocked && (
          <div className="mx-6 mt-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Daily limit reached</p>
              <p className="text-xs text-red-500 mt-0.5">
                You've used all {limit} cover letters for today. Limit resets at midnight.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-red-400 font-medium shrink-0">
              <Clock className="h-3.5 w-3.5" />
              Resets 12 AM
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={`p-8 space-y-5 ${isLocked ? "opacity-50 pointer-events-none select-none" : ""}`}>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  {...register("companyName")}
                  placeholder="e.g. Google, TCS, Infosys"
                  className={`${inputCls} pl-9`}
                  disabled={isLocked}
                />
              </div>
              {errors.companyName && (
                <p className="text-red-500 text-xs">{errors.companyName.message}</p>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Job Title / Position *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  {...register("jobTitle")}
                  placeholder="e.g. Full Stack Developer"
                  className={`${inputCls} pl-9`}
                  disabled={isLocked}
                />
              </div>
              {errors.jobTitle && (
                <p className="text-red-500 text-xs">{errors.jobTitle.message}</p>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Job Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <textarea
                {...register("jobDescription")}
                rows={6}
                placeholder="Paste the job description here. The more detail you provide, the better tailored your cover letter will be…"
                className={`${inputCls} pl-9`}
                disabled={isLocked}
              />
            </div>
            {errors.jobDescription && (
              <p className="text-red-500 text-xs">{errors.jobDescription.message}</p>
            )}
          </div>

          {/* Info box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-600 font-medium">
            ✨ Your name, email, phone, skills, and experience will be automatically pulled from your profile.
          </div>

          {/* Remaining uses indicator */}
          {!isLocked && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border ${
              remaining === 1
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}>
              <Sparkles className="h-3.5 w-3.5" />
              {remaining} of {limit} generations remaining today
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending || isLocked}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocked ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Daily Limit Reached
              </>
            ) : isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating your cover letter…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}