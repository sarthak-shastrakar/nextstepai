import React from "react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

const MockInterviewPage = () => {
  return (
    <div>
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interviewprep">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl md:text-5xl font-black gradient-title tracking-tight">Interview Simulator</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Toggle between <span className="text-primary font-bold">Technical Precision</span> and <span className="text-indigo-500 font-bold">Behavioral Mastery</span>.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-4 max-w-2xl leading-relaxed">
            Our AI-driven protocol evaluates your domain expertise and interpersonal narrative using industry-standard frameworks like STAR and Technical assessment heuristics.
          </p>
        </div>
      </div>

      <Quiz />
    </div>
  );
};

export default MockInterviewPage;
