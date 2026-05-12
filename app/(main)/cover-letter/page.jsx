import React from "react";
import { getCoverLetters, getCoverLetterDailyUsage } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export const dynamic = "force-dynamic";

const CoverLetterPage = async () => {
  const [coverLetters, dailyUsage] = await Promise.all([
    getCoverLetters(),
    getCoverLetterDailyUsage(),
  ]);

  const isLocked = dailyUsage.remaining <= 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-title tracking-tight mb-1">
            My Cover Letters
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            AI-generated, professionally formatted, ready to download.
            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isLocked
                ? "bg-red-50 text-red-600 border-red-200"
                : dailyUsage.remaining === 1
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-indigo-50 text-indigo-600 border-indigo-200"
            }`}>
              {dailyUsage.used}/{dailyUsage.limit} used today
            </span>
          </p>
        </div>
        {isLocked ? (
          <Button
            disabled
            className="gap-2 bg-slate-400 text-white rounded-xl shadow-lg font-bold h-10 sm:h-11 px-4 sm:px-5 text-sm w-full sm:w-auto cursor-not-allowed opacity-60"
          >
            <Lock className="h-4 w-4" />
            Limit Reached
          </Button>
        ) : (
          <Link href="/cover-letter/new">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold h-10 sm:h-11 px-4 sm:px-5 text-sm w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create New ({dailyUsage.remaining} left)
            </Button>
          </Link>
        )}
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
};

export default CoverLetterPage;
