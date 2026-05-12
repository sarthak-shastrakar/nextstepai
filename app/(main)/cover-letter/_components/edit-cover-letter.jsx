"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Save, Loader2, Eye, Pencil, Copy, FileDown, FileText, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "./cover-letter-preview";

// ── Field schema grouped for display ─────────────────────────────
const FIELDS = [
  { key: "senderName",       label: "Your Full Name",               type: "input",    group: "sender" },
  { key: "senderEmail",      label: "Your Email",                   type: "input",    group: "sender" },
  { key: "senderPhone",      label: "Your Phone",                   type: "input",    group: "sender" },
  { key: "date",             label: "Date",                         type: "input",    group: "header" },
  { key: "recipient",        label: "Recipient Name",               type: "input",    group: "header" },
  { key: "company",          label: "Company Name",                 type: "input",    group: "header" },
  { key: "position",         label: "Position (Re:)",               type: "input",    group: "header" },
  { key: "salutation",       label: "Salutation",                   type: "input",    group: "header" },
  { key: "introduction",     label: "Introduction",                 type: "textarea", rows: 4, group: "body" },
  { key: "body_paragraph_1", label: "Body Paragraph 1",            type: "textarea", rows: 5, group: "body" },
  { key: "body_paragraph_2", label: "Body Paragraph 2 (Optional)", type: "textarea", rows: 4, group: "body" },
  { key: "conclusion",       label: "Conclusion",                   type: "textarea", rows: 4, group: "body" },
  { key: "closing",          label: "Closing",                      type: "input",    group: "footer" },
  { key: "signature",        label: "Signature Name",               type: "input",    group: "footer" },
];

const GROUP_META = {
  sender: { label: "📋 Sender Information",  color: "from-indigo-500 to-violet-500" },
  header: { label: "🏢 Letter Header",        color: "from-violet-500 to-purple-500" },
  body:   { label: "✍️ Letter Body",           color: "from-purple-500 to-pink-500"   },
  footer: { label: "✒️ Closing",              color: "from-pink-500 to-rose-500"     },
};

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 " +
  "transition-all bg-white placeholder:text-slate-400 resize-none";

// ── Safely strip JSON from a text value ──────────────────────────
function cleanText(val) {
  if (!val || typeof val !== "string") return "";
  const t = val.trim();
  if (t.startsWith("{")) {
    try {
      const p = JSON.parse(t);
      return (
        cleanText(p.introduction) ||
        cleanText(p.body_paragraph_1) ||
        cleanText(p.content) ||
        ""
      );
    } catch (_) { return ""; }
  }
  return t;
}

// ── Safely initialise fields from various data shapes ────────────
function resolveInitialFields(coverLetter) {
  const s = coverLetter?.structured;

  // If structured.introduction is itself a JSON blob, parse it
  if (s) {
    const intro = s.introduction || "";
    if (intro.trim().startsWith("{")) {
      try {
        const inner = JSON.parse(intro);
        // Merge inner with outer (outer may have senderName etc.)
        return { ...inner, senderName: s.senderName || inner.senderName || "", senderEmail: s.senderEmail || inner.senderEmail || "", senderPhone: s.senderPhone || inner.senderPhone || "" };
      } catch (_) {}
    }
    // intro is normal text or empty — use structured as-is
    return s;
  }

  // Try content field
  if (coverLetter?.content) {
    const c = coverLetter.content.trim();
    if (c.startsWith("{")) {
      try { return JSON.parse(c); } catch (_) {}
    }
  }

  return {
    recipient: "Hiring Manager", company: coverLetter?.companyName || "",
    position: coverLetter?.jobTitle || "", date: "",
    salutation: "Dear Hiring Manager", introduction: "",
    body_paragraph_1: "", body_paragraph_2: "", conclusion: "",
    closing: "Sincerely", signature: "",
    senderName: "", senderEmail: "", senderPhone: "",
  };
}

// ── Plain-text builder for copy/download ─────────────────────────
function buildPlainText(f) {
  return [
    f.senderName, f.senderEmail, f.senderPhone, "",
    f.date, "",
    f.recipient, f.company,
    f.position ? `Re: ${f.position}` : null, "",
    f.salutation ? `${f.salutation},` : null, "",
    cleanText(f.introduction), "",
    cleanText(f.body_paragraph_1), "",
    f.body_paragraph_2 ? cleanText(f.body_paragraph_2) : null,
    f.body_paragraph_2 ? "" : null,
    cleanText(f.conclusion), "",
    `${f.closing || "Sincerely"},`, "",
    f.signature || f.senderName || "",
  ].filter((l) => l !== null).join("\n").trim();
}

