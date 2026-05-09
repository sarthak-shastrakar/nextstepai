import React from "react";
import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

const CoverLetterPage = async ({ params }) => {
  const coverLetters = await getCoverLetters();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-title tracking-tight">My Cover Letters</h1>
        <Link href="/cover-letter/new">
          <Button className="rounded-xl font-semibold shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
};

export default CoverLetterPage;
