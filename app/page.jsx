"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Star } from "lucide-react";
import Herosection from "@/components/Herosection";
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { getReviews, deleteReview } from "@/actions/review";
import MarqueeReviews from "@/components/MarqueeReviews";
import { Loader2, Send, Quote, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import ReviewForm from "@/components/ReviewForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CountUp = ({ to, suffix = "", duration = 2 }) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration });
      return controls.stop;
    }
  }, [isInView, count, to, duration]);

  return <motion.span ref={nodeRef}>{rounded}</motion.span>;
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function Home() {
  const { data: session } = useSession();
  const [reviews, setReviews] = React.useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = React.useState(true);

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const fetchedReviews = await getReviews();
      if (fetchedReviews && fetchedReviews.length > 0) {
        const formattedReviews = fetchedReviews.map((r) => ({
          id: r.id,
          userId: r.user?.id || null,
          quote: r.content,
          author: r.user?.name || "Anonymous",
          image: r.user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.user?.name || "A")}&backgroundColor=6366f1`,
          role: r.user?.industry || "Professional",
          date: format(new Date(r.createdAt), "MMM d, yyyy"),
          rating: r.rating,
        }));
        setReviews(formattedReviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]); 
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      await fetchReviews();
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Herosection />

      {/* ═══ Stats Section ═══════════════════════════════ */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="w-full py-16 bg-white border-y border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-5xl mx-auto">
            {[
              { value: 25, suffix: "+", label: "Industries" },
              { value: 1000, suffix: "+", label: "Questions" },
              { value: 95, suffix: "%", label: "Success Rate" },
              { value: 24, suffix: "/7", label: "AI Support" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center space-y-1 text-center">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-title tracking-tighter">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] px-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ Features Section ═══════════════════════════════ */}
      <section className="w-full py-24 md:py-32 section-primary relative">
        {/* Decorative blob */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] blob-primary rounded-full -z-10" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4 md:space-y-5 px-4"
          >
            <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full">
              Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-tight">
              Smarter tools for the <br className="hidden md:block" /> modern career.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              A comprehensive suite of AI agents designed to navigate every stage of your professional journey.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeIn} whileHover={{ y: -6 }} className="transition-all duration-300">
                <Card className="card-premium group h-full p-1">
                  <CardContent className="p-7 flex flex-col items-start text-left h-full">
                    <div className="feature-icon-box mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Steps / How It Works Section ═══════════════ */}
      <section className="w-full py-24 md:py-32 section-alt">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4 md:space-y-5 px-4"
          >
            <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full">
              Methodology
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-tight">How it works.</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              A streamlined four-step process to accelerate your professional growth.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto relative"
          >
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[60px] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />
            
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center space-y-6 relative z-10"
              >
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    className="w-[88px] h-[88px] rounded-3xl bg-white border border-border/60 flex items-center justify-center text-primary shadow-sm transition-all duration-400"
                  >
                    {item.icon}
                  </motion.div>
                  <div className="step-number absolute -top-2 -right-2">
                    {index + 1}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-foreground tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-[260px] mx-auto text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Testimonials Section ═══════════════════════ */}
      <section className="w-full py-32 section-primary relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto mb-10 md:mb-20 space-y-5 md:space-y-6 px-4"
          >
            <div className="flex justify-center mb-2 md:mb-4">
              <Badge variant="outline" className="px-6 py-2 border-primary/20 text-primary bg-primary/5 font-black tracking-[0.2em] uppercase text-[10px] rounded-full shadow-sm">
                Industry Proof
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.1]">
              Engineered for <br className="hidden sm:block"/> <span className="gradient-primary">Real Career Shifts.</span>
            </h2>
            <p className="text-slate-500 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who have redefined their career narratives using our strategic AI platform.
            </p>
          </motion.div>

          <div className="relative -mx-4 md:-mx-10 min-h-[300px] flex items-center justify-center">
            {isLoadingReviews ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Legacy...</p>
              </div>
            ) : reviews.length > 0 ? (
              <MarqueeReviews 
                reviews={reviews} 
                currentUserId={session?.user?.id} 
                onDelete={handleDeleteReview}
              />
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] w-full max-w-2xl mx-auto bg-white">
                 <Quote className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for the first success story.</p>
              </div>
            )}
          </div>

          <div className="mt-24 max-w-5xl mx-auto relative px-4 flex flex-col items-center">
            {session?.user ? (
              <>
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Impacted by CareerForge?</h3>
                  <p className="text-slate-400 text-sm font-medium">Your story helps others unlock their potential.</p>
                </div>

                <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="btn-premium-glow group h-16 rounded-[1.25rem] px-12 font-black text-lg shadow-2xl hover:shadow-primary/20 transition-all flex items-center gap-3">
                        <span>Share Your Journey</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] border-none bg-transparent shadow-none p-0 overflow-visible">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Submit a Review</DialogTitle>
                    </DialogHeader>
                    <ReviewForm onSuccess={() => {
                      setIsReviewModalOpen(false);
                      fetchReviews();
                    }} />
                  </DialogContent>
                </Dialog>
              </>
            ) : null}

            {!session?.user ? (
              <div className="card-premium p-12 md:p-20 text-center border border-slate-100 bg-white rounded-[3rem] shadow-xl relative group overflow-hidden w-full">
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Ready to share your own success?</h3>
                <p className="text-slate-500 text-lg mb-12 max-w-lg mx-auto font-medium leading-relaxed">
                   Join an elite network of professionals and help others navigate their career journey by sharing your CareerForge experience.
                </p>
                <Link href="/login">
                  <Button size="lg" className="btn-premium-glow h-16 rounded-[1.25rem] px-12 font-black text-lg shadow-2xl">
                    Sign In to Influence
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══ FAQ Section ═══════════════════════════════ */}
      <section className="w-full py-24 md:py-32 section-alt">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16 space-y-4 md:space-y-5 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-tight">Common Questions.</h2>
            <p className="text-muted-foreground text-base md:text-lg">Everything you need to know about the CareerForge ecosystem.</p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border/60 rounded-2xl px-6 bg-white hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-6 text-foreground tracking-tight">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ CTA Section ═══════════════════════════════ */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden section-accent flex items-center">
        {/* Animated Decorative Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blob-primary animate-mesh opacity-60" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full blob-secondary animate-mesh opacity-40 [animation-delay:-5s]" />
        </div>

        <div className="relative z-20 w-full px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-white/70 font-bold tracking-[0.2em] uppercase text-[10px] rounded-full backdrop-blur-sm">
                  Evolutionary Leap
                </Badge>
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.1] px-2">
                Scale Your <br className="hidden sm:block" />
                <span className="gradient-text-hero italic">Professional Future.</span>
              </h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4"
              >
                Join a global network of elite professionals leveraging <br className="hidden md:block" />
                advanced AI to architect their professional legacy.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex justify-center items-center pt-2"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="btn-premium-glow relative h-14 px-10 text-lg font-bold rounded-2xl border-none w-full sm:w-auto"
                  >
                    Enter CareerForge
                    <ArrowRight className="ml-2.5 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Shimmer Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer-slow" />
        </div>
      </section>
    </main>
  );
}
