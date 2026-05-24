"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { HeatmapGrid } from "@/components/dashboard/HeatmapGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateHeatmapData, formatSessionLabel, formatDuration } from "@/lib/utils";
import { format, subDays } from "date-fns";
import Link from "next/link";
import { Timer } from "lucide-react";
import type { Session } from "@/types";

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

  const heatmapData = analytics?.dailyActivity
    ? generateHeatmapData(analytics.dailyActivity)
    : generateHeatmapData([]);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayHours = analytics?.dailyActivity?.find((d) => d.date === todayStr)?.hours ?? 0;

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), "yyyy-MM-dd")
  );
  const weekHours =
    analytics?.dailyActivity
      ?.filter((d) => last7Days.includes(d.date))
      .reduce((sum, d) => sum + d.hours, 0) ?? 0;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl">
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
          </Link>
        </div>

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
            currentStreak={analytics?.currentStreak ?? 0}
            longestStreak={analytics?.longestStreak ?? 0}
            todayHours={todayHours}
            weekHours={weekHours}
          />
        )}

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

        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Today&apos;s Sessions
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
                {todaySessions.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0"
                  >
                    <div>
                      <span className="text-sm text-zinc-300">
                        {formatSessionLabel(s.label)}
                      </span>
                      {s.notes && (
                        <p className="text-xs text-zinc-600 truncate max-w-[300px]">
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
    </AppLayout>
  );
}
