"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WeeklyHoursChart,
  TopicPieChart,
  DifficultyBarChart,
  ProblemsOverTimeChart,
} from "@/components/analytics/AnalyticsCharts";
import { useQuery } from "@tanstack/react-query";
import { formatDuration, formatHours } from "@/lib/utils";
import { HeatmapGrid } from "@/components/dashboard/HeatmapGrid";
import { generateHeatmapData } from "@/lib/utils";
import type { AnalyticsSummary } from "@/types";

interface AnalyticsResponse extends AnalyticsSummary {
  problemsOverTime: { date: string; cumulative: number }[];
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const heatmapData = data?.dailyActivity
    ? generateHeatmapData(data.dailyActivity)
    : generateHeatmapData([]);

  const summaryStats = [
    {
      label: "Total Hours",
      value: `${data?.totalHours ?? 0}h`,
      sub: `${data?.totalSessions ?? 0} sessions`,
    },
    {
      label: "Total Problems",
      value: data?.totalProblems ?? 0,
      sub: `avg ${formatDuration(Math.round(data?.avgSessionLength ?? 0))} / session`,
    },
    {
      label: "Current Streak",
      value: `${data?.currentStreak ?? 0} days`,
      sub: `best: ${data?.longestStreak ?? 0} days`,
    },
    {
      label: "Revision Rate",
      value: `${data?.revisionCompletionRate ?? 0}%`,
      sub: "completion",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500">Performance overview</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryStats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-mono font-semibold text-zinc-100">
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Heatmap */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-4">
            <HeatmapGrid data={heatmapData} />
          </CardContent>
        </Card>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Weekly Study Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-zinc-800/30 rounded animate-pulse" />
              ) : (
                <WeeklyHoursChart data={data?.weeklyHours ?? []} />
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Problems by Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[180px] bg-zinc-800/30 rounded animate-pulse" />
              ) : (
                <DifficultyBarChart
                  easy={data?.problemsByDifficulty.easy ?? 0}
                  medium={data?.problemsByDifficulty.medium ?? 0}
                  hard={data?.problemsByDifficulty.hard ?? 0}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Problems by Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-zinc-800/30 rounded animate-pulse" />
              ) : data?.problemsByTopic.length ? (
                <TopicPieChart data={data.problemsByTopic} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-zinc-600 text-sm">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Problems Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-zinc-800/30 rounded animate-pulse" />
              ) : (data?.problemsOverTime?.length ?? 0) > 0 ? (
                <ProblemsOverTimeChart data={data!.problemsOverTime} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-zinc-600 text-sm">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Topic breakdown */}
        {(data?.problemsByTopic.length ?? 0) > 0 && (
          <Card className="bg-zinc-900/30 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Topic Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {data?.problemsByTopic.slice(0, 12).map((t) => (
                  <div
                    key={t.topic}
                    className="flex items-center justify-between p-2.5 bg-zinc-800/50 rounded-md"
                  >
                    <span className="text-xs text-zinc-300">{t.topic}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1 bg-zinc-600 rounded-full"
                        style={{
                          width: `${Math.max(20, t.percentage * 2)}px`,
                        }}
                      />
                      <span className="text-xs font-mono text-zinc-500">
                        {t.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
