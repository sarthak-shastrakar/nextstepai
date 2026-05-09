"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle, Download, Edit, Loader2, Monitor, Sparkles, Save,
  Brain, CheckCircle2, XCircle, TrendingUp, User, GraduationCap,
  Briefcase, Code2, Award, ChevronRight, Lightbulb, Zap, Eye, EyeOff, LayoutTemplate, ShieldCheck,
  FileText, FileDown,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { saveResume, getATSScore, generateSummary } from "@/actions/resume";
import { useSession } from "next-auth/react";
import { EntryForm } from "./entry-form";
import { SummaryForm } from "./summaryform";
import useFetch from "@/hooks/use-fetch";
import { entriesToMarkdown } from "@/app/form-lib/helper";
import { resumeSchema } from "@/app/form-lib/schema";
import { cn } from "@/lib/utils";
import ResumePreview from "./ResumePreview";
import { RESUME_TEMPLATES } from "./templates";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTemplate, setPreviewModalOpen, setSelectedTemplatePreview } from "@/lib/resumeSlice";
import { exportToDocx, exportToText, exportToPDF } from "@/lib/export-utils";

export default function ResumeBuilder({ initialContent, userIndustry, user: fullUser }) {
  const dispatch = useDispatch();
  const activeTemplate = useSelector(state => state.resume.activeTemplate);
  const previewModalOpen = useSelector(state => state.resume.previewModalOpen);
  const selectedTemplatePreview = useSelector(state => state.resume.selectedTemplatePreview);

  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { data: session } = useSession();
  const user = session?.user || fullUser;
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false);

  const handleTabChange = (val) => setActiveTab(val);

  const sectionRefs = {
    contact: useRef(null),
    summary: useRef(null),
    skills: useRef(null),
    experience: useRef(null),
    education: useRef(null),
    projects: useRef(null),
    certifications: useRef(null),
    awards: useRef(null),
  };

  const scrollToSection = (sectionName) => {
    setActiveTab("edit");
    setTimeout(() => {
      sectionRefs[sectionName]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const {
    control, register, handleSubmit, watch, reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      awards: [],
    },
  });

  // Restore saved resume from JSON or Auto-fill from DB
  useEffect(() => {
    if (initialContent) {
      if (typeof initialContent === "object") {
        reset(initialContent);
      } else {
        try {
          const parsed = JSON.parse(initialContent);
          reset(parsed);
          setPreviewContent(initialContent);
        } catch {
          setPreviewContent(initialContent);
        }
      }
    } else if (fullUser) {
      // Auto-fill from user profile
      reset({
        contactInfo: {
          email: fullUser.email || "",
          mobile: fullUser.phone || "",
          linkedin: fullUser.socialLinks?.linkedin || "",
          github: fullUser.socialLinks?.github || "",
        },
        summary: fullUser.bio || "",
        skills: Array.isArray(fullUser.skills) ? fullUser.skills.join(", ") : (fullUser.skills || ""),
        experience: [], // Reset experience array, don't use profile's experience level string
        education: (fullUser.education?.degree || fullUser.education?.institution) ? [{
          title: fullUser.education.degree || "",
          organization: fullUser.education.institution || "",
          endDate: fullUser.education.graduationYear || "",
          startDate: "",
          description: "",
          current: false
        }] : [],
        projects: [],
        certifications: [],
        awards: [],
      });
      toast.success("Resume auto-filled from your profile!");
    }
  }, [initialContent, fullUser, reset]);

  const { loading: isSaving, fn: saveResumeFn, data: saveResult } = useFetch(saveResume);
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const content = getCombinedContent();
      setPreviewContent(content || initialContent);
    }
  }, [formValues, activeTab]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`💼 LinkedIn`);
    if (contactInfo.github) parts.push(`💻 GitHub`);
    return parts.length > 0 ? `## Contact\n${parts.join(" | ")}` : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n${summary}`,
      skills && `## Skills\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ].filter(Boolean).join("\n\n");
  };

  const getCompletion = () => {
    const { contactInfo, summary, skills, experience, education, projects } = formValues;
    const checks = [
      contactInfo?.email, contactInfo?.mobile, contactInfo?.linkedin,
      summary?.length > 50, skills?.length > 20,
      experience?.length > 0, education?.length > 0, projects?.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const completion = getCompletion();

  const getStrengthColor = (pct) => {
    if (pct < 40) return "bg-red-500";
    if (pct < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const improvementTips = [
    !formValues.contactInfo?.linkedin && { text: "Add LinkedIn profile", section: "contact", pts: "+15" },
    !formValues.summary?.length && { text: "Write a professional summary", section: "summary", pts: "+20" },
    !formValues.skills?.length && { text: "List your core skills", section: "skills", pts: "+15" },
    !formValues.experience?.length && { text: "Add work experience", section: "experience", pts: "+25" },
    !formValues.projects?.length && { text: "Showcase your projects", section: "projects", pts: "+15" },
  ].filter(Boolean);

  const sectionTips = {
    contact: "Include LinkedIn, GitHub, and professional email. Recruiters verify these first.",
    summary: "Start with your role + years of experience, then highlight 2 top achievements.",
    skills: "List 8–15 skills separated by commas. Mirror keywords from the job description.",
    experience: "Use action verbs (Led, Built, Optimized). Quantify results (e.g. 'improved load time by 40%').",
    education: "Include GPA if above 3.5. List relevant coursework or certifications.",
    projects: "Describe tech stack, your specific contribution, and measurable impact.",
    certifications: "List professional certifications that validate your technical expertise.",
    awards: "Include hackathon wins, academic honors, or professional recognition.",
  };

  const onSubmit = async (data) => {
    const hasMinimalDetails = data.contactInfo?.email || data.summary?.length > 20 || data.experience?.length > 0;
    if (!hasMinimalDetails) {
      toast.error("Please add at least basic contact info or a summary before saving.");
      return;
    }
    try {
      await saveResumeFn(data);
      toast.success("Resume saved successfully!");
    } catch {
      toast.error("Failed to save resume. Please try again.");
    }
  };

  const handleCheckATS = async () => {
    if (completion < 60) {
      toast.error("Resume Incomplete", {
        description: `Your resume is only ${completion}% complete. Please fill at least 60% before running ATS analysis.`,
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const analysis = await getATSScore(getCombinedContent() || previewContent, targetRole || "General Professional");
      setAtsAnalysis(analysis);
      toast.success("ATS Analysis Complete", {
        description: targetRole ? `Optimized for ${targetRole}` : "General analysis completed",
      });
      
      // Auto-scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("ats-results");
        resultsEl?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (error) {
      toast.error("ATS analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const { skills, experience } = formValues;
      const result = await generateSummary({ skills, experience });
      reset({ ...formValues, summary: result });
      toast.success("Summary generated!");
    } catch {
      toast.error("Failed to generate summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const addSkill = (skill) => {
    const currentSkills = formValues.skills || "";
    const skillList = currentSkills.split(",").map(s => s.trim()).filter(Boolean);
    
    if (skillList.includes(skill)) {
      toast.error(`${skill} is already in your skills list.`);
      return;
    }

    const newSkills = currentSkills ? `${currentSkills}, ${skill}` : skill;
    reset({ ...formValues, skills: newSkills });
    toast.success(`${skill} added to your skills!`);
  };

  const handleExportPDF = () => {
    setActiveTab("preview");
    setResumeMode("preview");
    setTimeout(() => {
      exportToPDF(user);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 md:space-y-8 pb-32"
    >
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-background/90 backdrop-blur-xl border-b border-slate-100 dark:border-border/40 py-3 px-4 -mx-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden shadow-sm">
        <div>
          <h1 className="font-black gradient-title text-2xl md:text-3xl tracking-tight leading-none">
            Resume Builder
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-widest flex items-center gap-2">
            NextStep AI
            {!isSaving && saveResult && (
              <span className="flex items-center gap-1 text-emerald-500 normal-case">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Saved
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowTemplateDrawer(!showTemplateDrawer)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{RESUME_TEMPLATES[activeTemplate]?.name || "Template"}</span>
            <span className="sm:hidden">Template</span>
            {RESUME_TEMPLATES[activeTemplate]?.recommended && (
              <span className="text-[9px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-full">⭐</span>
            )}
          </motion.button>
          <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/30 rounded-xl px-3 border border-slate-200/60 dark:border-border/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/5 transition-all group max-w-[180px] sm:max-w-[240px]">
            <Brain className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Frontend Dev)"
              className="border-none bg-transparent focus-visible:ring-0 text-xs font-bold h-9 placeholder:text-slate-400/80"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleCheckATS} disabled={isAnalyzing}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-primary/20 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            ATS Check
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSubmit(onSubmit)} disabled={isSaving}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-slate-200 z-50">
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer font-semibold text-sm py-2 rounded-lg focus:bg-slate-100">
                <FileText className="h-4 w-4 mr-2 text-rose-500" /> PDF Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToDocx(formValues, user)} className="cursor-pointer font-semibold text-sm py-2 rounded-lg focus:bg-slate-100">
                <FileDown className="h-4 w-4 mr-2 text-blue-500" /> Word (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToText(formValues, user)} className="cursor-pointer font-semibold text-sm py-2 rounded-lg focus:bg-slate-100">
                <FileText className="h-4 w-4 mr-2 text-slate-500" /> Plain Text (.txt)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Template Drawer ── */}
      <AnimatePresence>
        {showTemplateDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden print:hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-slate-100 mb-4 shadow-inner">
              {Object.values(RESUME_TEMPLATES).map((tmpl) => (
                <motion.div
                  key={tmpl.id}
                  onClick={() => { dispatch(setActiveTemplate(tmpl.id)); setShowTemplateDrawer(false); }}
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                  className={cn(
                    "cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden bg-white",
                    activeTemplate === tmpl.id
                      ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : "border-slate-200 hover:border-primary/30 hover:shadow-md"
                  )}
                >
                  {/* Mockup Image Area */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 h-24 flex flex-col gap-1.5 justify-start">
                    <div className="h-2 w-1/3 bg-slate-200 rounded-sm"></div>
                    <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                    <div className="h-1 w-5/6 bg-slate-200 rounded-sm mb-1"></div>
                    <div className="flex-1 flex gap-2 w-full mt-1">
                      {tmpl.id === 'minimal' ? (
                        <div className="w-full h-full bg-slate-100 rounded-sm"></div>
                      ) : tmpl.id === 'modern' ? (
                        <>
                          <div className="w-1/3 h-full bg-slate-100 rounded-sm"></div>
                          <div className="w-2/3 h-full bg-slate-100 rounded-sm"></div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/3 h-full bg-slate-100 rounded-sm"></div>
                          <div className="w-2/3 h-full bg-slate-100 rounded-sm"></div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5 pr-24">
                    <div className={cn("h-3 w-3 rounded-full border-2 transition-all shrink-0", activeTemplate === tmpl.id ? "bg-primary border-primary" : "border-slate-300")} />
                    <h4 className="text-sm font-bold text-slate-800">{tmpl.name}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground pl-5 leading-relaxed">{tmpl.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Template Preview Modal ── */}
      <AnimatePresence>
        {previewModalOpen && selectedTemplatePreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 print:hidden"
            onClick={() => dispatch(setPreviewModalOpen(false))}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-100 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/50"
            >
              <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-800">{RESUME_TEMPLATES[selectedTemplatePreview]?.name}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{RESUME_TEMPLATES[selectedTemplatePreview]?.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      dispatch(setActiveTemplate(selectedTemplatePreview));
                      dispatch(setPreviewModalOpen(false));
                    }}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-primary/20"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Use This Template
                  </motion.button>
                  <button onClick={() => dispatch(setPreviewModalOpen(false))} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                <div className="shadow-2xl shadow-slate-300/50 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <ResumePreview 
                    templateId={selectedTemplatePreview}
                    user={{
                      name: "Alex Johnson",
                      industry: "Senior Software Engineer",
                    }}
                    values={{
                      contactInfo: { email: "alex@example.com", mobile: "+91 98765 43210", linkedin: "linkedin.com/in/alex", github: "github.com/alex" },
                      summary: "Experienced software engineer with 5+ years building scalable systems and leading teams.",
                      skills: "React, Node.js, Python, AWS, MongoDB",
                      experience: [
                        { title: "Senior Engineer", company: "Google", startDate: "2021", endDate: "2024", current: false, description: "Led development of core infrastructure." },
                        { title: "Software Engineer", company: "Microsoft", startDate: "2019", endDate: "2021", current: false, description: "Built enterprise applications." }
                      ],
                      education: [{ school: "IIT Mumbai", degree: "B.Tech CS", startDate: "2015", endDate: "2019" }],
                      projects: [{ title: "AI Resume Builder", description: "Built using Next.js and OpenAI." }],
                      certifications: [],
                      awards: [],
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar — Desktop */}
        <div className="lg:col-span-1 hidden lg:block print:hidden">
          <div className="sticky top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Strength</span>
                <span className={`text-sm font-black ${completion < 75 ? "text-amber-500" : "text-emerald-500"}`}>{completion}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${completion}%` }}
                  transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.3 }}
                  className={`h-full rounded-full ${getStrengthColor(completion)}`}
                />
              </div>
              {improvementTips.length > 0 && completion < 100 && (
                <div className="space-y-1 mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-amber-400 fill-amber-400" /> Quick Wins
                  </p>
                  {improvementTips.map((tip, i) => (
                    <motion.div
                      key={i} onClick={() => scrollToSection(tip.section)} whileHover={{ x: 3 }}
                      className="flex items-center justify-between cursor-pointer hover:bg-primary/5 p-2 rounded-lg transition-all group"
                    >
                      <span className="text-[10px] text-slate-500 group-hover:text-primary transition-colors font-medium">{tip.text}</span>
                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">{tip.pts}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
            >
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Sections</p>
              {[
                { key: "contact", icon: <User className="h-3.5 w-3.5" />, label: "Contact" },
                { key: "summary", icon: <Brain className="h-3.5 w-3.5" />, label: "Summary" },
                { key: "skills", icon: <Code2 className="h-3.5 w-3.5" />, label: "Skills" },
                { key: "experience", icon: <Briefcase className="h-3.5 w-3.5" />, label: "Experience" },
                { key: "education", icon: <GraduationCap className="h-3.5 w-3.5" />, label: "Education" },
                { key: "projects", icon: <Award className="h-3.5 w-3.5" />, label: "Projects" },
                { key: "certifications", icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Certifications" },
                { key: "awards", icon: <Sparkles className="h-3.5 w-3.5" />, label: "Awards" },
              ].map((s) => (
                <motion.div
                  key={s.key} onClick={() => scrollToSection(s.key)}
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-slate-600 hover:text-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="text-slate-400 group-hover:text-primary transition-colors">{s.icon}</span>
                  <span className="text-xs font-semibold">{s.label}</span>
                  <ChevronRight className="h-3 w-3 ml-auto text-slate-300 group-hover:text-primary/50 transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6 h-11">
              <TabsTrigger value="edit" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Build Form
              </TabsTrigger>
              <TabsTrigger value="preview" className="rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Live Preview
              </TabsTrigger>
            </TabsList>

            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-6 pb-10">
              {(!initialContent && fullUser) && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl mb-4">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-bold">Fields have been auto-filled from your profile to save you time!</p>
                  <Badge className="ml-auto bg-indigo-500 hover:bg-indigo-600 shadow-none border-none">Auto-filled</Badge>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                <motion.div ref={sectionRefs.contact} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<User className="h-4 w-4" />} title="Contact Information" tip={sectionTips.contact} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    {[
                      { name: "contactInfo.email", type: "email", label: "Email Address", placeholder: "you@example.com" },
                      { name: "contactInfo.mobile", type: "tel", label: "Mobile Number", placeholder: "+91 XXXXX XXXXX" },
                      { name: "contactInfo.linkedin", type: "url", label: "LinkedIn URL", placeholder: "linkedin.com/in/you" },
                      { name: "contactInfo.github", type: "url", label: "GitHub URL", placeholder: "github.com/you" },
                    ].map((f) => (
                      <div key={f.name} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{f.label}</label>
                        <Input {...register(f.name)} type={f.type} placeholder={f.placeholder} className="rounded-xl border-slate-200 focus:border-primary/40 transition-all h-10 text-sm" />
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.summary} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<Brain className="h-4 w-4" />} title="Professional Summary" tip={sectionTips.summary} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Controller name="summary" control={control} render={({ field }) => <SummaryForm value={field.value} onChange={field.onChange} />} />
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.skills} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<Code2 className="h-4 w-4" />} title="Core Skills" tip={sectionTips.skills} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Textarea {...register("skills")} placeholder="React, Node.js, TypeScript, Python, AWS..." className="min-h-[80px] rounded-xl border-slate-200 focus:border-primary/40 resize-none text-sm" />
                    <p className="text-[10px] text-muted-foreground mt-2">Separate skills with commas</p>
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.experience} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<Briefcase className="h-4 w-4" />} title="Work Experience" tip={sectionTips.experience} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Controller name="experience" control={control} render={({ field }) => <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />} />
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.education} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<GraduationCap className="h-4 w-4" />} title="Education" tip={sectionTips.education} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Controller name="education" control={control} render={({ field }) => <EntryForm type="Education" entries={field.value} onChange={field.onChange} />} />
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.projects} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<Award className="h-4 w-4" />} title="Projects" tip={sectionTips.projects} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Controller name="projects" control={control} render={({ field }) => <EntryForm type="Project" entries={field.value} onChange={field.onChange} />} />
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.certifications} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<Award className="h-4 w-4" />} title="Certifications" tip={sectionTips.certifications} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Controller name="certifications" control={control} render={({ field }) => <EntryForm type="Certifications" entries={field.value} onChange={field.onChange} />} />
                  </div>
                </motion.div>

                <motion.div ref={sectionRefs.awards} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="scroll-mt-28">
                  <SectionLabel icon={<Sparkles className="h-4 w-4" />} title="Achievements & Awards" tip={sectionTips.awards} />
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <Controller name="awards" control={control} render={({ field }) => <EntryForm type="Awards" entries={field.value} onChange={field.onChange} />} />
                  </div>
                </motion.div>

              </form>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-bold text-primary text-[10px] px-3 border-primary/20">A4 Format</Badge>
                  <p className="text-xs text-muted-foreground hidden md:block">Real-time professional preview</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-primary/30 transition-all"
                >
                  {resumeMode === "preview" ? <><Edit className="h-3.5 w-3.5" />Source Code</> : <><Monitor className="h-3.5 w-3.5" />Visual View</>}
                </motion.button>
              </div>

              {activeTab === "preview" && resumeMode !== "preview" && (
                <div className="flex p-4 gap-3 items-center border border-amber-200 bg-amber-50 text-amber-700 rounded-xl text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Manual markdown edits may be overwritten by form changes.
                </div>
              )}

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xl bg-white">
                {resumeMode === "preview" ? (
                  <ResumePreview values={formValues} user={{ name: user?.name, image: user?.image, industry: userIndustry }} templateId={activeTemplate} />
                ) : (
                  <MDEditor value={previewContent} onChange={setPreviewContent} height={800} preview={resumeMode} className="!border-none" />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── ATS Panel ── */}
      <AnimatePresence>
        {atsAnalysis && (
          <motion.div
            id="ats-results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="mt-12 print:hidden scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Role-Specific Intelligence</h3>
                  <p className="text-xs text-muted-foreground font-medium">Analyzing fit for <span className="text-primary font-bold">{targetRole || "General Role"}</span></p>
                </div>
              </div>
              {atsAnalysis.similarRoles && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">Paths:</span>
                  {atsAnalysis.similarRoles.map((role, i) => (
                    <Badge key={i} variant="outline" className="text-[9px] font-bold border-slate-200 bg-white text-slate-500 rounded-full px-3 py-1">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Dual Score Cards */}
              <div className="xl:col-span-1 space-y-6">
                {[
                  { label: "Role Match", score: atsAnalysis.matchScore || 0, icon: <Zap className="h-3 w-3" /> },
                  { label: "Resume Quality", score: atsAnalysis.qualityScore || 0, icon: <Award className="h-3 w-3" /> }
                ].map((s, i) => (
                  <motion.div 
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + (i * 0.1) }}
                    className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-6 shadow-xl shadow-slate-200/30 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90 drop-shadow-sm">
                        <circle cx="48" cy="48" r="42" stroke="#F8FAFC" strokeWidth="6" fill="transparent" />
                        <motion.circle 
                          cx="48" cy="48" r="42" 
                          stroke="currentColor" 
                          className={cn(
                            "transition-colors duration-1000",
                            s.score >= 80 ? "text-emerald-500" : s.score >= 50 ? "text-amber-500" : "text-rose-500"
                          )}
                          strokeWidth="6" fill="transparent" strokeLinecap="round"
                          strokeDasharray={264} initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * s.score) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 + (i * 0.2) }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">{s.score}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-primary">
                        {s.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 leading-tight">
                        {s.score >= 80 ? "Excellent" : s.score >= 50 ? "Competitive" : "Action Needed"}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 flex items-center gap-2">
                     <Lightbulb className="h-3 w-3 text-amber-400" /> Professional Insight
                   </h4>
                   <p className="text-xs font-medium leading-relaxed italic">&ldquo;{atsAnalysis.summary}&rdquo;</p>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    title: "Strategic Strengths", 
                    data: atsAnalysis.strengths, 
                    icon: <CheckCircle2 className="h-4 w-4" />, 
                    color: "emerald",
                    bgColor: "bg-emerald-50",
                    borderColor: "border-emerald-100",
                    textColor: "text-emerald-700",
                    dotColor: "bg-emerald-500"
                  },
                  { 
                    title: "Growth Opportunities", 
                    data: atsAnalysis.weaknesses, 
                    icon: <TrendingUp className="h-4 w-4" />, 
                    color: "amber",
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-100",
                    textColor: "text-amber-700",
                    dotColor: "bg-amber-500"
                  },
                  { 
                    title: "Implementation Plan", 
                    data: atsAnalysis.suggestions, 
                    icon: <Zap className="h-4 w-4" />, 
                    color: "indigo",
                    bgColor: "bg-indigo-50/50",
                    borderColor: "border-indigo-100/50",
                    textColor: "text-indigo-700",
                    dotColor: "bg-indigo-500",
                    isBadges: true
                  },
                ].map((section, idx) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className={cn(
                      "rounded-3xl p-6 border transition-all hover:shadow-lg",
                      section.bgColor, section.borderColor
                    )}
                  >
                    <h4 className={cn("flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-4", section.textColor)}>
                      {section.icon} {section.title}
                    </h4>
                    
                    {section.isBadges ? (
                      <div className="flex flex-wrap gap-2">
                        {section.data?.map((item, i) => (
                          <Badge 
                            key={i} 
                            className={cn(
                              "text-[10px] font-bold py-1.5 px-3 rounded-xl border-none shadow-sm bg-white text-indigo-700"
                            )}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {section.data?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs font-semibold leading-relaxed group">
                            <span className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-150", section.dotColor)} />
                            <span className={cn(section.textColor)}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}

                {/* Skills Gap Analysis Feature (Next Level) */}
                {(atsAnalysis.missingSkills?.hard?.length > 0 || atsAnalysis.missingSkills?.soft?.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TrendingUp className="h-32 w-32 text-emerald-400" />
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Zap className="h-5 w-5" />
                        </div>
                        <h4 className="text-xl font-bold text-white tracking-tight">Skills Gap Highlighter</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Code2 className="h-3 w-3" /> Hard Skills (Essential)
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {atsAnalysis.missingSkills.hard?.map((skill, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addSkill(skill)}
                                className="text-[11px] font-bold px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 group"
                              >
                                {skill}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none">+</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Brain className="h-3 w-3" /> Soft Skills (Bonus)
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {atsAnalysis.missingSkills.soft?.map((skill, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addSkill(skill)}
                                className="text-[11px] font-bold px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 group"
                              >
                                {skill}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none">+</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-8 text-[10px] text-slate-500 font-medium italic">
                        * Click any skill to automatically add it to your resume.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ── Mobile Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 py-3 flex items-center gap-2 print:hidden shadow-lg">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit(onSubmit)} disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </motion.button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md"
            >
              <Download className="h-4 w-4" /> Export
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 p-2 rounded-xl border-slate-200 z-50">
            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer font-semibold text-sm py-2 rounded-lg focus:bg-slate-100">
              <FileText className="h-4 w-4 mr-2 text-rose-500" /> PDF Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToDocx(formValues, user)} className="cursor-pointer font-semibold text-sm py-2 rounded-lg focus:bg-slate-100">
              <FileDown className="h-4 w-4 mr-2 text-blue-500" /> Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToText(formValues, user)} className="cursor-pointer font-semibold text-sm py-2 rounded-lg focus:bg-slate-100">
              <FileText className="h-4 w-4 mr-2 text-slate-500" /> Plain Text (.txt)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleTabChange(activeTab === "preview" ? "edit" : "preview")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/20 text-primary text-sm font-bold bg-primary/5"
        >
          {activeTab === "preview" ? <><EyeOff className="h-4 w-4" />Edit</> : <><Eye className="h-4 w-4" />Preview</>}
        </motion.button>
      </div>
    </motion.div>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">{icon}</div>
        <h3 className="font-bold text-slate-800 text-base">{title}</h3>
      </div>
    </div>
  );
}
