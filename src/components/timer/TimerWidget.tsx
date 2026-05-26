"use client";

import React, { useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { formatDuration, formatHrMin, formatSessionLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Clock } from "lucide-react";
import { format } from "date-fns";
import type { SessionLabel, Session } from "@/types";
import { useQuery } from "@tanstack/react-query";

const SESSION_LABELS: SessionLabel[] = [
  "LEETCODE",
  "STRIVER",
  "REVISION",
  "CONTEST",
  "NOTES",
  "DEBUGGING",
  "MOCK_INTERVIEW",
];

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

interface TodaySessions {
  sessions: Session[];
  totalSeconds: number;
}

export function TimerWidget() {
  const { elapsed, running, paused, label, sessionNotes, startTime, setLabel, setSessionNotes, start, pause, resume, stop } = useTimer();
  const [stopping, setStopping] = useState(false);

  const { data: todayData, refetch } = useQuery<TodaySessions>({
    queryKey: ["sessions-today"],
    queryFn: async () => {
      const res = await fetch("/api/sessions?today=true");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const handleStop = async () => {
    setStopping(true);
    await stop();
    setStopping(false);
    refetch();
  };

  const totalTodaySeconds = (todayData?.totalSeconds ?? 0) + (running || paused ? elapsed : 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      {/* Timer display */}
      <div className="relative flex items-center justify-center">
        <div className={`absolute inset-0 rounded-2xl blur-3xl opacity-10 transition-colors ${
          running ? "bg-violet-500" : paused ? "bg-amber-500" : "bg-dp-600"
        }`} />
        <div className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 w-72 h-36 sm:w-80 sm:h-40 items-center justify-center transition-colors ${
          running ? "border-violet-500/40 bg-violet-500/5" : paused ? "border-amber-500/30 bg-amber-500/5" : "border-dp-700/60 bg-dp-900/30"
        }`}>
          <div className="text-5xl sm:text-6xl font-mono tabular-nums text-zinc-100 tracking-wider timer-display">
            {formatDuration(elapsed)}
          </div>
          {(running || paused) ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${running ? "bg-violet-400 animate-pulse" : "bg-amber-400"}`} />
                <span className="text-xs text-zinc-400">{running ? "Running" : "Paused"}</span>
              </div>
              {startTime && (
                <span className="text-[10px] text-zinc-600">
                  Started {format(new Date(startTime), "h:mm a")}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-zinc-600">Ready</span>
          )}
        </div>
      </div>

      {/* Label selector */}
      <div className="w-full max-w-xs">
        <Select value={label} onValueChange={(v) => setLabel(v as SessionLabel)} disabled={running || paused}>
          <SelectTrigger className="bg-dp-900 border-dp-700/60 text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_LABELS.map((l) => (
              <SelectItem key={l} value={l}>{formatSessionLabel(l)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running && !paused && (
          <Button onClick={start} size="lg" className="px-10 bg-violet-600 hover:bg-violet-500 text-white gap-2">
            <Play className="h-4 w-4" />
            Start
          </Button>
        )}
        {running && (
          <>
            <Button onClick={pause} size="lg" variant="outline" className="px-7 border-zinc-700 gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button onClick={handleStop} size="lg" variant="outline" className="px-7 border-red-800/70 text-red-400 hover:bg-red-950/40 gap-2" disabled={stopping}>
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}
        {paused && (
          <>
            <Button onClick={resume} size="lg" className="px-7 bg-violet-600 hover:bg-violet-500 text-white gap-2">
              <Play className="h-4 w-4" />
              Resume
            </Button>
            <Button onClick={handleStop} size="lg" variant="outline" className="px-7 border-red-800/70 text-red-400 hover:bg-red-950/40 gap-2" disabled={stopping}>
              <Square className="h-4 w-4" />
              Save
            </Button>
          </>
        )}
      </div>

      {/* Session notes */}
      {(running || paused) && (
        <div className="w-full max-w-md">
          <Textarea
            placeholder="Session notes (optional)..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="bg-dp-900 border-dp-700/50 text-zinc-200 resize-none h-20 text-sm"
          />
        </div>
      )}

      {/* Today summary */}
      <div className="w-full max-w-md rounded-xl border border-dp-700/40 bg-dp-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-sm text-zinc-400 font-medium">Today</span>
          <span className="ml-auto font-mono text-sm font-semibold text-zinc-200">
            {formatHrMin(totalTodaySeconds / 3600)}
          </span>
        </div>
        {todayData?.sessions.length ? (
          <div className="space-y-1.5">
            {todayData.sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${LABEL_COLORS[session.label] ?? LABEL_COLORS.MANUAL}`}>
                  {formatSessionLabel(session.label)}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono truncate">
                  {format(new Date(session.startTime), "h:mm a")}
                  {session.endTime ? ` – ${format(new Date(session.endTime), "h:mm a")}` : ""}
                </span>
                <span className="text-xs font-mono text-zinc-500 shrink-0">
                  {formatHrMin((session.duration ?? 0) / 3600)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600 text-center py-1">No sessions yet today</p>
        )}
      </div>
    </div>
  );
}
