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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

function EditSessionDialog({
  session,
  open,
  onClose,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  session: Session;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, label: string, hours: number, minutes: number) => void;
  onDelete: (id: string) => void;
  saving: boolean;
  deleting: boolean;
}) {
  const initialHours = Math.floor((session.duration ?? 0) / 3600);
  const initialMinutes = Math.floor(((session.duration ?? 0) % 3600) / 60);
  const [label, setLabel] = useState(session.label);
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-zinc-100">Edit Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Category */}
          <div className="space-y-1.5">
            <p className="text-xs text-zinc-500">Category</p>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_LABELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <p className="text-xs text-zinc-500">Duration</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 w-20"
                />
                <span className="text-xs text-zinc-500">hr</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 w-20"
                />
                <span className="text-xs text-zinc-500">min</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => onSave(session.id, label, hours, minutes)}
              disabled={saving || deleting}
              size="sm"
              className="flex-1"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => onDelete(session.id)}
              disabled={saving || deleting}
              size="sm"
              variant="destructive"
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AnalyticsPage() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);
  const [addHours, setAddHours] = useState(0);
  const [addMinutes, setAddMinutes] = useState(30);
  const [addLabel, setAddLabel] = useState("MANUAL");
  const [addError, setAddError] = useState("");
  const [editingSession, setEditingSession] = useState<Session | null>(null);

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["sessions", selectedDate] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

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
    },
    onSuccess: () => { setAddError(""); invalidate(); },
    onError: (e: Error) => setAddError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, label, hours, minutes }: { id: string; label: string; hours: number; minutes: number }) => {
      const duration = hours * 3600 + minutes * 60;
      if (duration <= 0) throw new Error("Duration must be > 0");
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, duration }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => { setEditingSession(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => { setEditingSession(null); invalidate(); },
  });

  const heatmapData = data?.dailyActivity
    ? generateHeatmapData(data.dailyActivity)
    : generateHeatmapData([]);

  const summaryStats = [
    { label: "Total Hours", value: formatHrMin(data?.totalHours ?? 0), sub: `${data?.totalSessions ?? 0} sessions` },
    { label: "Avg Session", value: formatDuration(data?.avgSessionLength ?? 0), sub: "per session" },
    { label: "Current Streak", value: `${data?.currentStreak ?? 0}d`, sub: `best: ${data?.longestStreak ?? 0}d` },
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your study time at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 sm:p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">{stat.label}</p>
              <p className="text-2xl font-bold font-mono text-zinc-100 leading-none">{stat.value}</p>
              <p className="text-xs text-zinc-600 mt-1.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Activity — Last 52 Weeks</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <HeatmapGrid data={heatmapData} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Weekly Study Hours</CardTitle>
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
        <Card className="bg-zinc-900/40 border-zinc-800/60">
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
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-800/40 border border-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-400 font-medium">
                          {formatSessionLabel(s.label)}
                        </span>
                        <span className="text-xs text-zinc-300 font-mono">
                          {s.duration ? formatHrMin(s.duration / 3600) : "—"}
                        </span>
                        {s.notes && (
                          <span className="text-xs text-zinc-600 truncate max-w-[180px]">
                            {s.notes}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingSession(s)}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors px-2 py-1 rounded hover:bg-zinc-700/50"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {editingSession && (
        <EditSessionDialog
          session={editingSession}
          open={!!editingSession}
          onClose={() => setEditingSession(null)}
          onSave={(id, label, hours, minutes) =>
            updateMutation.mutate({ id, label, hours, minutes })
          }
          onDelete={(id) => deleteMutation.mutate(id)}
          saving={updateMutation.isPending}
          deleting={deleteMutation.isPending}
        />
      )}
    </AppLayout>
  );
}
