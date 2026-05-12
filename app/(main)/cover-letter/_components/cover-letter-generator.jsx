"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Briefcase, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerateCoverLetter } from "@/actions/cover-letter";
import { useRouter } from "next/navigation";

const schema = z.object({
  companyName:    z.string().min(1, "Company name is required"),
  jobTitle:       z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(20, "Please provide at least 20 characters of job description"),
});

const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white placeholder:text-slate-400 resize-none";

export default function CoverLetterGenerator() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => {
    startTransition(async () => {
      try {
        const result = await GenerateCoverLetter(data);
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">

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

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
          >
            {isPending ? (
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