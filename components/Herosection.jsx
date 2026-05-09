"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Download, Star, Users, Zap, Award } from "lucide-react";
import Link from "next/link";
import DashboardMockup from "./DashboardMockup";
import { motion, useInView, useAnimation, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

const Herosection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();
  const [isMobile, setIsMobile] = useState(true);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Scroll Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Check if mobile to disable 3D/parallax
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const springConfig = { stiffness: 150, damping: 20 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  // Tilted 3D perspective
  // If not mobile, rotate max 15deg
  const rotateX = useTransform(ySpring, [-500, 500], [15, -15]);
  const rotateY = useTransform(xSpring, [-500, 500], [-15, 15]);

  // Floating elements move in opposite direction for depth effect
  const floatX = useTransform(xSpring, [-500, 500], [30, -30]);
  const floatY = useTransform(ySpring, [-500, 500], [30, -30]);

  // Scroll effect (moves up slightly on scroll)
  const yScroll = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }

    const handleMouseMove = (e) => {
      if (isMobile) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX - innerWidth / 2);
      mouseY.set(clientY - innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isInView, controls, mouseX, mouseY, isMobile]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative w-full py-20 md:py-36 px-4 overflow-hidden bg-gradient-to-b from-[#FAFBFC] via-[#F1F5FF] to-[#FAFBFC]">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[700px] h-[700px] rounded-full bg-indigo-500/15 blur-[120px] -z-10 animate-mesh" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[150px] -z-10" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02] -z-10" />

      <div className="container mx-auto max-w-7xl" ref={containerRef}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-8 md:space-y-10"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-full bg-white border border-border/60 shadow-sm text-indigo-600 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              The Future of Career Growth
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="space-y-4 md:space-y-6 max-w-5xl mx-auto px-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] leading-[1.1] md:leading-[0.95] text-slate-900">
              Elevate Your Career with
              <span className="block mt-2 md:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                CareerForge
              </span>
            </h1>

            <p className="mx-auto max-w-[720px] text-base md:text-xl text-slate-500 leading-relaxed tracking-tight px-4 font-medium">
              Master your industry with AI-driven insights, personalized resume
              building, and real-world interview preparation tailored for the
              modern professional.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex justify-center w-full pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto z-20 relative">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)] h-14 px-10 text-lg font-bold rounded-2xl cursor-pointer w-full sm:w-auto transition-all"
                >
                  Start Journey Free
                  <ArrowRight className="ml-2.5 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Hero Image / 3D Dashboard Container */}
          <div className="relative w-full max-w-5xl mx-auto mt-16 md:mt-24 perspective-[2000px] z-10">
            {/* Scroll translateY wrap */}
            <motion.div style={{ y: yScroll }}>
              <motion.div
                initial={{ opacity: 0, y: 100, rotateX: 15, rotateY: -10 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: isMobile ? 0 : 0, 
                    rotateY: isMobile ? 0 : 0,
                    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
                  },
                }}
                style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full group"
              >
                {/* Dashboard Card */}
                <div className="relative z-10 rounded-[1.25rem] bg-white p-1 border border-slate-200/50 shadow-[0_40px_100px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,1)]">
                   <DashboardMockup />
                </div>

                {/* Soft glow behind dashboard */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl -z-10 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* FLOATING ELEMENTS (Only visible on desktop/tablet) */}
                {!isMobile && (
                  <>
                    {/* Top Left: Resume Score */}
                    <motion.div
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{ x: floatX, y: floatY, translateZ: 50 }}
                      className="absolute -top-12 -left-16 z-20 bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl flex items-center gap-4"
                    >
                      <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🎯 Resume Score</p>
                        <p className="font-extrabold text-slate-800 text-sm">85% ATS Optimized</p>
                      </div>
                    </motion.div>

                    {/* Top Right: AI Powered */}
                    <motion.div
                      animate={{ x: [0, 15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      style={{ x: floatX, y: floatY, translateZ: 80 }}
                      className="absolute -top-8 -right-12 z-20 bg-gradient-to-br from-indigo-600 to-purple-600 p-[1px] rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                    >
                      <div className="bg-white px-5 py-3 rounded-[15px] flex items-center gap-3">
                        <div className="text-purple-600">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">⚡ AI Powered</p>
                          <p className="font-extrabold text-slate-800 text-sm">AI Engine</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bottom Left: Resume Ready */}
                    <motion.div
                      animate={{ y: [0, 15, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      style={{ x: floatX, y: floatY, translateZ: 60 }}
                      className="absolute -bottom-8 -left-10 z-20 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100"
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">📄 Download Formats</p>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 rounded-lg px-2.5 py-1 text-[11px] font-extrabold">PDF</span>
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg px-2.5 py-1 text-[11px] font-extrabold">DOCX</span>
                        <span className="flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg px-2.5 py-1 text-[11px] font-extrabold">TXT</span>
                      </div>
                    </motion.div>

                    {/* Bottom Right: Interview Score */}
                    <motion.div
                      animate={{ x: [0, -15, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      style={{ x: floatX, y: floatY, translateZ: 90 }}
                      className="absolute bottom-12 -right-16 z-30 bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4"
                    >
                      <div className="bg-yellow-500/20 p-2.5 rounded-full text-yellow-400">
                        <Star className="w-5 h-5 fill-yellow-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🎤 Interview Score</p>
                        <p className="font-extrabold text-white text-sm">92% — Excellent!</p>
                      </div>
                    </motion.div>



                    {/* Right Pill: Success */}
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                      style={{ translateZ: 30 }}
                      className="absolute top-1/3 -right-20 z-0 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm border border-emerald-200"
                    >
                      <Award className="w-4 h-4" />
                      95% Success Rate
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Herosection;
