"use client";

import React from "react";

/**
 * Recursively extract text from a value that might be JSON.
 * Prevents raw JSON from ever reaching the UI.
 */
function extractText(val, fallback = null) {
  if (!val || typeof val !== "string") return fallback;
  const trimmed = val.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      // Try common field names
      const candidate =
        parsed.introduction     ||
        parsed.body_paragraph_1 ||
        parsed.content          ||
        null;
      return extractText(candidate, fallback);
    } catch (_) {
      return fallback; // Never show broken JSON
    }
  }
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Resolve the structured letter object from various data shapes.
 * Handles: proper object, JSON-string content, deeply nested JSON.
 */
function resolveFields(coverLetter) {
  // 1. Structured object directly (best case)
  if (coverLetter?.structured && typeof coverLetter.structured === "object") {
    const s = coverLetter.structured;
    // Check if introduction is actually a proper paragraph (not JSON)
    const intro = extractText(s.introduction);
    if (intro && !intro.startsWith("{")) {
      return s; // Valid structured object
    }
    // introduction was JSON string — try parsing it
    if (s.introduction?.trim().startsWith("{")) {
      try {
        const inner = JSON.parse(s.introduction);
        if (inner?.introduction) return inner;
      } catch (_) {}
    }
  }

  // 2. Try parsing content field
  if (coverLetter?.content) {
    const c = coverLetter.content.trim();
    if (c.startsWith("{")) {
      try {
        const parsed = JSON.parse(c);
        if (parsed?.introduction) return parsed;
      } catch (_) {}
    } else if (c.length > 0) {
      // Plain-text content — create a minimal structured object
      return {
        introduction: c,
        company:   coverLetter?.companyName || "",
        position:  coverLetter?.jobTitle    || "",
        recipient: "Hiring Manager",
        salutation: "Dear Hiring Manager",
        closing: "Sincerely",
      };
    }
  }

  return null;
}

export default function CoverLetterPreview({ coverLetter }) {
  const s = resolveFields(coverLetter);

  if (!s) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-8 w-full mx-auto">
        <p className="text-slate-400 text-sm text-center italic">
          No formatted letter data. Please generate a new cover letter.
        </p>
      </div>
    );
  }

  return (
    /* Outer scroll wrapper — allows horizontal scroll on very small screens */
    <div className="w-full overflow-x-auto">
      <div
        id="cover-letter-paper"
        className="
          bg-white border border-slate-100
          rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)]
          w-full max-w-[794px] mx-auto
        "
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        {/* Responsive padding: less on mobile, full on md+ */}
        <div className="px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">

          {/* ── Sender Info (Top Right) ─────────────────────── */}
          <div className="text-right mb-6 sm:mb-8 text-sm text-slate-600 space-y-0.5">
            {s.senderName  && <p className="font-bold text-slate-800 text-base">{s.senderName}</p>}
            {s.senderEmail && <p>{s.senderEmail}</p>}
            {s.senderPhone && <p>{s.senderPhone}</p>}
          </div>

          {/* ── Date ────────────────────────────────────────── */}
          {s.date && (
            <p className="text-sm text-slate-600 mb-5">{s.date}</p>
          )}

          {/* ── Recipient Info (Left) ────────────────────────── */}
          <div className="mb-6 sm:mb-8 text-sm text-slate-700 space-y-0.5">
            {s.recipient && <p className="font-semibold text-slate-800">{s.recipient}</p>}
            {s.company   && <p>{s.company}</p>}
            {s.position  && <p className="italic text-slate-500">Re: {s.position}</p>}
          </div>

          {/* ── Salutation ──────────────────────────────────── */}
          {s.salutation && (
            <p className="text-slate-800 mb-5">{s.salutation},</p>
          )}

          {/* ── Body ────────────────────────────────────────── */}
          <div className="space-y-4 text-slate-700 text-[14px] sm:text-[15px] leading-[1.8] sm:leading-[1.85] mb-6">
            {extractText(s.introduction)     && <p>{extractText(s.introduction)}</p>}
            {extractText(s.body_paragraph_1) && <p>{extractText(s.body_paragraph_1)}</p>}
            {extractText(s.body_paragraph_2) && <p>{extractText(s.body_paragraph_2)}</p>}
            {extractText(s.conclusion)       && <p>{extractText(s.conclusion)}</p>}
          </div>

          {/* ── Closing ─────────────────────────────────────── */}
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <p className="text-slate-800">{s.closing || "Sincerely"},</p>
            <div>
              <div className="h-8 border-b border-slate-300 w-36 sm:w-48 mb-1" />
              <p className="font-semibold text-slate-800">
                {extractText(s.signature) || extractText(s.senderName) || ""}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}