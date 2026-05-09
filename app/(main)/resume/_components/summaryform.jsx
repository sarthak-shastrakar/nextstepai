    "use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { improveWithAI } from "@/actions/resume";

export function SummaryForm({ value, onChange }) {
  const { register, watch, setValue } = useForm({
    defaultValues: {
      summary: value || "",
    },
  });

  const summary = watch("summary");

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  // Update the summary when AI returns improved content
  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("summary", improvedContent);
      onChange(improvedContent);
      toast.success("Summary improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve summary");
    }
  }, [improvedContent, improveError, isImproving, setValue, onChange]);

  const handleImprove = async () => {
    if (!summary) {
      toast.error("Please enter a summary first");
      return;
    }

    await improveWithAIFn({
      current: summary,
      type: "summary",
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Write a compelling professional summary..."
        {...register("summary")}
        value={summary}
        onChange={(e) => {
          setValue("summary", e.target.value);
          onChange(e.target.value);
        }}
        className="h-32 rounded-xl border-primary/10 focus-visible:ring-primary/20 bg-background/50"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleImprove}
        disabled={!summary || isImproving}
        className="rounded-full bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-all font-bold group"
      >
        {isImproving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Optimizing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2 text-primary group-hover:rotate-12 transition-transform" />
            AI Professional Polish
          </>
        )}
      </Button>
    </div>
  );
}
