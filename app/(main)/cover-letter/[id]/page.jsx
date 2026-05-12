import Link from "next/link";
import { ArrowLeft, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import EditCoverLetterClient from "../_components/edit-cover-letter";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;

  const coverLetter = await getCoverLetter(id);
  if (!coverLetter) return notFound();

  // Auto-fill sender info from DB
  try {
    const session = await auth();
    if (session?.user?.id) {
      await dbConnect();
      const u = await User.findById(session.user.id).lean();
      if (u && coverLetter.structured) {
        if (!coverLetter.structured.senderName)  coverLetter.structured.senderName  = u.name  || "";
        if (!coverLetter.structured.senderEmail) coverLetter.structured.senderEmail = u.email || "";
        if (!coverLetter.structured.senderPhone) coverLetter.structured.senderPhone = u.phone || "";
      }
    }
  } catch (_) {}

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back */}
      <Link href="/cover-letter">
        <Button variant="link" className="gap-2 pl-0 mb-4 -ml-1 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Cover Letters
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold gradient-title mb-1 leading-tight truncate">
            {coverLetter?.jobTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {coverLetter?.companyName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {format(new Date(coverLetter?.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 self-start sm:self-auto whitespace-nowrap shrink-0">
          ✓ Generated
        </span>
      </div>

      <EditCoverLetterClient coverLetter={coverLetter} />
    </div>
  );
}
