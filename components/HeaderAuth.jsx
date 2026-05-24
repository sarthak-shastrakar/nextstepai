"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart, FileText, NotebookPen, GraduationCap, Briefcase,
  Bell, User, Settings, LogOut, ChevronDown, Menu, X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/actions/notifications";

export default function HeaderAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;
  const [isMounted, setIsMounted] = useState(false);

  // Dropdown & Menu states
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
          {title.toLowerCase().includes("success") || title.toLowerCase().includes("complete") ? "🚀" : <Bell className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 pt-0.5">
          <h4 className="font-extrabold text-[#0f172a] text-[15px] leading-tight">{title}</h4>
          <p className="text-[13px] text-[#64748b] mt-1.5 leading-relaxed">{message}</p>
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
        if (!notifiedIdsRef.current.has(n._id)) {
          notifiedIdsRef.current.add(n._id);
          const isRecent = (Date.now() - new Date(n.createdAt).getTime()) < 15000;
          if (isRecent) {
            showPremiumToast(n.title, n.message);
          }
        }
      });
      setNotifications(newNotifs);
    }
  };

  // Poll notifications
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);

      if (typeof window !== "undefined") {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function (OneSignal) {
          OneSignal.Notifications.addEventListener('foregroundWillDisplay', function (event) {
            event.preventDefault();
            const notif = event.notification;
            showPremiumToast(notif.title, notif.body);
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
      setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
      await markAsRead(notification._id);
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    try {
      const res = await deleteNotification(notificationId);
      if (!res.success) throw new Error(res.message || "Failed to delete");
    } catch (error) {
      toast.error("Failed to delete notification");
      setNotifications(previousNotifications);
    }
  };

  const careerBoostItems = [
    { href: "/resume", icon: FileText, title: "Resume Builder", desc: "Build ATS-optimized resume" },
    { href: "/cover-letter", icon: NotebookPen, title: "Cover Letter", desc: "Generate tailored letters" },
    { href: "/interviewprep", icon: GraduationCap, title: "Interview Prep", desc: "Practice mock interviews" },
    { href: "/job-finding", icon: Briefcase, title: "Explore Jobs", desc: "Discover matching jobs" },
  ];

  const UserAvatar = ({ size = 36 }) => {
    const user = session?.user;
    if (user?.image) {
      return <img src={user.image} alt={user.name || "User"} className="rounded-full object-cover bg-white" style={{ width: size, height: size }} />;
    }
    return (
      <div className="rounded-full bg-[#4f46e5] flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ width: size, height: size }}>
        {user?.name?.[0]?.toUpperCase() || "U"}
      </div>
    );
  };

  // NavLink Component for active/hover states
  const NavLink = ({ href, icon: Icon, children }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className="relative group flex items-center gap-2 px-3 py-2">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-sm font-medium transition-colors duration-200">
          {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-[#4f46e5]" : "text-[#64748b] group-hover:text-[#4f46e5]")} />}
          <span className={cn(isActive ? "text-[#4f46e5] font-bold" : "text-[#0f172a] group-hover:text-[#4f46e5]")}>
            {children}
          </span>
        </motion.div>
        {/* Active/Hover Underline */}
        <div className={cn("absolute bottom-0 left-0 h-0.5 bg-[#4f46e5] transition-all duration-300 ease-out", isActive ? "w-full" : "w-0 group-hover:w-full")} />
      </Link>
    );
  };

  return (
    <div className="flex flex-1 items-center justify-end lg:justify-between ml-8">
      {/* ── MIDDLE NAV ──────────────────────── */}
      <div className="hidden lg:flex items-center gap-6">
        {isLoggedIn && (
          <>
            <NavLink href="/dashboard" icon={LineChart}>
              Industry Insight
            </NavLink>

            <div className="relative nav-dropdown">
              <button
                onClick={(e) => { e.stopPropagation(); setIsCareerBoostOpen(!isCareerBoostOpen); setIsAvatarOpen(false); setIsNotificationsOpen(false); }}
                className="relative group flex items-center gap-1.5 px-3 py-2 cursor-pointer outline-none"
              >
                <motion.div whileHover={{ scale: 1.05 }} className={cn("flex items-center gap-1.5 text-sm transition-colors duration-200", isCareerBoostOpen ? "text-[#4f46e5] font-bold" : "text-[#0f172a] font-medium group-hover:text-[#4f46e5]")}>
                  Career Boost
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isCareerBoostOpen ? "rotate-180 text-[#4f46e5]" : "text-[#64748b] group-hover:text-[#4f46e5]")} />
                </motion.div>
                {/* Background highlight on open */}
                {isCareerBoostOpen && <div className="absolute inset-0 bg-[#4f46e5]/5 rounded-lg -z-10" />}
              </button>

              <AnimatePresence>
                {isCareerBoostOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[300px] bg-white/90 backdrop-blur-xl border border-[rgba(0,0,0,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-2xl p-2 z-50"
                  >
                    <div className="flex flex-col gap-1">
                      {careerBoostItems.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => setIsCareerBoostOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f8fafc] transition-colors duration-200 group"
                        >
                          <div className="mt-0.5 text-[#64748b] group-hover:text-[#4f46e5] transition-colors duration-200">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#0f172a] group-hover:text-[#4f46e5] transition-colors duration-200">{item.title}</p>
                            <p className="text-[12px] text-[#64748b] mt-0.5 leading-tight">{item.desc}</p>
                          </div>
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

      {/* ── RIGHT NAV ──────────────────────── */}
      <div className="hidden lg:flex items-center gap-5 ml-auto">
        {isLoggedIn ? (
          <>
            {/* Notification Bell */}
            <div className="relative nav-dropdown">
              <button
                onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(!isNotificationsOpen); setIsAvatarOpen(false); setIsCareerBoostOpen(false); }}
                className={cn("relative p-2 rounded-full transition-colors duration-200 cursor-pointer outline-none hover:bg-[#f8fafc]", isNotificationsOpen ? "bg-[#f8fafc] text-[#4f46e5]" : "text-[#64748b] hover:text-[#4f46e5]")}
              >
                <div className="relative">
                  <Bell className="w-[22px] h-[22px]" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                      {/* Animated Ring */}
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping opacity-75" />
                    </>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[calc(100%+0.5rem)] right-0 w-[340px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden flex flex-col z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-sm text-[#0f172a]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[11px] font-semibold text-[#4f46e5] hover:text-[#7c3aed] flex items-center gap-1 transition-colors">
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto hide-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[#64748b]">
                          <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">No new notifications</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={cn("p-4 border-b border-slate-50 cursor-pointer hover:bg-[#f8fafc] transition-colors flex items-start gap-3 relative group", !notif.isRead && "bg-indigo-50/20")}
                            >
                              {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4f46e5]" />}
                              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-lg shadow-sm border border-indigo-100/50">
                                {notif.title.includes('Welcome') ? '🎉' : notif.title.includes('Complete') ? '🚀' : '🔔'}
                              </div>
                              <div className="flex-1 pr-6 relative">
                                <p className={cn("text-sm", !notif.isRead ? "font-bold text-[#0f172a]" : "font-medium text-[#0f172a]")}>{notif.title}</p>
                                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{notif.message}</p>
                                <p className="text-[11px] font-semibold text-slate-400 mt-2">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                                <button
                                  onClick={(e) => handleDeleteNotification(e, notif._id)}
                                  className="absolute top-0 right-0 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-4 h-4" />
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

            {/* User Avatar */}
            <div className="relative nav-dropdown">
              <button
                onClick={(e) => { e.stopPropagation(); setIsAvatarOpen(!isAvatarOpen); setIsCareerBoostOpen(false); setIsNotificationsOpen(false); }}
                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-[#f8fafc] transition-colors cursor-pointer border border-transparent hover:border-slate-200 outline-none"
              >
                <UserAvatar size={36} />
                <ChevronDown className="w-4 h-4 text-[#64748b]" />
              </button>

              <AnimatePresence>
                {isAvatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[calc(100%+0.5rem)] right-0 w-60 bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-2xl p-2 z-50"
                  >
                    <div className="px-3 py-3 border-b border-slate-100 mb-2">
                      <p className="font-bold text-sm text-[#0f172a] truncate">{session.user.name}</p>
                      <p className="text-xs text-[#64748b] truncate mt-0.5">{session.user.email}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link href="/profile" onClick={() => setIsAvatarOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0f172a] hover:text-[#4f46e5] hover:bg-[#f8fafc] rounded-xl transition-colors">
                        <User className="w-4 h-4 text-[#64748b]" /> View Profile
                      </Link>
                      <Link href="/settings" onClick={() => setIsAvatarOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#0f172a] hover:text-[#4f46e5] hover:bg-[#f8fafc] rounded-xl transition-colors">
                        <Settings className="w-4 h-4 text-[#64748b]" /> Settings
                      </Link>
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-left">
                        <LogOut className="w-4 h-4 text-red-500" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all"
            >
              Sign In
            </motion.button>
          </Link>
        )}
      </div>

      {/* ── MOBILE TOGGLE ──────────────────────────── */}
      <div className="lg:hidden flex items-center gap-4 ml-auto">
        {isLoggedIn && <UserAvatar size={32} />}
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-[#0f172a] hover:bg-[#f8fafc] rounded-xl transition-colors outline-none">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ── MOBILE DRAWER ──────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[360px] bg-white shadow-2xl z-[100] flex flex-col lg:hidden overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <span className="font-bold text-lg text-[#0f172a]">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 text-[#64748b] rounded-full hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                {isLoggedIn ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider pl-2 mb-2">Navigation</p>
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors font-semibold", pathname === '/dashboard' ? "bg-indigo-50 text-[#4f46e5]" : "text-[#0f172a] hover:bg-[#f8fafc]")}>
                        <LineChart className="w-5 h-5" /> Industry Insight
                      </Link>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider pl-2 mb-2">Career Boost</p>
                      {careerBoostItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={i} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors group", isActive ? "bg-indigo-50 text-[#4f46e5]" : "hover:bg-[#f8fafc]")}>
                            <div className={cn("flex items-center justify-center transition-colors", isActive ? "text-[#4f46e5]" : "text-[#64748b] group-hover:text-[#4f46e5]")}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={cn("font-semibold text-sm transition-colors", isActive ? "text-[#4f46e5]" : "text-[#0f172a] group-hover:text-[#4f46e5]")}>{item.title}</p>
                              <p className="text-[12px] text-[#64748b]">{item.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider pl-2 mb-2">Account</p>
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors font-semibold", pathname === '/profile' ? "bg-indigo-50 text-[#4f46e5]" : "text-[#0f172a] hover:bg-[#f8fafc]")}>
                        <User className="w-5 h-5" /> View Profile
                      </Link>
                      <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors font-semibold", pathname === '/settings' ? "bg-indigo-50 text-[#4f46e5]" : "text-[#0f172a] hover:bg-[#f8fafc]")}>
                        <Settings className="w-5 h-5" /> Settings
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                      <User className="w-8 h-8 text-[#4f46e5]" />
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-xl text-[#0f172a] mb-2">CareerForge</p>
                      <p className="text-sm text-[#64748b] px-4">Sign in to unlock AI-powered tools.</p>
                    </div>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full mt-4">
                      <button className="w-full py-3.5 bg-[#4f46e5] text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform">
                        Sign In Now
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <div className="p-5 border-t border-slate-100 bg-slate-50">
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-colors">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
