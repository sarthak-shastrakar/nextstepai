"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Loader2, ShieldAlert, Trash2, Mail, User as UserIcon,
  Phone, Briefcase, Code2, MapPin, BadgeCheck,
  AlertCircle, Star, Sparkles, ChevronRight, Lock,
  Fingerprint, Settings2, Globe, Heart, Edit3
} from "lucide-react";
import { deleteAccount, getFullProfileData } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Glass Card Wrapper ───────────────────────────────────────
const GlassCard = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.215, 0.61, 0.355, 1] }}
    className={cn(
      "bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden",
      className
    )}
  >
    {children}
  </motion.div>
);

// ── Info Item ────────────────────────────────────────────────
const InfoItem = ({ icon: Icon, label, value, badge, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${colors[color]} shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800 truncate tracking-tight">{value || "Not provided"}</p>
          {badge && (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
              {badge}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      getFullProfileData().then((res) => {
        if (res.success) setUserData(res.user);
        setIsLoading(false);
      });
    }
  }, [session]);

  const handleDelete = () => {
    if (deleteText !== "DELETE") return;
    startTransition(async () => {
      const res = await deleteAccount();
      if (res.success) {
        signOut({ callbackUrl: "/" });
      } else {
        setError(res.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Settings2 className="absolute inset-0 m-auto h-6 w-6 text-indigo-600 animate-pulse" />
        </div>
      </div>
    );
  }

  const expLabels = { 
    fresher: "Fresher (0–1 Year)", 
    junior: "Junior (1–3 Years)", 
    mid: "Mid-level (3–5 Years)", 
    senior: "Senior (5+ Years)" 
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans">
      
      {/* ── Top Navigation / Hero ── */}
      <div className="relative pt-12 pb-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4"
            >
              <Lock className="w-3 h-3" /> View Only Mode
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight"
            >
              Account Settings
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 font-medium mt-2 max-w-lg text-sm md:text-base"
            >
              Review your professional profile and manage your account security.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* ── Left Column: Profile Card ── */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 text-center" delay={0.1}>
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white">
                  {userData?.profilePicture || userData?.image ? (
                    <img src={userData.profilePicture || userData.image} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-indigo-600">{userData?.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border border-slate-100">
                <BadgeCheck className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{userData?.name}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">@{userData?.username || "unnamed"}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Active</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Right Column: Details ── */}
        <div className="lg:col-span-8 space-y-6">
          
          <GlassCard delay={0.15}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">Personal Details</h3>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Mail}     label="Primary Email"   value={userData?.email}    badge={userData?.googleId ? "Google" : "Email"} color="indigo" />
              <InfoItem icon={UserIcon} label="Full Name"       value={userData?.name}      color="purple" />
              <InfoItem icon={Phone}    label="Mobile Number"   value={userData?.phone}     color="emerald" />
              <InfoItem icon={MapPin}   label="Location"        value={userData?.location}  color="rose" />
              
              {userData?.bio && (
                <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional Bio</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">"{userData.bio}"</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard delay={0.2}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">Professional Profile</h3>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Globe}    label="Industry"      value={userData?.industry}    color="amber" />
                <InfoItem icon={Briefcase} label="Sub-Industry" value={userData?.subIndustry} color="purple" />
                <InfoItem icon={Star}     label="Experience"    value={expLabels[userData?.experience] || "Not set"} color="indigo" />
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-400" /> Skills ({userData?.skills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-2">
                  {userData?.skills?.length > 0 ? (
                    userData.skills.map(sk => (
                      <span key={sk} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-bold shadow-sm">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 font-medium">No skills added yet.</span>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ── Danger Zone ── */}
          <GlassCard className="border-red-200 bg-red-50" delay={0.25}>
            <div className="p-6 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-red-900 tracking-tight">Permanently Delete Account</h3>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-red-600 font-bold">
                  This action is final and cannot be undone. All your data will be permanently erased.
                </p>
              </div>
              <Button
                onClick={() => { setDeleteText(""); setDeleteModalOpen(true); }}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold shadow-md shrink-0 w-full md:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-10 border border-slate-100"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-center text-slate-900 mb-2">Delete Account</h3>
              <p className="text-slate-500 text-sm text-center mb-6 font-medium leading-relaxed">
                This will delete all your user data from the database and Cloudinary. 
                Type <strong className="text-red-600">DELETE</strong> to confirm.
              </p>

              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-center font-bold mb-6"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-6">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 font-bold">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold text-slate-600" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={deleteText !== "DELETE" || isPending}
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold shadow-md"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
