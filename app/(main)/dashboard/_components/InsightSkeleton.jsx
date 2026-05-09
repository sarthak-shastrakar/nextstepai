"use client";
export default function InsightSkeleton() {
  const Bar = ({ w = "full" }) => (
    <div className={`h-3 bg-slate-200 rounded-full animate-pulse w-${w}`} />
  );
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-8">
        <div className="h-5 w-32 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-10 w-80 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-slate-100 rounded-full animate-pulse" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex flex-col gap-3">
            <Bar w="24" /><Bar w="16" /><Bar w="full" />
          </Card>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-64 flex flex-col gap-4">
          <Bar w="40" />
          <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
        </Card>
        <Card className="h-64 flex flex-col gap-4">
          <Bar w="32" />
          <div className="flex-1 bg-slate-100 rounded-full animate-pulse mx-auto w-40 h-40" />
        </Card>
      </div>
      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex flex-col gap-3 h-40">
            <Bar w="32" />
            {[...Array(3)].map((_, j) => <Bar key={j} w={j % 2 === 0 ? "full" : "4/5"} />)}
          </Card>
        ))}
      </div>
    </div>
  );
}
