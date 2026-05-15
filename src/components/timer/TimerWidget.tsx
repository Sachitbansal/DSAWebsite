"use client";

import React, { useEffect, useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import {
  formatDuration,
  formatHours,
  formatSessionLabel,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Square, Clock } from "lucide-react";
import type { SessionLabel, Session } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const SESSION_LABELS: SessionLabel[] = [
  "LEETCODE",
  "STRIVER",
  "REVISION",
  "CONTEST",
  "NOTES",
  "DEBUGGING",
  "MOCK_INTERVIEW",
];

interface TodaySessions {
  sessions: Session[];
  totalSeconds: number;
}

export function TimerWidget() {
  const {
    elapsed,
    running,
    paused,
    label,
    sessionNotes,
    setLabel,
    setSessionNotes,
    start,
    pause,
    resume,
    stop,
  } = useTimer();

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

  const totalTodaySeconds =
    (todayData?.totalSeconds ?? 0) + (running || paused ? elapsed : 0);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Timer display */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-7xl font-mono tabular-nums text-zinc-100 tracking-wider timer-display">
          {formatDuration(elapsed)}
        </div>

        {(running || paused) && (
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${running ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            />
            <span className="text-sm text-zinc-400">
              {running ? "Running" : "Paused"} ·{" "}
              {formatSessionLabel(label)}
            </span>
          </div>
        )}

        {!running && !paused && (
          <div className="text-sm text-zinc-500">Ready to start</div>
        )}
      </div>

      {/* Session label */}
      <div className="w-full max-w-xs">
        <Select
          value={label}
          onValueChange={(v) => setLabel(v as SessionLabel)}
          disabled={running || paused}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_LABELS.map((l) => (
              <SelectItem key={l} value={l}>
                {formatSessionLabel(l)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!running && !paused && (
          <Button
            onClick={start}
            size="lg"
            className="px-10 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
          >
            <Play className="h-5 w-5 mr-2" />
            Start
          </Button>
        )}

        {running && (
          <>
            <Button
              onClick={pause}
              size="lg"
              variant="outline"
              className="px-8 border-zinc-700"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleStop}
              size="lg"
              variant="outline"
              className="px-8 border-red-800 text-red-400 hover:bg-red-950"
              disabled={stopping}
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {paused && (
          <>
            <Button
              onClick={resume}
              size="lg"
              className="px-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Resume
            </Button>
            <Button
              onClick={handleStop}
              size="lg"
              variant="outline"
              className="px-8 border-red-800 text-red-400 hover:bg-red-950"
              disabled={stopping}
            >
              <Square className="h-5 w-5 mr-2" />
              Stop & Save
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
            className="bg-zinc-900 border-zinc-700 text-zinc-200 resize-none h-20 text-sm"
          />
        </div>
      )}

      {/* Today stats */}
      <div className="w-full max-w-md border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-400">Today</span>
          <span className="ml-auto font-mono text-zinc-200">
            {formatDuration(totalTodaySeconds)}
          </span>
        </div>

        {todayData?.sessions.length ? (
          <div className="space-y-2">
            {todayData.sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between text-xs text-zinc-500"
              >
                <span>{formatSessionLabel(session.label)}</span>
                <span className="font-mono">
                  {formatDuration(session.duration ?? 0)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600 text-center">
            No sessions yet today
          </p>
        )}
      </div>
    </div>
  );
}
