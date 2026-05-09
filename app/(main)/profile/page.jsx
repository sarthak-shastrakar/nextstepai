"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Loader2, CheckCircle2, AlertCircle, X, Save, Camera,
  Briefcase, GraduationCap, Mail, ShieldAlert, Calendar,
  MapPin, AlertTriangle, FileText, Lock, Eye, EyeOff,
  Linkedin, Github, Globe, Languages, BookOpen, Plus
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import {
  updatePersonalInfo,
  updateCareerInfo,
  updatePassword,
  checkUsernameUnique,
  getFullProfileData,
  uploadProfilePicture,
  updateSocialEducation
} from "@/actions/profile";
import { industries } from "@/data/industries";
import { Button } from "@/components/ui/button";

// ── Validation Schemas ──────────────────────────────────────
const personalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Min 3 characters").max(30, "Max 30 characters"),
  phone: z.string().regex(/^\d{10}$/, "Must be a 10-digit number").optional().or(z.literal("")),
  location: z.string().optional(),
  bio: z.string().max(200, "Max 200 characters").optional(),
});

const careerSchema = z.object({
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().optional(),
  experience: z.enum(["fresher", "junior", "mid", "senior"]),
  skills: z.array(z.string()).max(20, "Maximum 20 skills allowed"),
});

