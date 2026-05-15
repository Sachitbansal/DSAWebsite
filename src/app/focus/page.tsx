"use client";

import React, { useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import {
  formatDuration,
  formatSessionLabel,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Square, X } from "lucide-react";
import Link from "next/link";
import type { SessionLabel } from "@/types";

const SESSION_LABELS: SessionLabel[] = [
  "LEETCODE",
  "STRIVER",
  "REVISION",
  "CONTEST",
  "NOTES",
  "DEBUGGING",
  "MOCK_INTERVIEW",
];

export default function FocusPage() {
  const {
    elapsed,
    running,
    paused,
    label,
    setLabel,
    start,
    pause,
    resume,
    stop,
  } = useTimer();

  // Prevent default keyboard shortcuts in focus mode
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Allow navigation away
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        if (running) pause();
        else if (paused) resume();
        else start();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [running, paused, start, pause, resume]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {/* Exit button */}
      <Link
        href="/timer"
        className="absolute top-6 right-6 text-zinc-700 hover:text-zinc-400 transition-colors"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* Status */}
      <div className="mb-8 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            running
              ? "bg-zinc-400 animate-pulse"
              : paused
              ? "bg-zinc-600"
              : "bg-zinc-800"
          }`}
        />
        <span className="text-zinc-600 text-sm tracking-widest uppercase text-xs">
          {running
            ? formatSessionLabel(label)
            : paused
            ? "Paused"
            : "Ready"}
        </span>
      </div>

      {/* Timer */}
      <div className="text-[96px] font-mono tabular-nums text-zinc-200 tracking-tight leading-none timer-display mb-12 select-none">
        {formatDuration(elapsed)}
      </div>

      {/* Session label selector (only when not running) */}
      {!running && !paused && (
        <div className="mb-8">
          <Select
            value={label}
            onValueChange={(v) => setLabel(v as SessionLabel)}
          >
            <SelectTrigger className="w-48 bg-transparent border-zinc-800 text-zinc-500 text-sm">
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
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!running && !paused && (
          <button
            onClick={start}
            className="w-14 h-14 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <Play className="h-6 w-6 ml-0.5" />
          </button>
        )}

        {running && (
          <>
            <button
              onClick={pause}
              className="w-14 h-14 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
            >
              <Pause className="h-5 w-5" />
            </button>
            <button
              onClick={() => stop()}
              className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 hover:border-red-900 hover:text-red-500 transition-colors"
            >
              <Square className="h-5 w-5" />
            </button>
          </>
        )}

        {paused && (
          <>
            <button
              onClick={resume}
              className="w-14 h-14 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
            >
              <Play className="h-6 w-6 ml-0.5" />
            </button>
            <button
              onClick={() => stop()}
              className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 hover:border-red-900 hover:text-red-500 transition-colors"
            >
              <Square className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Hint */}
      <p className="absolute bottom-6 text-zinc-800 text-xs">
        Space to play/pause · Esc to exit
      </p>
    </div>
  );
}
