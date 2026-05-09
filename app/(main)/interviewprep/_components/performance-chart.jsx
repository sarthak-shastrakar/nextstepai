"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment, index) => ({
        quiz: `Quiz ${index + 1}`,
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
      })).reverse();
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="card-premium border border-border/40 shadow-2xl glass-subtle overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <CardHeader className="pb-8 border-b border-border/40 mx-4 px-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                Performance Analytics
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">
                Mock Interview Progress & Score Trends
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-12 px-4">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis 
                  dataKey="quiz" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                   domain={[0, 100]} 
                   axisLine={false}
                   tickLine={false}
                   tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                   tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(79, 70, 229, 0.2)", strokeWidth: 2 }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-white/95 shadow-2xl border border-primary/10 rounded-2xl p-4 backdrop-blur-2xl ring-1 ring-white/20">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                            {payload[0].payload.date}
                          </p>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-primary" />
                             <p className="text-lg font-black text-foreground leading-none">
                              {payload[0].value.toFixed(1)}% Score
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#performanceGradient)"
                  dot={{ r: 6, strokeWidth: 3, fill: "white", stroke: "hsl(var(--primary))" }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