const accountSchema = z.object({
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "1 uppercase").regex(/[0-9]/, "1 number").regex(/[^A-Za-z0-9]/, "1 special char"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const socialEducationSchema = z.object({
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  degree: z.string().optional(),
  institution: z.string().optional(),
  graduationYear: z.string().regex(/^(\d{4})?$/, "Enter a valid 4-digit year").optional().or(z.literal("")),
});

const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 text-sm";
const labelCls = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5";

const SectionCard = ({ id, title, icon: Icon, children, editContent, editSection, setEditSection }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="font-black text-slate-800 text-sm tracking-wide">{title}</span>
      </div>
      {editSection !== id ? (
        <button onClick={() => setEditSection(id)}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
          <Save className="w-3.5 h-3.5" /> Edit
        </button>
      ) : (
        <button onClick={() => setEditSection(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      )}
    </div>
    <div className="p-6">
      <AnimatePresence mode="wait">
        {editSection === id ? (
          <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {editContent}
          </motion.div>
        ) : (
          <motion.div key="view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const Field = ({ label, value, placeholder = "Not set" }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-semibold ${value ? "text-slate-800" : "text-slate-400 italic"}`}>{value || placeholder}</p>
  </div>
);

const SaveBtn = ({ isPending, setEditSection }) => (
  <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
    <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-6 h-10 font-bold text-sm shadow-md">
      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
    </Button>
    <button type="button" onClick={() => setEditSection(null)} className="px-4 h-10 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">Cancel</button>
  </div>
);

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "personal";

  const [isPending, startTransition] = useTransition();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State Data
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ resumeCount: 0, interviewCount: 0, coverLetterCount: 0 });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editSection, setEditSection] = useState(null); // null | 'personal' | 'career' | 'social' | 'account'

  // UI States
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [profilePic, setProfilePic] = useState("");
  const fileInputRef = useRef(null);

  // Password Visibility States
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Live Username Check
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken

  // Languages state (tag input)
  const [languages, setLanguages] = useState([]);
  const [langInput, setLangInput] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // Forms Setup
  const { register: regPers, handleSubmit: handlePers, formState: { errors: errPers, isDirty: isPersDirty }, watch: watchPers, reset: resetPers } = useForm({ resolver: zodResolver(personalSchema) });
  const { register: regCar, handleSubmit: handleCar, formState: { errors: errCar, isDirty: isCarDirty }, setValue: setCarValue, watch: watchCar, reset: resetCar } = useForm({ resolver: zodResolver(careerSchema) });
  const { register: regAcc, handleSubmit: handleAcc, formState: { errors: errAcc }, reset: resetAcc } = useForm({ resolver: zodResolver(accountSchema) });
  const { register: regSoc, handleSubmit: handleSoc, formState: { errors: errSoc }, reset: resetSoc } = useForm({ resolver: zodResolver(socialEducationSchema) });

  const watchUsername = watchPers("username");
  const watchIndustry = watchCar("industry");
  const currentSkills = watchCar("skills") || [];
  const currentExp = watchCar("experience");
  const hasUnsavedChanges = isPersDirty || isCarDirty;

  // Load Data
  useEffect(() => {
    if (session?.user) {
      getFullProfileData().then(res => {
        if (res.success) {
          const user = res.user;
          setUserData(user);
          setStats(res.stats);
          setProfilePic(user.profilePicture || user.image || "");
          setLanguages(user.languages || []);

          resetPers({
            name: user.name || "",
            username: user.username || "",
            phone: user.phone || "",
            location: user.location || "",
            bio: user.bio || "",
          });

          resetCar({
            industry: user.industry || "",
            subIndustry: user.subIndustry || "",
            experience: user.experience || "fresher",
            skills: user.skills || [],
          });

          resetSoc({
            linkedin: user.socialLinks?.linkedin || "",
            github: user.socialLinks?.github || "",
            portfolio: user.socialLinks?.portfolio || "",
            degree: user.education?.degree || "",
            institution: user.education?.institution || "",
            graduationYear: user.education?.graduationYear || "",
          });
        }
        setIsLoadingData(false);
      });
    }
  }, [session, resetPers, resetCar, resetSoc]);

  // Check Username Unique
  useEffect(() => {
    if (!watchUsername || watchUsername === userData?.username) {
      setUsernameStatus("idle");
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setUsernameStatus("checking");
      const res = await checkUsernameUnique(watchUsername);
      setUsernameStatus(res.isUnique ? "available" : "taken");
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [watchUsername, userData]);

  // Calculated Strength
  const calculateStrength = () => {
    if (!userData) return 0;
    let score = 0;
    if (userData.name) score += 15;
    if (userData.username) score += 10;
    if (userData.bio) score += 10;
    if (userData.industry) score += 10;
    if (userData.skills?.length > 0) score += 10;
    if (userData.location) score += 10;
    if (profilePic) score += 10;
    if (userData.socialLinks?.linkedin) score += 10;
    if (userData.education?.degree) score += 10;
    if (userData.languages?.length > 0) score += 5;
    return Math.min(score, 100);
  };
  const profileStrength = calculateStrength();

  // Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return showToast("Image must be less than 2MB", "error");
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProfilePic(reader.result);
        startTransition(async () => {
          const res = await uploadProfilePicture(reader.result);
          if (res.success) {
            setProfilePic(res.url);
            await update({ picture: res.url });
            showToast("Profile picture updated!");
          } else {
            showToast(res.message, "error");
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onPersSubmit = async (data) => {
    if (usernameStatus === "taken") return showToast("Username is already taken", "error");
    startTransition(async () => {
      const res = await updatePersonalInfo({ ...data, profilePicture: profilePic });
      if (res.success) {
        setUserData(res.user);
        await update({ name: data.name, username: data.username });
        resetPers(data);
        setEditSection(null);
        showToast("Personal info updated!");
      } else { showToast(res.message, "error"); }
    });
  };

  const onCarSubmit = async (data) => {
    startTransition(async () => {
      const res = await updateCareerInfo(data);
      if (res.success) {
        setUserData(res.user);
        resetCar(data);
        setEditSection(null);
        showToast("Career info updated!");
      } else { showToast(res.message, "error"); }
    });
  };

  const onAccSubmit = async (data) => {
    startTransition(async () => {
      const res = await updatePassword(data);
      if (res.success) {
        resetAcc();
        setEditSection(null);
        showToast("Password updated!");
      } else { showToast(res.message, "error"); }
    });
  };

  // Language tag helpers
  const addLanguage = () => {
    const val = langInput.trim();
    if (val && !languages.includes(val) && languages.length < 10) {
      setLanguages([...languages, val]);
      setLangInput("");
    }
  };
  const removeLanguage = (lang) => setLanguages(languages.filter(l => l !== lang));

  const onSocSubmit = async (data) => {
    startTransition(async () => {
      const res = await updateSocialEducation({ ...data, languages });
      if (res.success) {
        setUserData(res.user);
        setLanguages(res.user.languages || []);
        resetSoc(data);
        setEditSection(null);
        showToast("Social & Education info saved!");
      } else { showToast(res.message, "error"); }
    });
  };

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  const selectedIndustryData = industries.find(i => i.name === watchIndustry);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">

      {/* ── Toasts & Alerts ───────────────────────────────── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div key="toast" initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-24 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </motion.div>
        )}
        {hasUnsavedChanges && (
          <motion.div key="unsaved" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 left-0 right-0 z-40 bg-yellow-400 text-yellow-900 py-2 px-4 text-center text-sm font-bold shadow-md flex justify-center items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> You have unsaved changes. Please save before leaving.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Banner ────────────────────────────────────── */}
      <div className="w-full h-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.1]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 pt-0 flex flex-col items-center text-center"
            >

              {/* Profile Avatar */}
              <div className="relative group cursor-pointer -mt-12 mb-5" onClick={() => fileInputRef.current?.click()}>
                <div className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-xl overflow-hidden bg-indigo-600 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-white">{userData?.name?.[0]?.toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-widest text-center px-2">Change Photo</span>
                  </div>
                </div>
                {isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
              </div>

              {/* Info */}
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{userData?.name}</h1>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">@{userData?.username || "setup_handle"}</p>

              <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold mt-4">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="capitalize">{userData?.industry || "Industry"}</span> • <span className="capitalize">{userData?.experience || "Fresher"}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-4">
                <Calendar className="w-3.5 h-3.5" />
                Member since {userData?.createdAt ? format(new Date(userData?.createdAt), "MMMM yyyy") : "2026"}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-50 rounded-2xl p-4 mt-6 border border-slate-100 text-left">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Strength</span>
                  <span className="text-sm font-black text-indigo-600">{profileStrength}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${profileStrength}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>
                {profileStrength < 100 && <p className="text-[10px] text-slate-500 font-medium mt-2">Add missing details to reach 100%</p>}
              </div>
            </motion.div>

            {/* Stats Row (Grid) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Resumes", value: stats.resumeCount, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Interviews", value: stats.interviewCount, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Letters", value: stats.coverLetterCount, icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Strength", value: `${profileStrength}%`, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-[1.25rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between h-28">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 leading-none mt-2">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: VIEW/EDIT CARDS ───────────── */}
          <div className="w-full lg:w-2/3 flex flex-col gap-5">

            {/* ── SECTION HELPER ── */}

                {/* ── PERSONAL INFO ── */}
                <SectionCard editSection={editSection} setEditSection={setEditSection} id="personal" title="Personal Info" icon={Mail}
                  editContent={
                    <form onSubmit={handlePers(onPersSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Full Name *</label>
                          <input {...regPers("name")} className={inputCls} />
                          {errPers.name && <p className="text-red-500 text-xs mt-1">{errPers.name.message}</p>}
                        </div>
                        <div><label className={labelCls}>Username *</label>
                          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                            <input {...regPers("username")} className={`${inputCls} pl-8`} />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                              {usernameStatus === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {usernameStatus === "taken" && <AlertCircle className="w-4 h-4 text-red-500" />}
                            </div>
                          </div>
                          {errPers.username && <p className="text-red-500 text-xs mt-1">{errPers.username.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Mobile Number</label>
                          <input {...regPers("phone")} className={inputCls} placeholder="10 digits" />
                          {errPers.phone && <p className="text-red-500 text-xs mt-1">{errPers.phone.message}</p>}
                        </div>
                        <div><label className={labelCls}>Location</label>
                          <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input {...regPers("location")} className={`${inputCls} pl-9`} placeholder="City, Country" />
                          </div>
                        </div>
                      </div>
                      <div><label className={labelCls}>Bio ({watchPers("bio")?.length || 0}/200)</label>
                        <textarea {...regPers("bio")} rows={3} className={`${inputCls} resize-none`} placeholder="Short professional bio..." />
                        {errPers.bio && <p className="text-red-500 text-xs mt-1">{errPers.bio.message}</p>}
                      </div>
                      <SaveBtn isPending={isPending} setEditSection={setEditSection} />
                    </form>
                  }>
                  {/* VIEW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name" value={userData?.name} />
                    <Field label="Username" value={userData?.username ? `@${userData.username}` : null} />
                    <Field label="Mobile" value={userData?.phone} />
                    <Field label="Location" value={userData?.location} />
                    {userData?.bio && <div className="md:col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bio</p><p className="text-sm text-slate-700 leading-relaxed">{userData.bio}</p></div>}
                    {!userData?.bio && <div className="md:col-span-2"><Field label="Bio" value={null} placeholder="Not added yet" /></div>}
                  </div>
                </SectionCard>

                {/* ── CAREER INFO ── */}
                <SectionCard editSection={editSection} setEditSection={setEditSection} id="career" title="Career Info" icon={Briefcase}
                  editContent={
                    <form onSubmit={handleCar(onCarSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Industry</label>
                          <select {...regCar("industry")} className={`${inputCls} appearance-none`}>
                            <option value="">Select Industry</option>
                            {industries.map(ind => <option key={ind.id} value={ind.name}>{ind.name}</option>)}
                          </select>
                          {errCar.industry && <p className="text-red-500 text-xs mt-1">{errCar.industry.message}</p>}
                        </div>
                        <div><label className={labelCls}>Sub-Industry</label>
                          <select {...regCar("subIndustry")} disabled={!industries.find(i => i.name === watchIndustry)} className={`${inputCls} appearance-none disabled:opacity-50`}>
                            <option value="">Select Specialization</option>
                            {industries.find(i => i.name === watchIndustry)?.subIndustries.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div><label className={labelCls}>Experience Level</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[{ id: "fresher", label: "Fresher", sub: "0 yrs" }, { id: "junior", label: "Junior", sub: "1-3 yrs" }, { id: "mid", label: "Mid", sub: "3-5 yrs" }, { id: "senior", label: "Senior", sub: "5+ yrs" }].map(exp => (
                            <label key={exp.id} className={`cursor-pointer border rounded-xl p-2.5 flex flex-col items-center text-center transition-all ${currentExp === exp.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"}`}>
                              <input type="radio" {...regCar("experience")} value={exp.id} className="hidden" />
                              <span className={`font-bold text-xs ${currentExp === exp.id ? "text-indigo-700" : "text-slate-700"}`}>{exp.label}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">{exp.sub}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div><label className={labelCls}>Skills ({currentSkills.length}/20)</label>
                        <div className="flex gap-2 mb-2">
                          <input id="skillInput" placeholder="Type skill + Enter" className={`${inputCls} flex-1`}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = e.target.value.trim(); if (v && !currentSkills.includes(v) && currentSkills.length < 20) { setCarValue("skills", [...currentSkills, v], { shouldDirty: true }); e.target.value = ""; } } }} />
                          <button type="button" onClick={() => { const inp = document.getElementById("skillInput"); const v = inp.value.trim(); if (v && !currentSkills.includes(v) && currentSkills.length < 20) { setCarValue("skills", [...currentSkills, v], { shouldDirty: true }); inp.value = ""; } }} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentSkills.map(sk => (
                            <span key={sk} onClick={() => setCarValue("skills", currentSkills.filter(s => s !== sk), { shouldDirty: true })}
                              className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg text-xs font-bold border border-slate-200 cursor-pointer transition-colors">
                              {sk} <X className="w-3 h-3" />
                            </span>
                          ))}
                        </div>
                      </div>
                      <SaveBtn isPending={isPending} setEditSection={setEditSection} />
                    </form>
                  }>
                  {/* VIEW */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Industry" value={userData?.industry} />
                      <Field label="Sub-Industry" value={userData?.subIndustry} />
                      <Field label="Experience" value={userData?.experience ? userData.experience.charAt(0).toUpperCase() + userData.experience.slice(1) : null} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                      {userData?.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userData.skills.map(sk => <span key={sk} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{sk}</span>)}
                        </div>
                      ) : <p className="text-sm text-slate-400 italic">No skills added yet</p>}
                    </div>
                  </div>
                </SectionCard>

                {/* ── SOCIAL & EDUCATION ── */}
                <SectionCard editSection={editSection} setEditSection={setEditSection} id="social" title="Social & Education" icon={Globe}
                  editContent={
                    <form onSubmit={handleSoc(onSocSubmit)} className="space-y-5">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Social Links</p>
                        <div className="relative"><Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0077B5]" />
                          <input {...regSoc("linkedin")} className={`${inputCls} pl-9`} placeholder="https://linkedin.com/in/..." />
                          {errSoc.linkedin && <p className="text-red-500 text-xs mt-1">{errSoc.linkedin.message}</p>}
                        </div>
                        <div className="relative"><Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                          <input {...regSoc("github")} className={`${inputCls} pl-9`} placeholder="https://github.com/..." />
                          {errSoc.github && <p className="text-red-500 text-xs mt-1">{errSoc.github.message}</p>}
                        </div>
                        <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                          <input {...regSoc("portfolio")} className={`${inputCls} pl-9`} placeholder="https://yourportfolio.com" />
                          {errSoc.portfolio && <p className="text-red-500 text-xs mt-1">{errSoc.portfolio.message}</p>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Languages ({languages.length}/10)</p>
                        <div className="flex gap-2 mb-2">
                          <input value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLanguage(); } }} placeholder="e.g. English, Hindi" className={`${inputCls} flex-1`} />
                          <button type="button" onClick={addLanguage} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {languages.map(l => <span key={l} onClick={() => removeLanguage(l)} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors">{l} <X className="w-3 h-3" /></span>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Education</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><label className={labelCls}>Qualification</label>
                            <select {...regSoc("degree")} className={`${inputCls} appearance-none`}>
                              <option value="">Select</option>
                              {["High School (10th)", "Intermediate (12th)", "Diploma", "B.Tech / B.E.", "B.Sc", "BCA", "B.Com", "BBA", "B.A.", "M.Tech / M.E.", "M.Sc", "MCA", "MBA", "M.A.", "M.Com", "PhD", "Other"].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div><label className={labelCls}>Graduation Year</label>
                            <input {...regSoc("graduationYear")} className={inputCls} placeholder="e.g. 2024" maxLength={4} />
                            {errSoc.graduationYear && <p className="text-red-500 text-xs mt-1">{errSoc.graduationYear.message}</p>}
                          </div>
                        </div>
                        <div className="mt-3"><label className={labelCls}>College / University</label>
                          <input {...regSoc("institution")} className={inputCls} placeholder="e.g. IIT Delhi" />
                        </div>
                      </div>
                      <SaveBtn isPending={isPending} setEditSection={setEditSection} />
                    </form>
                  }>
                  {/* VIEW */}
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Social Links</p>
                      <div className="space-y-2">
                        {userData?.socialLinks?.linkedin ? <a href={userData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-[#0077B5] hover:underline"><Linkedin className="w-4 h-4" /> LinkedIn Profile</a> : <p className="text-sm text-slate-400 italic">LinkedIn not added</p>}
                        {userData?.socialLinks?.github && <a href={userData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:underline"><Github className="w-4 h-4" /> GitHub Profile</a>}
                        {userData?.socialLinks?.portfolio && <a href={userData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"><Globe className="w-4 h-4" /> Portfolio Website</a>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Languages</p>
                      {userData?.languages?.length > 0 ? <div className="flex flex-wrap gap-2">{userData.languages.map(l => <span key={l} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{l}</span>)}</div> : <p className="text-sm text-slate-400 italic">No languages added</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Education</p>
                      {userData?.education?.degree ? (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <BookOpen className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{userData.education.degree}</p>
                            {userData.education.institution && <p className="text-slate-500 text-xs mt-0.5">{userData.education.institution}</p>}
                            {userData.education.graduationYear && <p className="text-slate-400 text-xs">Class of {userData.education.graduationYear}</p>}
                          </div>
                        </div>
                      ) : <p className="text-sm text-slate-400 italic">Education not added</p>}
                    </div>
                  </div>
                </SectionCard>

                {/* ── ACCOUNT / PASSWORD ── */}
                <SectionCard editSection={editSection} setEditSection={setEditSection} id="account" title="Account Settings" icon={Lock}
                  editContent={
                    <div className="space-y-5">
                      <div>
                        <label className={labelCls}>Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={userData?.email || ""} disabled className={`${inputCls} pl-9 cursor-not-allowed opacity-60`} />
                          {userData?.googleId && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Google</span>}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{userData?.hasPassword ? "Change Password" : "Set Platform Password"}</p>
                        <form onSubmit={handleAcc(onAccSubmit)} className="space-y-3">
                          {userData?.hasPassword && (
                            <div className="relative">
                              <input type={showCurrentPw ? "text" : "password"} {...regAcc("currentPassword")} placeholder="Current Password" className={`${inputCls} pr-10`} />
                              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              {errAcc.currentPassword && <p className="text-red-500 text-xs mt-1">{errAcc.currentPassword.message}</p>}
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="relative">
                              <input type={showNewPw ? "text" : "password"} {...regAcc("newPassword")} placeholder="New Password" className={`${inputCls} pr-10`} />
                              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              {errAcc.newPassword && <p className="text-red-500 text-xs mt-1">{errAcc.newPassword.message}</p>}
                            </div>
                            <div className="relative">
                              <input type={showConfirmPw ? "text" : "password"} {...regAcc("confirmPassword")} placeholder="Confirm Password" className={`${inputCls} pr-10`} />
                              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              {errAcc.confirmPassword && <p className="text-red-500 text-xs mt-1">{errAcc.confirmPassword.message}</p>}
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-100">
                            <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-10 font-bold text-sm">
                              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                              {userData?.hasPassword ? "Update Password" : "Set Password"}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  }>
                  {/* VIEW */}
                  <div className="space-y-3">
                    <Field label="Email Address" value={userData?.email} />
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${userData?.hasPassword ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <p className="text-sm font-semibold text-slate-600">
                        {userData?.hasPassword ? "Platform password is set" : "No platform password set — using Google login only"}
                      </p>
                    </div>
                    {userData?.googleId && <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100 w-fit"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-xs font-bold text-emerald-700">Google Account Connected</span></div>}
                  </div>
                </SectionCard>



          </div>

        </div>
      </div>
    </div>
  );
}