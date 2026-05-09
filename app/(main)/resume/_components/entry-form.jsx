"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { entrySchema } from "@/app/form-lib/schema";
import { 
  Sparkles, 
  PlusCircle, 
  X, 
  Pencil, 
  Save, 
  Loader2, 
  GraduationCap, 
  Briefcase, 
  Code2, 
  Building2, 
  Trash2,
  Calendar,
  Award
} from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

export function EntryForm({ type, entries, onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      link: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });
  const current = watch("current");

  const getTypesConfig = () => {
    switch (type.toLowerCase()) {
      case "education":
        return {
          icon: <GraduationCap className="h-5 w-5 text-indigo-600" />,
          titleLabel: "Degree / Qualification",
          titlePlaceholder: "B.Tech in Computer Science",
          orgLabel: "School / University",
          orgPlaceholder: "IIT Delhi",
          descPlaceholder: "Relevant coursework, GPA, achievements...",
          linkLabel: "Institution Link (Optional)",
          linkPlaceholder: "https://university.edu",
        };
      case "project":
        return {
          icon: <Code2 className="h-5 w-5 text-emerald-600" />,
          titleLabel: "Project Name",
          titlePlaceholder: "AI Career Coach Platform",
          orgLabel: "Tech Stack / Link",
          orgPlaceholder: "Next.js, Tailwind, OpenAI",
          descPlaceholder: "Key features, technologies used, your role...",
          linkLabel: "Project Link (Optional)",
          linkPlaceholder: "https://project-demo.com",
        };
      case "certifications":
        return {
          icon: <Award className="h-5 w-5 text-purple-600" />,
          titleLabel: "Certification Name",
          titlePlaceholder: "AWS Certified Solutions Architect",
          orgLabel: "Issuing Organization",
          orgPlaceholder: "Amazon Web Services",
          descPlaceholder: "Certification ID, skills covered, or validation link...",
          linkLabel: "Certification Link (Optional)",
          linkPlaceholder: "https://credential.net/xyz",
        };
      case "awards":
        return {
          icon: <Sparkles className="h-5 w-5 text-rose-600" />,
          titleLabel: "Award / Achievement",
          titlePlaceholder: "1st Place in Hackathon",
          orgLabel: "Organizer / Context",
          orgPlaceholder: "Major League Hacking (MLH)",
          descPlaceholder: "Brief description of the achievement...",
          linkLabel: "Reference Link (Optional)",
          linkPlaceholder: "https://award-reference.com",
          hideLink: true,
        };
      default:
        return {
          icon: <Briefcase className="h-5 w-5 text-amber-600" />,
          titleLabel: "Title / Position",
          titlePlaceholder: "Full Stack Developer",
          orgLabel: "Organization / Company",
          orgPlaceholder: "Google",
          descPlaceholder: "Key responsibilities and measurable achievements...",
          linkLabel: "Company Link (Optional)",
          linkPlaceholder: "https://company.com",
        };
    }
  };

  const config = getTypesConfig();

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate),
    };

    onChange([...(entries || []), formattedEntry]);

    reset();
    setIsAdding(false);
  });

  const handleDelete = (index) => {
    const newEntries = (entries || []).filter((_, i) => i !== index);
    onChange(newEntries);
  };

  // Add this effect to handle the improvement result
  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  // Replace handleImproveDescription with this
  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(), // 'experience', 'education', or 'project'
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.isArray(entries) && entries.map((item, index) => (
          <Card key={index} className="card-premium group relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50 group-hover:bg-primary/10 transition-colors">
                  {config.icon}
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                    {item.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3" />
                    {item.organization}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/5 w-fit px-2 py-1 rounded-md mb-3">
                <Calendar className="h-3 w-3" />
                {item.current
                  ? `${item.startDate} - Present`
                  : `${item.startDate} - ${item.endDate}`}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{config.titleLabel}</label>
                <Input
                  placeholder={config.titlePlaceholder}
                  {...register("title")}
                  className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                />
                {errors.title && (
                  <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{config.orgLabel}</label>
                <Input
                  placeholder={config.orgPlaceholder}
                  {...register("organization")}
                  className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                />
                {errors.organization && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.organization.message}
                  </p>
                )}
              </div>
              {!config.hideLink && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{config.linkLabel}</label>
                  <Input
                    placeholder={config.linkPlaceholder}
                    {...register("link")}
                    className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                  />
                  {errors.link && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.link.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Start Date</label>
                <Input
                  type="month"
                  {...register("startDate")}
                  className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">End Date</label>
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current}
                  className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
              />
              <label htmlFor="current">Current {type}</label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Description</label>
              </div>
              <Textarea
                placeholder={config.descPlaceholder}
                className="h-32 rounded-xl border-primary/10 focus-visible:ring-primary/20 resize-none shadow-sm bg-background"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-all font-bold group"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  AI Refining...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2 text-primary group-hover:animate-pulse" />
                  AI Polish
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl font-medium flex-1 sm:flex-none"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="rounded-xl btn-premium-glow shadow-lg shadow-primary/10 px-6 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex-1 sm:flex-none" 
              onClick={handleAdd}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add {type}
            </Button>
          </CardFooter>
        </Card>
      )}
      {!isAdding && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
}
