"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { HeatmapGrid } from "@/components/dashboard/HeatmapGrid";
import { RevisionDue } from "@/components/dashboard/RevisionDue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateHeatmapData, calculateStreak, formatSessionLabel, formatDuration } from "@/lib/utils";
import { format, startOfDay, subDays } from "date-fns";
import Link from "next/link";
import { Timer, ArrowRight } from "lucide-react";
import type { Problem, Session } from "@/types";

interface AnalyticsData {
  totalHours: number;
  totalProblems: number;
  currentStreak: number;
  longestStreak: number;
  avgSessionLength: number;
  dailyActivity: { date: string; hours: number; problems: number; revisions: number }[];
  problemsByDifficulty: { easy: number; medium: number; hard: number };
}

interface SessionsData {
  sessions: Session[];
  totalSeconds: number;
}

interface RevisionData {
  dueToday: Problem[];
  overdue: Problem[];
}

export default function DashboardPage() {
  const { data: analytics, isLoading: loadingAnalytics } =
    useQuery<AnalyticsData>({
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

  const { data: revisionData } = useQuery<RevisionData>({
    queryKey: ["revisions"],
    queryFn: async () => {
      const res = await fetch("/api/revisions");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const heatmapData = analytics?.dailyActivity
    ? generateHeatmapData(analytics.dailyActivity)
    : generateHeatmapData([]);

  // Today's stats
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayActivity = analytics?.dailyActivity?.find(
    (d) => d.date === todayStr
  );
  const todayHours = todayActivity?.hours ?? 0;
  const todayProblems = todayActivity?.problems ?? 0;

  // Week hours
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), "yyyy-MM-dd")
  );
  const weekHours =
    analytics?.dailyActivity
      ?.filter((d) => last7Days.includes(d.date))
      .reduce((sum, d) => sum + d.hours, 0) ?? 0;

  const dueTodayAndOverdue = [
    ...(revisionData?.overdue ?? []),
    ...(revisionData?.dueToday ?? []),
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
            <p className="text-sm text-zinc-500">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          <Link
            href="/timer"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Timer className="h-4 w-4" />
            Start Session
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stats Cards */}
        {loadingAnalytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <StatsCards
            totalHours={analytics?.totalHours ?? 0}
            totalProblems={analytics?.totalProblems ?? 0}
            currentStreak={analytics?.currentStreak ?? 0}
            longestStreak={analytics?.longestStreak ?? 0}
            todayHours={todayHours}
            todayProblems={todayProblems}
            weekHours={weekHours}
          />
        )}

        {/* Heatmap */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Activity — Last 52 Weeks
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-4">
            <HeatmapGrid data={heatmapData} />
          </CardContent>
        </Card>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revisions Due */}
          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Revisions Due
                </CardTitle>
                {dueTodayAndOverdue.length > 0 && (
                  <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full">
                    {dueTodayAndOverdue.length}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <RevisionDue problems={dueTodayAndOverdue.slice(0, 5)} />
              {dueTodayAndOverdue.length > 5 && (
                <Link
                  href="/revisions"
                  className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 block"
                >
                  +{dueTodayAndOverdue.length - 5} more →
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!todaySessions?.sessions.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                  <Timer className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No sessions today</p>
                  <Link
                    href="/timer"
                    className="text-xs text-zinc-500 hover:text-zinc-300 mt-1"
                  >
                    Start your first session →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySessions.sessions.slice(0, 6).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div>
                        <span className="text-sm text-zinc-300">
                          {formatSessionLabel(s.label)}
                        </span>
                        {s.notes && (
                          <p className="text-xs text-zinc-600 truncate max-w-[180px]">
                            {s.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-mono text-zinc-500">
                        {formatDuration(s.duration ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