export default function EditCoverLetterClient({ coverLetter }) {
  const [fields, setFields]   = useState(() => resolveInitialFields(coverLetter));
  const [tab, setTab]         = useState("preview");
  const [isPending, startTransition] = useTransition();
  const [dlState, setDlState] = useState(null);
  const [saved, setSaved]     = useState(false);

  const previewData = { ...coverLetter, structured: fields };
  const set = (key, value) => setFields((p) => ({ ...p, [key]: value }));

  // ── Save to DB ────────────────────────────────────────────────
  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCoverLetter(coverLetter.id, fields);
        setSaved(true);
        toast.success("Cover letter saved!");
        setTimeout(() => setSaved(false), 3000);
      } catch (e) { toast.error(e.message || "Save failed"); }
    });
  };

  // ── Copy ──────────────────────────────────────────────────────
  const handleCopy = async () => {
    setDlState("copy");
    try {
      await navigator.clipboard.writeText(buildPlainText(fields));
      toast.success("Copied to clipboard!");
    } catch { toast.error("Copy failed"); } finally { setDlState(null); }
  };

  // ── Download PDF ──────────────────────────────────────────────
  const handlePDF = async () => {
    setDlState("pdf");
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const p = (t) => t ? `<p style="margin:0 0 14px;line-height:1.85;color:#1e293b;">${t}</p>` : "";
      const html = `<div style="font-family:Georgia,'Times New Roman',serif;font-size:13.5px;padding:52px 60px;background:#fff;max-width:794px;">
        <div style="text-align:right;margin-bottom:28px;color:#475569;font-size:13px;">
          ${fields.senderName  ? `<p style="margin:0 0 2px;font-weight:700;font-size:15px;color:#0f172a;">${fields.senderName}</p>` : ""}
          ${fields.senderEmail ? `<p style="margin:0 0 2px;">${fields.senderEmail}</p>` : ""}
          ${fields.senderPhone ? `<p style="margin:0;">${fields.senderPhone}</p>` : ""}
        </div>
        ${fields.date ? `<p style="margin:0 0 24px;color:#475569;font-size:13px;">${fields.date}</p>` : ""}
        <div style="margin-bottom:28px;font-size:13px;">
          ${fields.recipient ? `<p style="margin:0 0 3px;font-weight:700;color:#0f172a;">${fields.recipient}</p>` : ""}
          ${fields.company   ? `<p style="margin:0 0 3px;">${fields.company}</p>` : ""}
          ${fields.position  ? `<p style="margin:0;font-style:italic;color:#64748b;">Re: ${fields.position}</p>` : ""}
        </div>
        ${fields.salutation ? `<p style="margin:0 0 20px;">${fields.salutation},</p>` : ""}
        ${p(cleanText(fields.introduction))}
        ${p(cleanText(fields.body_paragraph_1))}
        ${fields.body_paragraph_2 ? p(cleanText(fields.body_paragraph_2)) : ""}
        ${p(cleanText(fields.conclusion))}
        <div style="margin-top:32px;">
          <p style="margin:0 0 44px;">${fields.closing || "Sincerely"},</p>
          <div style="border-bottom:1px solid #cbd5e1;width:180px;margin-bottom:6px;"></div>
          <p style="margin:0;font-weight:700;">${fields.signature || fields.senderName || ""}</p>
        </div>
      </div>`;
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:absolute;top:0;left:0;width:794px;visibility:hidden;pointer-events:none;z-index:-1;";
      wrap.innerHTML = html;
      document.body.appendChild(wrap);
      await html2pdf().set({
        margin: 0,
        filename: `cover-letter-${(fields.company || "download").replace(/\s+/g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(wrap).save();
      document.body.removeChild(wrap);
      toast.success("PDF downloaded!");
    } catch (e) { toast.error("PDF failed: " + e.message); } finally { setDlState(null); }
  };

  // ── Download Word ─────────────────────────────────────────────
  const handleDocx = async () => {
    setDlState("docx");
    try {
      const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
      const body = (text, opts = {}) => new Paragraph({
        children: [new TextRun({ text: cleanText(text) || "", size: 24, font: "Georgia", ...opts })],
        alignment: AlignmentType.LEFT, spacing: { after: 160 },
      });
      const rAlign = (text, bold = false) => new Paragraph({
        children: [new TextRun({ text: text || "", size: bold ? 26 : 22, bold, font: "Georgia" })],
        alignment: AlignmentType.RIGHT, spacing: { after: 60 },
      });
      const blank = () => new Paragraph({ children: [], spacing: { after: 160 } });
      const doc = new Document({ sections: [{ children: [
        rAlign(fields.senderName, true), rAlign(fields.senderEmail), rAlign(fields.senderPhone),
        blank(), body(fields.date), blank(),
        new Paragraph({ children: [new TextRun({ text: fields.recipient || "", size: 24, bold: true, font: "Georgia" })], spacing: { after: 80 } }),
        body(fields.company),
        fields.position ? body(`Re: ${fields.position}`, { italics: true }) : null,
        blank(), body(`${fields.salutation || "Dear Hiring Manager"},`), blank(),
        body(fields.introduction), body(fields.body_paragraph_1),
        fields.body_paragraph_2 ? body(fields.body_paragraph_2) : null,
        body(fields.conclusion), blank(), body(`${fields.closing || "Sincerely"},`),
        blank(), blank(),
        new Paragraph({ children: [new TextRun({ text: fields.signature || fields.senderName || "", size: 24, bold: true, font: "Georgia" })] }),
      ].filter(Boolean) }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `cover-letter-${(fields.company || "download").replace(/\s+/g, "-")}.docx`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Word document downloaded!");
    } catch (e) { toast.error("Word failed: " + e.message); } finally { setDlState(null); }
  };

  const groups = ["sender", "header", "body", "footer"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab pills */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-full sm:w-fit">
          {[
            { id: "preview", icon: <Eye className="h-3.5 w-3.5" />, label: "Preview" },
            { id: "edit",    icon: <Pencil className="h-3.5 w-3.5" />, label: "Edit Fields" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Action buttons — scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-nowrap sm:flex-wrap">
          <Button onClick={handleCopy} variant="outline" size="sm" disabled={!!dlState} className="gap-1.5 text-xs rounded-xl whitespace-nowrap shrink-0">
            {dlState === "copy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />} Copy
          </Button>
          <Button onClick={handleDocx} variant="outline" size="sm" disabled={!!dlState} className="gap-1.5 text-xs rounded-xl whitespace-nowrap shrink-0">
            {dlState === "docx" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 text-blue-500" />} Word
          </Button>
          {tab === "edit" && (
            <Button onClick={handleSave} disabled={isPending} size="sm"
              className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 whitespace-nowrap shrink-0">
              {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                : saved ? <><CheckCircle2 className="h-3.5 w-3.5" />Saved!</>
                : <><Save className="h-3.5 w-3.5" />Save Changes</>}
            </Button>
          )}
        </div>
      </div>

      {/* ── Preview Tab ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === "preview" && (
          <motion.div key="preview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <CoverLetterPreview coverLetter={previewData} />
          </motion.div>
        )}

        {/* ── Edit Tab ─────────────────────────────────────────── */}
        {tab === "edit" && (
          <motion.div key="edit"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* Two-column on xl: left = form, right = live preview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

              {/* ── Left: Edit Form ── */}
              <div className="space-y-5 min-w-0">
                {groups.map((group) => {
                  const gFields = FIELDS.filter((f) => f.group === group);
                  const meta    = GROUP_META[group];
                  return (
                    <div key={group} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Group header with gradient stripe */}
                      <div className={`h-0.5 w-full bg-gradient-to-r ${meta.color}`} />
                      <div className="px-4 py-3 sm:px-5 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
                          {meta.label}
                        </p>
                      </div>
                      <div className="p-4 sm:p-5 space-y-4">
                        {gFields.map((field) => (
                          <div key={field.key} className="space-y-1.5">
                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {field.label}
                            </label>
                            {field.type === "textarea" ? (
                              <textarea
                                rows={field.rows || 3}
                                value={cleanText(fields[field.key]) || ""}
                                onChange={(e) => set(field.key, e.target.value)}
                                className={inputCls}
                                placeholder={`Enter ${field.label.toLowerCase()}…`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={fields[field.key] || ""}
                                onChange={(e) => set(field.key, e.target.value)}
                                className={inputCls}
                                placeholder={`Enter ${field.label.toLowerCase()}…`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <Button onClick={handleSave} disabled={isPending}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 h-11">
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                    : saved ? <><CheckCircle2 className="h-4 w-4" />Changes Saved!</>
                    : <><Save className="h-4 w-4" />Save Changes to Database</>}
                </Button>
              </div>

              {/* ── Right: Sticky Live Preview (xl only) ── */}
              <div className="hidden xl:block sticky top-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-indigo-400" /> Live Preview
                </p>
                {/* Container clips the scaled preview cleanly */}
                <div className="relative w-full rounded-2xl border border-slate-100 shadow-sm bg-slate-50 overflow-hidden"
                  style={{ paddingBottom: "141.4%" /* A4 aspect ratio */ }}>
                  <div className="absolute inset-0 overflow-auto">
                    <div
                      className="origin-top-left"
                      style={{
                        transform: "scale(0.68)",
                        width: "147.06%",
                        pointerEvents: "none",
                      }}
                    >
                      <CoverLetterPreview coverLetter={previewData} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
