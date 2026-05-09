"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import HeaderAuth from "./HeaderAuth";
import { cn } from "@/lib/utils";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Check on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] py-2"
          : "bg-transparent border-b border-transparent py-4"
      )}
    >
      <nav className="container mx-auto px-4 flex items-center justify-between max-w-7xl">
        {/* ── LEFT SIDE (LOGO) ──────────────────────── */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {/* Logo Circle */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] transition-transform duration-300 group-hover:scale-105 shadow-md shadow-indigo-600/20">
            <div className="flex items-center justify-center w-full h-full bg-white rounded-full">
              <span className="text-indigo-600 font-black text-sm tracking-tighter">
                CF
              </span>
            </div>
          </div>

          {/* Logo Text */}
          <div className="flex flex-col justify-center">
            <div className="flex items-start gap-0.5">
              <span className="text-indigo-900 font-extrabold text-xl leading-none tracking-tight">
                CareerForge
              </span>
              <span className="text-purple-600 font-black text-[10px] leading-none uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-[0.2em] leading-none mt-1">
              POWERED BY AI
            </span>
          </div>
        </Link>

        {/* ── MIDDLE & RIGHT SIDE (HeaderAuth) ──────────────────────── */}
        <HeaderAuth />
      </nav>
    </header>
  );
};

export default Header;
