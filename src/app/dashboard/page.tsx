"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TimerWidget } from "@/components/timer/TimerWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatSessionLabel, formatHrMin } from "@/lib/utils";
import { format, subDays, addDays, isToday } from "date-fns";
import { Timer, Quote, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [sessionDate, setSessionDate] = useState(new Date());
  const isCurrentDay = isToday(sessionDate);

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const sessionDateStr = format(sessionDate, "yyyy-MM-dd");
  const { data: todaySessions } = useQuery<SessionsData>({
    queryKey: ["sessions-date", sessionDateStr],
    queryFn: async () => {
      const res = await fetch(`/api/sessions?date=${sessionDateStr}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayHours = analytics?.dailyActivity?.find((d) => d.date === todayStr)?.hours ?? 0;
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"));
  const weekHours = analytics?.dailyActivity?.filter((d) => last7Days.includes(d.date)).reduce((sum, d) => sum + d.hours, 0) ?? 0;

  return (
    <AppLayout>
      <div className="p-4 sm:p-5 lg:p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        {/* Motivational Quote */}
        <div className="relative rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 sm:p-5">
          <Quote className="absolute top-4 left-4 h-4 w-4 text-violet-400/40" />
          <blockquote className="pl-6">
            <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed italic">
              &ldquo;{quote.text}&rdquo;
            </p>
          </blockquote>
        </div>

        {/* Stats Cards */}
        {loadingAnalytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-dp-900/50 border border-dp-700/40 rounded-xl animate-pulse" />
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

        {/* Timer + Today's Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Study Session — wider */}
          <Card className="lg:col-span-3 bg-dp-900/40 border-dp-700/30">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                Study Session
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6">
              <TimerWidget />
            </CardContent>
          </Card>

          {/* Today's Sessions */}
          <Card className="lg:col-span-2 bg-dp-900/40 border-dp-700/30">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {isCurrentDay ? "Today's Sessions" : format(sessionDate, "MMM d")}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSessionDate((d) => subDays(d, 1))}
                    className="p-1 rounded hover:bg-dp-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSessionDate((d) => addDays(d, 1))}
                    disabled={isCurrentDay}
                    className="p-1 rounded hover:bg-dp-800 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {!todaySessions?.sessions.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-dp-800/60 flex items-center justify-center mb-3">
                    <Timer className="h-5 w-5 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">No sessions yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Start your first session today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySessions.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 border-b border-dp-700/40 last:border-0 gap-2"
                    >
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${LABEL_COLORS[s.label] ?? LABEL_COLORS.MANUAL}`}>
                        {formatSessionLabel(s.label)}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 ml-auto shrink-0">
                        {formatHrMin((s.duration ?? 0) / 3600)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between border-t border-dp-700/40">
                    <span className="text-xs text-zinc-600">Total</span>
                    <span className="text-xs font-mono font-semibold text-zinc-300">
                      {formatHrMin(todaySessions.totalSeconds / 3600)}
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
