"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Linkedin, 
  Github, 
  Briefcase, 
  Mail, 
  Phone 
} from "lucide-react";

export default function Footer() {
  const socialLinks = {
    linkedin: "http://www.linkedin.com/in/sarthak-fullstack-developer",
    github: "https://github.com/sarthak-shastrakar",
    portfolio: "https://sarthak-shastrakar.github.io/Portfolio",
    email: "mailto:sarthakshastrakar9@gmail.com"
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="relative w-full bg-white">
      {/* Subtle top border (indigo gradient line) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#4f46e5]/40 to-transparent" />

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="container mx-auto px-4 max-w-7xl pt-16 pb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          {/* ── Brand Section ── */}
          <motion.div variants={fadeUpVariant} className="space-y-6 lg:col-span-2">
            <Link href="/" className="flex flex-col justify-center inline-block w-max">
              <div className="flex items-start gap-0.5">
                <span className="text-[#0f172a] font-extrabold text-2xl leading-none tracking-tight">
                  CareerForge
                </span>
                <span className="text-[#4f46e5] font-black text-xs leading-none uppercase tracking-wider relative -top-0.5">
                  AI
                </span>
              </div>
            </Link>
            <p className="text-[#64748b] leading-relaxed text-sm max-w-[320px]">
              Empowering professionals to achieve their true potential through advanced AI guidance, skill building, and interview intelligence.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <Link href={socialLinks.linkedin} target="_blank" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#4f46e5] hover:border-[#4f46e5] transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href={socialLinks.github} target="_blank" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#4f46e5] hover:border-[#4f46e5] transition-all duration-300">
                <Github className="w-4 h-4" />
              </Link>
              <Link href={socialLinks.portfolio} target="_blank" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#4f46e5] hover:border-[#4f46e5] transition-all duration-300">
                <Briefcase className="w-4 h-4" />
              </Link>
              <Link href={socialLinks.email} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#4f46e5] hover:border-[#4f46e5] transition-all duration-300">
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* ── Explore Column ── */}
          <motion.div variants={fadeUpVariant}>
            <h4 className="font-bold text-[#0f172a] text-sm uppercase tracking-wider mb-5">Explore</h4>
            <ul className="space-y-3.5 text-sm font-medium">
              {[["Dashboard", "/dashboard"], ["Resume Builder", "/resume"], ["Interview Prep", "/interviewprep"], ["Job Search", "/job-finding"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[#64748b] hover:text-[#4f46e5] transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Company Column ── */}
          <motion.div variants={fadeUpVariant}>
            <h4 className="font-bold text-[#0f172a] text-sm uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3.5 text-sm font-medium">
              {["About Us", "Privacy Policy", "Terms of Service"].map(label => (
                <li key={label}>
                  <Link href="#" className="text-[#64748b] hover:text-[#4f46e5] transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Contact Column ── */}
          <motion.div variants={fadeUpVariant}>
            <h4 className="font-bold text-[#0f172a] text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4 text-sm font-medium text-[#64748b]">
              <li>
                <Link href={socialLinks.email} className="flex items-center gap-3 hover:text-[#4f46e5] transition-colors duration-200 group">
                  <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors duration-200" />
                  <span>sarthakshastrakar9@gmail.com</span>
                </Link>
              </li>
              <li>
                <Link href="tel:+918767901968" className="flex items-center gap-3 hover:text-[#4f46e5] transition-colors duration-200 group">
                  <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors duration-200" />
                  <span>+91 8767901968</span>
                </Link>
              </li>
              <li>
                <Link href={socialLinks.portfolio} target="_blank" className="flex items-center gap-3 hover:text-[#4f46e5] transition-colors duration-200 group">
                  <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors duration-200" />
                  <span>Portfolio</span>
                </Link>
              </li>
              <li>
                <Link href={socialLinks.linkedin} target="_blank" className="flex items-center gap-3 hover:text-[#4f46e5] transition-colors duration-200 group">
                  <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors duration-200" />
                  <span>LinkedIn</span>
                </Link>
              </li>
              <li>
                <Link href={socialLinks.github} target="_blank" className="flex items-center gap-3 hover:text-[#4f46e5] transition-colors duration-200 group">
                  <Github className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors duration-200" />
                  <span>GitHub</span>
                </Link>
              </li>
            </ul>
          </motion.div>

        </div>

        {/* ── Bottom Bar ── */}
        <motion.div variants={fadeUpVariant} className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-[#64748b]">
          <p>© 2026 CareerForge AI. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
