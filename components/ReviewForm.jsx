"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { addReview } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select at least 1 star").max(5),
  content: z.string().min(1, "Review cannot be empty").max(500, "Review must be less than 500 characters"),
});

const ReviewForm = ({ onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addReview(data.rating, data.content);
      toast.success("Review submitted successfully");
      reset();
      setRating(0);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (value) => {
    setRating(value);
    setValue("rating", value, { shouldValidate: true });
  };

  return (
    <div className="relative">
      <Card className="card-premium overflow-hidden border-none bg-white relative group shadow-none rounded-[2rem]">
        <CardHeader className="pt-6 px-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Share Your Experience
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 px-6 pb-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Rating
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-all duration-300 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-xs text-rose-500">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Your Story
              </label>
              <Textarea
                {...register("content")}
                placeholder="How has NextStep AI helped you?"
                className="min-h-[160px] rounded-[1.5rem] p-6 text-base"
              />
              {errors.content && (
                <p className="text-xs text-rose-500">
                  {errors.content.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="py-6 px-6 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl h-12 px-10 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Review
                  <Send className="ml-3 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ReviewForm;
