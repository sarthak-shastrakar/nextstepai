"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Eye, Edit2, Trash2, FileDown, Building2, Calendar, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/actions/cover-letter";
import { toast } from "sonner";

/**
 * Recursively extract the introduction paragraph.
 * Handles: plain text, JSON object, nested JSON string inside introduction.
 */
function extractIntro(val) {
  if (!val || typeof val !== "string") return null;
  const t = val.trim();
  if (t.startsWith("{")) {
    try {
      const p = JSON.parse(t);
      return (
        extractIntro(p.introduction)     ||
        extractIntro(p.body_paragraph_1) ||
        extractIntro(p.content)          ||
        null
      );
    } catch (_) { return null; }
  }
  return t.length > 0 ? t : null;
}

function getIntroPreview(letter) {
  // 1. Try structured.introduction
  const fromStructured = extractIntro(letter?.structured?.introduction);
  if (fromStructured) {
    return fromStructured.length > 130 ? fromStructured.slice(0, 130) + "…" : fromStructured;
  }

  // 2. Try content field
  const fromContent = extractIntro(letter?.content);
  if (fromContent) {
    return fromContent.length > 130 ? fromContent.slice(0, 130) + "…" : fromContent;
  }

  return "Cover letter generated — click to view and edit.";
}

function LetterCard({ letter, onDelete, deleting }) {
  const router = useRouter();
  const intro  = getIntroPreview(letter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="
        group bg-white border border-slate-200/70
        rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200
        transition-all duration-200 overflow-hidden w-full
      "
    >
      {/* Top gradient stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div className="p-4 sm:p-6">
        {/* ── Title row ── */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {letter.jobTitle}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                ✓ Generated
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                {letter.companyName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {format(new Date(letter.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Intro preview ── */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 italic border-l-2 border-indigo-200 pl-3">
          {intro}
        </p>

        {/* ── Action buttons — wrap on mobile ── */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm"
            onClick={() => router.push(`/cover-letter/${letter.id}`)}
            className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm h-8">
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">View &amp;</span> Edit
          </Button>

          <Button size="sm" variant="outline"
            onClick={() => router.push(`/cover-letter/${letter.id}`)}
            className="gap-1.5 text-xs rounded-xl border-slate-200 h-8">
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          {/* Delete — pushed to right */}
          <div className="ml-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline"
                  disabled={deleting === letter.id}
                  className="gap-1.5 text-xs rounded-xl border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 h-8">
                  {deleting === letter.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Permanently delete{" "}
                    <strong>{letter.jobTitle}</strong> at{" "}
                    <strong>{letter.companyName}</strong>? This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(letter.id)}
                    className="bg-red-600 hover:bg-red-700 text-white">
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CoverLetterList({ coverLetters }) {
  const router  = useRouter();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted!");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally { setDeleting(null); }
  };

  if (!coverLetters?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
          <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-2">No Cover Letters Yet</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Generate your first AI-powered cover letter tailored to any job description.
        </p>
        <Button
          onClick={() => router.push("/cover-letter/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 gap-2">
          ✨ Create First Cover Letter
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
        {coverLetters.length} Cover Letter{coverLetters.length !== 1 ? "s" : ""}
      </p>
      <AnimatePresence>
        {coverLetters.map((letter) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            onDelete={handleDelete}
            deleting={deleting}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}