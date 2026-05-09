"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Trash2, Loader2, Star, Quote, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ── Review Card ─────────────────────────────────────────────
export const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const isOwner = !!(currentUserId && review.userId && review.userId === currentUserId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(review.id);
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Failed to delete review");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const ratingColor = review.rating >= 4 ? "amber" : review.rating === 3 ? "orange" : "red";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative flex-shrink-0 w-[320px] md:w-[400px] group"
    >
      {/* Glow behind the card */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 scale-95" />

      <div className="relative bg-white border border-slate-100/80 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] group-hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] transition-all duration-500 overflow-hidden">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

        <div className="p-6 md:p-8 flex flex-col gap-5">

          {/* ── Header: Stars + Badge/Delete ── */}
          <div className="flex items-center justify-between">
            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 400 }}
                >
                  <Star
                    className={`h-4 w-4 transition-all ${
                      i < (review.rating || 5)
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                        : "fill-slate-100 text-slate-100"
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Owner: show delete, Others: show verified badge */}
            {isOwner ? (
              <AnimatePresence mode="wait">
                {showConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-[10px] font-black text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Confirm
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="delete-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all text-[10px] font-bold"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </motion.button>
                )}
              </AnimatePresence>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Verified</span>
              </div>
            )}
          </div>

          {/* ── Quote ── */}
          <div className="relative">
            <p className="text-slate-700 text-sm md:text-base font-semibold leading-relaxed italic line-clamp-4">
              {review.quote}
            </p>
          </div>

          {/* ── Author Row ── */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-50 mt-auto">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <img
                src={review.image}
                alt={review.author}
                className="relative w-11 h-11 rounded-full border-2 border-white shadow-md object-cover"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(review.author)}&backgroundColor=6366f1`;
                }}
              />
            </div>

            {/* Name + Meta */}
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-slate-900 text-sm truncate tracking-tight">
                {review.author}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider truncate">
                  {review.role}
                </span>
                {review.date && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      <Calendar className="h-2.5 w-2.5" />
                      {review.date}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Sparkle for owner's card */}
            {isOwner && (
              <div title="Your review" className="shrink-0">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Single-Row Marquee ──────────────────────────────────────
const ReviewGrid = ({ reviews, currentUserId, onDelete }) => {
  const [paused, setPaused] = React.useState(false);
  if (!reviews || reviews.length === 0) return null;

  const isSingle = reviews.length === 1;
  const items = isSingle ? reviews : [...reviews, ...reviews];

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Gradient overlays */}
      {!isSingle && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
        </>
      )}

      <div
        className={`flex gap-6 md:gap-8 ${isSingle ? "justify-center" : "animate-marquee"}`}
        style={{
          width: isSingle ? "100%" : "max-content",
          animationPlayState: paused ? "paused" : "running",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {items.map((review, index) => (
          <ReviewCard
            key={`${review.id}-${index}`}
            review={review}
            currentUserId={currentUserId}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewGrid;

