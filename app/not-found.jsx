import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-background to-accent/30">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-accent flex items-center justify-center mb-2">
          <SearchX className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-7xl font-extrabold gradient-title tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a new location.
        </p>
        <Link href="/">
          <Button className="rounded-xl px-6 h-12 font-semibold mt-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
