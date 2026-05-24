"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyHoursChart } from "@/components/analytics/AnalyticsCharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDuration, formatHrMin, formatSessionLabel, generateHeatmapData } from "@/lib/utils";
import { HeatmapGrid } from "@/components/dashboard/HeatmapGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface AnalyticsData {
  totalHours: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  avgSessionLength: number;
  weeklyHours: { week: string; hours: number }[];
  dailyActivity: { date: string; hours: number }[];
}

interface Session {
  id: string;
  label: string;
  startTime: string;
  duration: number | null;
  notes: string | null;
}

const SESSION_LABELS = [
  { value: "LEETCODE", label: "LeetCode" },
  { value: "STRIVER", label: "Striver" },
  { value: "REVISION", label: "Revision" },
  { value: "CONTEST", label: "Contest" },
  { value: "NOTES", label: "Notes" },
  { value: "DEBUGGING", label: "Debugging" },
  { value: "MOCK_INTERVIEW", label: "Mock Interview" },
  { value: "MANUAL", label: "Manual" },
];

export default function AnalyticsPage() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);
  const [addHours, setAddHours] = useState(0);
  const [addMinutes, setAddMinutes] = useState(30);
  const [addLabel, setAddLabel] = useState("MANUAL");
  const [addError, setAddError] = useState("");

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: daySessions, isLoading: dayLoading } = useQuery<{ sessions: Session[] }>({
    queryKey: ["sessions", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/sessions?date=${selectedDate}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const totalSeconds = addHours * 3600 + addMinutes * 60;
      if (totalSeconds <= 0) throw new Error("Enter at least 1 minute.");
      const startTime = new Date(`${selectedDate}T00:00:00.000Z`).toISOString();
      const endTime = new Date(new Date(`${selectedDate}T00:00:00.000Z`).getTime() + totalSeconds * 1000).toISOString();
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: addLabel, startTime, endTime, duration: totalSeconds }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add");
      }
      return res.json();
    },
    onSuccess: () => {
      setAddError("");
      queryClient.invalidateQueries({ queryKey: ["sessions", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (e: Error) => setAddError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: async ({ id, label }: { id: string; label: string }) => {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const heatmapData = data?.dailyActivity
    ? generateHeatmapData(data.dailyActivity)
    : generateHeatmapData([]);

  const summaryStats = [
    {
      label: "Total Hours",
      value: formatHrMin(data?.totalHours ?? 0),
      sub: `${data?.totalSessions ?? 0} sessions`,
    },
    {
      label: "Avg Session",
      value: formatDuration(data?.avgSessionLength ?? 0),
      sub: "per session",
    },
    {
      label: "Current Streak",
      value: `${data?.currentStreak ?? 0}d`,
      sub: `best: ${data?.longestStreak ?? 0}d`,
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500">Study time overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {summaryStats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-xl font-mono font-semibold text-zinc-100 leading-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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

        {/* Manage Data */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Manage Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add form */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Date</p>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 w-40"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Category</p>
                <Select value={addLabel} onValueChange={setAddLabel}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-100 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_LABELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Hours</p>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={addHours}
                  onChange={(e) => setAddHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 w-20"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Minutes</p>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={addMinutes}
                  onChange={(e) => setAddMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 w-20"
                />
              </div>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending}
                className="gap-1.5"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                {addMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </div>

            {addError && (
              <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
                {addError}
              </p>
            )}

            {/* Sessions list */}
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500">
                Sessions on {format(new Date(selectedDate + "T12:00:00"), "MMM d, yyyy")}
              </p>
              {dayLoading ? (
                <div className="h-10 bg-zinc-800/30 rounded animate-pulse" />
              ) : !daySessions?.sessions.length ? (
                <p className="text-xs text-zinc-600 py-2">No sessions on this day.</p>
              ) : (
                <div className="space-y-1.5">
                  {daySessions.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-800/40 border border-zinc-700/50"
                    >
                      {/* Inline label editor */}
                      <Select
                        value={s.label}
                        onValueChange={(val) => updateLabelMutation.mutate({ id: s.id, label: val })}
                      >
                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-300 h-7 text-xs w-32 px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SESSION_LABELS.map((l) => (
                            <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="text-xs text-zinc-300 font-mono">
                        {s.duration ? formatHrMin(s.duration / 3600) : "—"}
                      </span>

                      {s.notes && (
                        <span className="text-xs text-zinc-600 truncate max-w-[200px] flex-1">
                          {s.notes}
                        </span>
                      )}

                      <button
                        onClick={() => deleteMutation.mutate(s.id)}
                        disabled={deleteMutation.isPending}
                        className="ml-auto text-zinc-600 hover:text-red-400 transition-colors p-1 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
