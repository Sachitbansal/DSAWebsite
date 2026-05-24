"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { HeatmapGrid } from "@/components/dashboard/HeatmapGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateHeatmapData, formatSessionLabel, formatHrMin } from "@/lib/utils";
import { format, subDays } from "date-fns";
import Link from "next/link";
import { Timer, ArrowRight, Quote } from "lucide-react";
import type { Session } from "@/types";

const QUOTES = [
  { text: "The grind today is the glory tomorrow.", author: "Unknown" },
  { text: "Every problem you solve adds a weapon to your arsenal.", author: "Unknown" },
  { text: "Consistency compounds. Show up every day.", author: "Unknown" },
  { text: "Your future self is watching. Make them proud.", author: "Unknown" },
  { text: "Hard problems are just easy problems you haven't understood yet.", author: "Unknown" },
  { text: "Debug your mindset before you debug your code.", author: "Unknown" },
  { text: "One pattern at a time. Stack them up.", author: "Unknown" },
  { text: "The best time to start was yesterday. The second best time is now.", author: "Unknown" },
  { text: "You're not stuck. You're loading.", author: "Unknown" },
  { text: "Ship the solution, not the excuse.", author: "Unknown" },
  { text: "Every expert was once a beginner who refused to quit.", author: "Unknown" },
  { text: "Progress is progress, no matter how small.", author: "Unknown" },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

interface AnalyticsData {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  avgSessionLength: number;
  dailyActivity: { date: string; hours: number }[];
}

interface SessionsData {
  sessions: Session[];
  totalSeconds: number;
}

const LABEL_COLORS: Record<string, string> = {
  LEETCODE: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  STRIVER: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  REVISION: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  CONTEST: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  NOTES: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  DEBUGGING: "text-red-400 bg-red-400/10 border-red-400/20",
  MOCK_INTERVIEW: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  MANUAL: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

export default function DashboardPage() {
  const quote = getDailyQuote();

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: todaySessions } = useQuery<SessionsData>({
    queryKey: ["sessions-today"],
    queryFn: async () => {
      const res = await fetch("/api/sessions?today=true");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const heatmapData = analytics?.dailyActivity
    ? generateHeatmapData(analytics.dailyActivity)
    : generateHeatmapData([]);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayHours = analytics?.dailyActivity?.find((d) => d.date === todayStr)?.hours ?? 0;
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"));
  const weekHours = analytics?.dailyActivity?.filter((d) => last7Days.includes(d.date)).reduce((sum, d) => sum + d.hours, 0) ?? 0;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
          <Link
            href="/timer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors self-start sm:self-auto"
          >
            <Timer className="h-4 w-4" />
            Start Session
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Motivational Quote */}
        <div className="relative rounded-xl border border-blue-500/15 bg-blue-500/5 p-4 sm:p-5">
          <Quote className="absolute top-4 left-4 h-4 w-4 text-blue-500/40" />
          <blockquote className="pl-6">
            <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed italic">
              "{quote.text}"
            </p>
          </blockquote>
        </div>

        {/* Stats Cards */}
        {loadingAnalytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <StatsCards
            totalHours={analytics?.totalHours ?? 0}
            currentStreak={analytics?.currentStreak ?? 0}
            longestStreak={analytics?.longestStreak ?? 0}
            todayHours={todayHours}
            weekHours={weekHours}
          />
        )}

        {/* Heatmap + Today Sessions — side by side on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Heatmap */}
          <Card className="xl:col-span-2 bg-zinc-900/40 border-zinc-800/60">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Activity — Last 52 Weeks
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <HeatmapGrid data={heatmapData} />
            </CardContent>
          </Card>

          {/* Today's Sessions */}
          <Card className="bg-zinc-900/40 border-zinc-800/60">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Today&apos;s Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {!todaySessions?.sessions.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/60 flex items-center justify-center mb-3">
                    <Timer className="h-5 w-5 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">No sessions yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Start your first session today</p>
                  <Link
                    href="/timer"
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    Go to Timer <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySessions.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0 gap-2"
                    >
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${LABEL_COLORS[s.label] ?? LABEL_COLORS.MANUAL}`}>
                        {formatSessionLabel(s.label)}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 ml-auto">
                        {formatHrMin((s.duration ?? 0) / 3600)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/50">
                    <span className="text-xs text-zinc-600">Total</span>
                    <span className="text-xs font-mono font-semibold text-zinc-300">
                      {formatHrMin((todaySessions.totalSeconds) / 3600)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
