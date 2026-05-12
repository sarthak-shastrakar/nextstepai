import React from "react";
import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export const dynamic = "force-dynamic";

const CoverLetterPage = async () => {
  const coverLetters = await getCoverLetters();

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
          </p>
        </div>
        <Link href="/cover-letter/new">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold h-10 sm:h-11 px-4 sm:px-5 text-sm w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
};

export default CoverLetterPage;
