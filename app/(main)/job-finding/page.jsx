"use client";

import React, { useState, useEffect, useMemo } from "react";
import { jobsData } from "@/data/jobs";
import { industries } from "@/data/industries";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  XCircle,
  TrendingUp,
  Landmark,
  Activity,
  Factory,
  ShoppingBag,
  Film,
  GraduationCap,
  Zap,
  Users,
  Radio,
  Truck,
  Sprout,
  HardHat,
  Utensils,
  Heart,
  Globe,
  LayoutTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserProfile } from "@/actions/user";
import { getNicheRoles, getRecommendedJobs } from "@/actions/jobs";
import { toast } from "sonner";

const industryIcons = {
  tech: <Globe className="h-6 w-6" />,
  finance: <Landmark className="h-6 w-6" />,
  healthcare: <Activity className="h-6 w-6" />,
  manufacturing: <Factory className="h-6 w-6" />,
  retail: <ShoppingBag className="h-6 w-6" />,
  media: <Film className="h-6 w-6" />,
  education: <GraduationCap className="h-6 w-6" />,
  energy: <Zap className="h-6 w-6" />,
  consulting: <Users className="h-6 w-6" />,
  telecom: <Radio className="h-6 w-6" />,
  transportation: <Truck className="h-6 w-6" />,
  agriculture: <Sprout className="h-6 w-6" />,
  construction: <HardHat className="h-6 w-6" />,
  hospitality: <Utensils className="h-6 w-6" />,
  nonprofit: <Heart className="h-6 w-6" />,
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const JobFindingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [discoveryStatus, setDiscoveryStatus] = useState("idle"); // idle | loading | success | error
  const [discoveredRoles, setDiscoveredRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        
        if (profile?.industry) {
          const industryMatch = industries.find(
            idx => idx.name.toLowerCase().includes(profile.industry.toLowerCase()) || 
                   profile.industry.toLowerCase().includes(idx.name.toLowerCase())
          );
          if (industryMatch) setSelectedIndustry(industryMatch.id);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchData();
  }, []);

  // AI Discovery Engine - Trigger whenever niche changes
  useEffect(() => {
    const discover = async () => {
      if (!selectedIndustry) {
        setDiscoveredRoles([]);
        return;
      }

      setDiscoveryStatus("loading");
      try {
        const indName = industries.find(i => i.id === selectedIndustry)?.name;
        const res = await getNicheRoles(indName, selectedSubIndustry);
        
        if (res.success) {
          setDiscoveredRoles(res.roles);
          setDiscoveryStatus("success");
        } else {
          setDiscoveryStatus("error");
        }
      } catch (error) {
        setDiscoveryStatus("error");
      }
    };

    discover();
  }, [selectedIndustry, selectedSubIndustry]);

  const subIndustries = useMemo(() => {
    if (!selectedIndustry) return [];
    return industries.find((i) => i.id === selectedIndustry)?.subIndustries || [];
  }, [selectedIndustry]);

  const handleAiRecommendation = async () => {
    setIsAiLoading(true);
    try {
      const result = await getRecommendedJobs();
      if (result.recommendedIds?.length > 0) {
        setRecommendedIds(result.recommendedIds);
        setShowRecommendedOnly(true);
        toast.success("AI is revealing your perfect career paths!");
      } else {
        toast.error("AI couldn't find specific recommendations right now.");
      }
    } catch (error) {
      toast.error("Failed to get AI recommendations.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Merge static jobs with AI discovered roles
  const allAvailableJobs = useMemo(() => {
    return [...jobsData, ...discoveredRoles];
  }, [discoveredRoles]);

  const filteredJobs = useMemo(() => {
    return allAvailableJobs.filter((job) => {
      // 1. AI Recommendation Filter
      if (showRecommendedOnly && recommendedIds.length > 0) {
        if (!recommendedIds.includes(job.id)) return false;
      }

      // 2. Search Query Filter
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // 3. Industry/Sub-industry Filter (Only apply if NOT in Recommendation Mode)
      if (!showRecommendedOnly) {
          // Always show AI-discovered roles — they were generated for this exact industry
          const isDiscovered = discoveredRoles.some(dr => dr.id === job.id);
          if (isDiscovered) return true;

          if (selectedSubIndustry) {
            return job.category?.toLowerCase().includes(selectedSubIndustry.toLowerCase()) || 
                   selectedSubIndustry?.toLowerCase().includes(job.category?.toLowerCase());
          }
          
          if (selectedIndustry) {
              const ind = industries.find(i => i.id === selectedIndustry);
              // Match by sub-industries OR by the industry name itself
              const matchesSub = ind.subIndustries.some(sub => 
                job.category?.toLowerCase().includes(sub.toLowerCase()) || 
                sub.toLowerCase().includes(job.category?.toLowerCase())
              );
              const matchesIndName = job.category?.toLowerCase().includes(ind.name.toLowerCase()) ||
                ind.name.toLowerCase().includes(job.category?.toLowerCase());
              return matchesSub || matchesIndName;
          }
      }

      return true;
    });
  }, [searchQuery, selectedIndustry, selectedSubIndustry, recommendedIds, showRecommendedOnly, allAvailableJobs]);

  const clearFilters = () => {
    setSelectedIndustry(null);
    setSelectedSubIndustry(null);
    setSearchQuery("");
    setShowRecommendedOnly(false);
    setDiscoveredRoles([]);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      {/* Header section with Hero and Filters overlay */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col gap-10 mb-16"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div variants={fadeIn} className="space-y-4 max-w-3xl">
            <Badge
              variant="outline"
              className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full"
            >
              Career Architecture
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-foreground leading-[0.95]">
              Find Your <br />
              <span className="gradient-text-hero">Perfect Role.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Discover specialized paths across industries. Use AI to reveal roles that align with your unique DNA and skillsets.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
             <Button 
                onClick={handleAiRecommendation} 
                disabled={isAiLoading}
                className="rounded-xl h-12 px-6 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 transition-all font-semibold gap-2 border-0 shadow-lg shadow-primary/20"
             >
               {isAiLoading ? (
                 <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <Sparkles className="h-4 w-4" />
               )}
               {showRecommendedOnly ? "Refresh Discovery" : "Analyze My Profile"}
             </Button>
             
             {showRecommendedOnly && (
                <Button 
                    variant="outline" 
                    onClick={() => setShowRecommendedOnly(false)}
                    className="rounded-xl h-12 border-border/60 hover:bg-muted"
                >
                    All Roles
                </Button>
             )}
          </motion.div>
        </div>

        {/* Filter Bar */}
        <motion.div 
            variants={fadeIn}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-card border border-border/40 shadow-sm backdrop-blur-sm"
        >
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Search roles or skills..."
                    className="pl-12 h-12 h-12 rounded-xl bg-muted/30 border-border/40 focus-visible:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Select value={selectedIndustry} onValueChange={(val) => { setSelectedIndustry(val); setSelectedSubIndustry(null); }}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/40">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="All Industries" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={null}>All Industries</SelectItem>
                    {industries.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedSubIndustry} onValueChange={setSelectedSubIndustry} disabled={!selectedIndustry}>
                <SelectTrigger className={`h-12 rounded-xl bg-muted/30 border-border/40 ${discoveryStatus === 'loading' ? 'animate-pulse border-primary/40' : ''}`}>
                    <SelectValue placeholder="Select Niche" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={null}>Entire Domain</SelectItem>
                    {subIndustries.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2 md:col-start-1 lg:col-start-4">
                {(selectedIndustry || searchQuery || showRecommendedOnly) && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-destructive flex items-center gap-2 h-12 w-full justify-center md:justify-start"
                    >
                        <XCircle className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </motion.div>

        {/* ── Explore by Industry Section ── */}
        <motion.div variants={fadeIn} className="space-y-6 mt-12 mb-10">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                <LayoutTemplate className="h-6 w-6 text-primary" />
                Explore by Domain
              </h2>
              <div className="flex items-center gap-3">
                {selectedIndustry ? (
                  /* Premium active-filter chip */
                  <button
                    onClick={clearFilters}
                    className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-300"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary group-hover:bg-destructive transition-colors animate-pulse" />
                    <span className="text-[11px] font-black text-primary group-hover:text-destructive uppercase tracking-widest transition-colors">
                      {industries.find(i => i.id === selectedIndustry)?.name}
                    </span>
                    <XCircle className="h-3.5 w-3.5 text-primary/60 group-hover:text-destructive transition-colors" />
                  </button>
                ) : (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">15+ Specialized Sectors</p>
                )}
              </div>
            </div>

            {/* Marquee Container — pauses on hover via CSS */}
            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]">
              <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
                {/* Duplicate for seamless loop */}
                {[...industries, ...industries].map((ind, idx) => (
                  <div
                    key={`${ind.id}-${idx}`}
                    onClick={() => {
                      setSelectedIndustry(ind.id);
                      setSelectedSubIndustry(null);
                      setSearchQuery("");
                      setShowRecommendedOnly(false);
                      setTimeout(() => {
                        const el = document.getElementById('discovery-results');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className={`group cursor-pointer flex-shrink-0 w-[160px] p-6 rounded-3xl border transition-all flex flex-col items-center text-center gap-4 min-h-[150px] relative overflow-hidden
                      ${selectedIndustry === ind.id
                        ? 'bg-primary border-primary shadow-xl shadow-primary/20'
                        : 'bg-card border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5'
                      }`}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                    <div className={`p-3.5 rounded-2xl transition-all duration-300
                      ${selectedIndustry === ind.id
                        ? 'bg-white/20 text-white'
                        : 'bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-white'
                      }`}>
                      {industryIcons[ind.id] || <Briefcase className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className={`text-xs font-black uppercase tracking-wider mb-1 line-clamp-2 leading-tight
                        ${selectedIndustry === ind.id ? 'text-white' : 'text-slate-800'}`}>
                        {ind.name}
                      </h3>
                      <p className={`text-[10px] font-bold ${selectedIndustry === ind.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {ind.subIndustries.length} Specializations
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
      </motion.div>

      {/* ── Results Section ── */}
      <div id="discovery-results" className="scroll-mt-24 space-y-8">
        <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {discoveryStatus === 'loading' ? (
                        <span className="flex items-center gap-2 text-primary animate-pulse">
                            AI Discovering specialized Roles...
                        </span>
                    ) : (
                        `Active Roles: ${filteredJobs.length}`
                    )}
                </h2>
                {selectedIndustry && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
                       {industries.find(i => i.id === selectedIndustry)?.name} Sector
                    </div>
                )}
            </div>
        </div>

      {/* Job Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
            {discoveryStatus === 'loading' && filteredJobs.length === 0 ? (
                // Shimmer skeletons
                [1,2,3].map(i => (
                    <motion.div key={i} className="h-[300px] rounded-[1.25rem] bg-muted/10 border-2 border-dashed border-border/20 animate-pulse" />
                ))
            ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
                <JobDialog 
                    key={job.id} 
                    job={job} 
                    isRecommended={recommendedIds.includes(job.id)} 
                    isAiGenerated={discoveredRoles.some(dr => dr.id === job.id)}
                />
            ))
            ) : (
            <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-center rounded-3xl bg-muted/10 border-2 border-dashed border-border/40"
            >
                <div className="bg-accent h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                Discovery Complete
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                We couldn't find specific active roles for this combination yet. Try a broader industry.
                </p>
                <Button variant="default" onClick={clearFilters} className="rounded-xl">
                Refresh Engine
                </Button>
            </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
      </div> {/* closes discovery-results */}
    </div>
  );
};

// Extracted for readability
const JobDialog = ({ job, isRecommended, isAiGenerated }) => (
    <Dialog key={job.id}>
        <DialogTrigger asChild>
        <motion.div 
            layout
            variants={fadeIn} 
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card className={`card-premium group cursor-pointer h-full flex flex-col border-border/40 relative shadow-sm hover:shadow-xl transition-all duration-300 ${isRecommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
             
             {isRecommended && (
                <div className="absolute -top-3 -right-3 bg-primary text-white p-2 rounded-full shadow-lg z-10 animate-bounce">
                    <Sparkles className="h-4 w-4" />
                </div>
             )}

             {isAiGenerated && !isRecommended && (
                 <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
             )}

            <CardHeader className="p-7 pb-3">
                <div className="flex justify-between items-start mb-4">
                <Badge
                    variant="secondary"
                    className={`${isAiGenerated ? 'bg-indigo-500/10 text-indigo-600' : 'bg-accent text-primary/80'} border-border/30 font-bold tracking-wider text-[10px] uppercase rounded-lg px-2.5 py-1`}
                >
                    {isAiGenerated ? 'Niche Insight' : job.category}
                </Badge>
                <div className={`p-2.5 rounded-xl ${isAiGenerated ? 'bg-indigo-50/50 text-indigo-500' : 'bg-accent text-primary/60'} group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-border/20`}>
                    <Briefcase className="h-5 w-5" />
                </div>
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">
                {job.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-5 flex-grow">
                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6">
                {job.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                {job.skills?.slice(0, 3).map((skill) => (
                    <Badge
                    key={skill}
                    variant="outline"
                    className="text-[10px] px-2.5 py-1 border-border/40 text-muted-foreground/80 bg-muted/10 rounded-md"
                    >
                    {skill}
                    </Badge>
                ))}
                {(job.skills?.length || 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground/60 self-center font-medium pl-1">
                    +{(job.skills?.length || 0) - 3}
                    </span>
                )}
                </div>
            </CardContent>
            <div className="px-7 py-4 border-t border-border/40 bg-muted/5 group-hover:bg-accent/30 transition-colors flex justify-between items-center text-[10px] font-bold text-primary uppercase tracking-widest rounded-b-[1.25rem]">
                <span>Analysis & Action</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
            </Card>
        </motion.div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 rounded-[2rem] border-border/20 shadow-2xl bg-background">

            {/* ── Hero Header ── */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 pb-10 overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #4F46E5 0%, transparent 50%)'}} />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-5">
                        <Badge className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg border-0 ${isAiGenerated ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/10 text-white/70'}`}>
                            {isAiGenerated ? '✦ AI Discovered' : job.category}
                        </Badge>
                        {isRecommended && (
                            <Badge className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg bg-primary text-white border-0 animate-pulse">
                                ★ Profile Match
                            </Badge>
                        )}
                    </div>
                    <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
                        {job.title}
                    </DialogTitle>
                    <p className="text-white/50 text-sm font-semibold uppercase tracking-widest">{job.category}</p>
                </div>
            </div>

            {/* ── Content Body ── */}
            <div className="p-7 space-y-6">

                {/* Overview Row */}
                <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-border/30">
                    <div className="shrink-0 mt-0.5 h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Strategic Overview</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                    </div>
                </div>

                {/* Responsibilities Row */}
                <div className="rounded-2xl border border-border/30 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border-b border-emerald-100">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Key Responsibilities</span>
                    </div>
                    <ul className="divide-y divide-border/20">
                        {job.responsibilities?.map((resp, idx) => (
                            <li key={idx} className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                                <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span className="text-sm text-slate-700 leading-relaxed">{resp}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Skills + Tools Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Required Skills */}
                    <div className="rounded-2xl border border-border/30 overflow-hidden">
                        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-primary/5 border-b border-primary/10">
                            <div className="h-6 w-6 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Required Skills</span>
                        </div>
                        <div className="p-4 flex flex-wrap gap-2">
                            {job.skills?.map((skill) => (
                                <span key={skill} className="px-3 py-1.5 rounded-lg bg-primary/8 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/10">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tools */}
                    <div className="rounded-2xl border border-border/30 overflow-hidden">
                        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-slate-50 border-b border-border/30">
                            <div className="h-6 w-6 rounded-lg bg-slate-200 flex items-center justify-center">
                                <Briefcase className="h-3.5 w-3.5 text-slate-600" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modern Toolkit</span>
                        </div>
                        <div className="p-4 flex flex-wrap gap-2">
                            {job.tools?.map((tool) => (
                                <span key={tool} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-border/50 font-bold text-sm hover:bg-muted transition-all active:scale-95 gap-2"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(job.title + " jobs")}`, "_blank")}
                    >
                        <Search className="h-4 w-4" />
                        Find Jobs
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all active:scale-95 gap-2 border-0"
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=how+to+become+a+${encodeURIComponent(job.title)}`, "_blank")}
                    >
                        <TrendingUp className="h-4 w-4" />
                        Career Roadmap
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default JobFindingPage;
