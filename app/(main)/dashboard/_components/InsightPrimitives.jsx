"use client";
import { useState, useEffect, useRef } from "react";

// Animated counter
export function AnimatedCount({ value, duration = 1200, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const num = parseFloat(value) || 0;
    start.current = null;
    const step = (ts) => {
      if (!start.current) start.current = ts;
      const pct = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setDisplay(+(num * eased).toFixed(1));
      if (pct < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display}{suffix}</>;
}

// Readiness gauge
export function ReadinessGauge({ score, color }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
    return () => clearTimeout(timer);
  }, [score, circ]);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="#E2E8F0" strokeWidth="10" fill="transparent" />
        <circle
          cx="60" cy="60" r={r}
          stroke={color} strokeWidth="10" fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">/100</span>
      </div>
    </div>
  );
}

// Simple animated bar
export function AnimatedBar({ pct, color = "#4F46E5" }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}
