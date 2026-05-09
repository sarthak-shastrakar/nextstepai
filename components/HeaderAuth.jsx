"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  LayoutDashboard, LineChart, FileText, NotebookPen,
  GraduationCap, Briefcase, Bell, User, Settings,
  LogOut, ChevronDown, Menu, X, ArrowRight, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/actions/notifications";

export default function HeaderAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;
  const [isMounted, setIsMounted] = useState(false);

  // Dropdown states
  const [isCareerBoostOpen, setIsCareerBoostOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const showPremiumToast = (title, message) => {
    toast.custom((t) => (
      <div className="flex items-start gap-4 p-4 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] w-[360px]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
          {title.toLowerCase().includes("success") || title.toLowerCase().includes("complete") ? "🚀" : <Bell className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 pt-0.5">
          <h4 className="font-extrabold text-slate-900 text-[15px] leading-tight">{title}</h4>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{message}</p>
        </div>
        <button onClick={() => toast.dismiss(t)} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    ), { duration: 4000 });
  };

  const notifiedIdsRef = useRef(new Set());

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    const res = await getNotifications();
    if (res.success) {
      const newNotifs = res.notifications;
      
      newNotifs.forEach(n => {
        // Only process notifications we haven't seen yet in this session
        if (!notifiedIdsRef.current.has(n._id)) {
           notifiedIdsRef.current.add(n._id);
           
           // Show toast only if notification is recent (created within last 15 seconds)
           // This handles redirects where OneSignal foreground event might miss the push
           const isRecent = (Date.now() - new Date(n.createdAt).getTime()) < 15000;
           if (isRecent) {
             showPremiumToast(n.title, n.message);
           }
        }
      });

      setNotifications(newNotifs);
    }
  };

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      
      if (typeof window !== "undefined") {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function(OneSignal) {
          OneSignal.Notifications.addEventListener('foregroundWillDisplay', function(event) {
            event.preventDefault(); // Prevent native browser push if supported, show in-app toast instead
            const notif = event.notification;
            showPremiumToast(notif.title, notif.body);
            // Immediately fetch notifications to update the dropdown bell
            fetchNotifications();
          });
        });
      }
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nav-dropdown")) {
        setIsCareerBoostOpen(false);
        setIsAvatarOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || status === "loading") return null;

  const handleNotificationClick = async (notification) => {
    setIsNotificationsOpen(false);
    if (!notification.isRead) {
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
      await markAsRead(notification._id);
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    
    try {
      const res = await deleteNotification(notificationId);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete");
      }
      // User requested not to show this success toast
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete notification");
      setNotifications(previousNotifications); // Revert
    }
  };

  const careerBoostItems = [
    { href: "/resume", icon: FileText, title: "Resume Builder", desc: "Build ATS-optimized resume" },
    { href: "/cover-letter", icon: NotebookPen, title: "Cover Letter", desc: "Generate tailored letters" },
    { href: "/interviewprep", icon: GraduationCap, title: "Interview Prep", desc: "Practice mock interviews" },
    { href: "/job-finding", icon: Briefcase, title: "Explore Jobs", desc: "Discover matching jobs" },
  ];

  // ── User Avatar Component
  const UserAvatar = ({ size = 36 }) => {
    const user = session?.user;
    if (user?.image) {
      return <img src={user.image} alt={user.name || "User"} className="rounded-full border border-indigo-100 object-cover bg-white" style={{ width: size, height: size }} />;
    }
    return (
      <div className="rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ width: size, height: size }}>
        {user?.name?.[0]?.toUpperCase() || "U"}
      </div>
    );
  };

  return (
    <div className="flex items-center flex-1 justify-end lg:justify-between ml-8">
      {/* ── DESKTOP MIDDLE NAV ──────────────────────── */}
      <div className="hidden lg:flex items-center gap-2">
        {isLoggedIn && (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <LineChart className="w-4 h-4" /> Industry Insight
            </Link>

            {/* Career Boost Dropdown */}
            <div className="relative nav-dropdown z-50">
              <button
                onClick={(e) => { e.stopPropagation(); setIsCareerBoostOpen(!isCareerBoostOpen); setIsAvatarOpen(false); setIsNotificationsOpen(false); }}
                className={cn("flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer", isCareerBoostOpen ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50")}
              >
                Career Boost <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isCareerBoostOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {isCareerBoostOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[340px] bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-2 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {careerBoostItems.map((item, i) => (
                        <Link key={i} href={item.href} onClick={() => setIsCareerBoostOpen(false)} className="flex items-start gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors shrink-0"><item.icon className="w-5 h-5" /></div>
                          <div><p className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</p><p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{item.desc}</p></div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* ── DESKTOP RIGHT NAV ──────────────────────── */}
      <div className="hidden lg:flex items-center gap-4 ml-auto">
        {isLoggedIn ? (
          <>
            {/* Notification Bell Dropdown */}
            <div className="relative nav-dropdown z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(!isNotificationsOpen); setIsAvatarOpen(false); setIsCareerBoostOpen(false); }}
                className={cn("relative p-2 rounded-full transition-colors cursor-pointer", isNotificationsOpen ? "bg-indigo-100 text-indigo-700" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50")}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="font-extrabold text-sm text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto hide-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => handleNotificationClick(notif)}
                              className={cn("p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 relative", !notif.isRead && "bg-indigo-50/30")}
                            >
                              {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-lg shadow-inner">
                                {notif.title.includes('Welcome') ? '🎉' : notif.title.includes('Complete') ? '🚀' : '🔔'}
                              </div>
                              <div className="flex-1 pr-6 relative">
                                <p className={cn("text-sm", !notif.isRead ? "font-extrabold text-slate-900" : "font-semibold text-slate-700")}>{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                                <button 
                                  onClick={(e) => handleDeleteNotification(e, notif._id)}
                                  className="absolute top-0 right-0 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete notification"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar Dropdown */}
            <div className="relative nav-dropdown z-50">
              <button onClick={(e) => { e.stopPropagation(); setIsAvatarOpen(!isAvatarOpen); setIsCareerBoostOpen(false); setIsNotificationsOpen(false); }} className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                <UserAvatar size={36} /> <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <AnimatePresence>
                {isAvatarOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2">
                    <div className="px-3 py-3 border-b border-slate-100 mb-2"><p className="font-bold text-sm text-slate-900 truncate">{session.user.name}</p><p className="text-xs text-slate-500 truncate">{session.user.email}</p></div>
                    <Link href="/profile" onClick={() => setIsAvatarOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"><User className="w-4 h-4" /> Profile</Link>
                    <Link href="/settings" onClick={() => setIsAvatarOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"><Settings className="w-4 h-4" /> Settings</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 cursor-pointer"><LogOut className="w-4 h-4" /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <Link href="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">Sign In</Link>
        )}
      </div>

      {/* ── MOBILE TOGGLE ──────────────────────────── */}
      <div className="lg:hidden flex items-center gap-3 ml-auto">
        {isLoggedIn && <UserAvatar size={32} />}
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"><Menu className="w-6 h-6" /></button>
      </div>

      {/* ── MOBILE DRAWER ──────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[360px] bg-white shadow-2xl border-l border-slate-100 z-[100] flex flex-col lg:hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100"><span className="font-extrabold text-slate-900">CareerForge Menu</span><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"><X className="w-4 h-4" /></button></div>
              <div className="flex-1 overflow-y-auto p-5">
                {isLoggedIn ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">Navigation</p>
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold transition-colors"><LineChart className="w-5 h-5" /> Industry Insight</Link>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">Career Boost</p>
                      {careerBoostItems.map((item, i) => (
                        <Link key={i} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 group transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors"><item.icon className="w-4 h-4" /></div>
                          <div><p className="font-bold text-sm text-slate-800 group-hover:text-indigo-600">{item.title}</p></div>
                        </Link>
                      ))}
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">Account</p>
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors"><User className="w-5 h-5" /> Profile</Link>
                      <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors"><Settings className="w-5 h-5" /> Settings</Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center"><User className="w-8 h-8 text-indigo-600" /></div>
                    <div className="text-center"><p className="font-extrabold text-xl text-slate-900 mb-2">Welcome to CareerForge</p><p className="text-sm text-slate-500 px-4">Sign in to unlock AI-powered career growth tools.</p></div>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full mt-4"><button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-transform">Sign In Now</button></Link>
                  </div>
                )}
              </div>
              {isLoggedIn && (
                <div className="p-5 border-t border-slate-100 bg-slate-50">
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
