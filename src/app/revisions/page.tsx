"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  getDifficultyColor,
  formatPlatform,
  formatRelativeDate,
} from "@/lib/utils";
import { RefreshCw, AlertCircle, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import type { Problem } from "@/types";
import { useSearchParams } from "next/navigation";

interface RevisionData {
  overdue: Problem[];
  dueToday: Problem[];
  upcoming: Problem[];
  totalDue: number;
}

function ProblemRevisionCard({
  problem,
  onMarkDone,
}: {
  problem: Problem;
  onMarkDone: (id: string) => void;
}) {
  const [confidence, setConfidence] = useState("3");
  const [marking, setMarking] = useState(false);

  const handleMark = async () => {
    setMarking(true);
    await onMarkDone(problem.id);
    setMarking(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-zinc-600">
            {formatPlatform(problem.platform)}
          </span>
          <span className="text-xs text-zinc-600">
            Rev #{problem.revisionCount + 1}
          </span>
        </div>
        <p className="text-sm font-medium text-zinc-200">{problem.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {problem.topics.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {problem.url && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 p-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <Select value={confidence} onValueChange={setConfidence}>
          <SelectTrigger className="w-24 h-8 text-xs bg-zinc-900 border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 — Low</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3 — Med</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5 — High</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          onClick={handleMark}
          disabled={marking}
          className="h-8"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          {marking ? "..." : "Done"}
        </Button>
      </div>
    </div>
  );
}

export default function RevisionsPage() {
  const { data, isLoading, refetch } = useQuery<RevisionData>({
    queryKey: ["revisions"],
    queryFn: async () => {
      const res = await fetch("/api/revisions");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleMarkDone = async (problemId: string) => {
    await fetch(`/api/problems/${problemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRevision" }),
    });
    refetch();
  };

  const overdue = data?.overdue ?? [];
  const dueToday = data?.dueToday ?? [];
  const upcoming = data?.upcoming ?? [];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Revisions</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Spaced repetition queue
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-2">
              {data.totalDue > 0 ? (
                <span className="text-sm text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {data.totalDue} due
                </span>
              ) : (
                <span className="text-sm text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  All caught up
                </span>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Overdue */}
            {overdue.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-red-400 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Overdue ({overdue.length})
                </h2>
                <div className="space-y-2">
                  {overdue.map((p) => (
                    <ProblemRevisionCard
                      key={p.id}
                      problem={p}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Due Today */}
            {dueToday.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-amber-400 flex items-center gap-1.5 mb-2">
                  <Clock className="h-4 w-4" />
                  Due Today ({dueToday.length})
                </h2>
                <div className="space-y-2">
                  {dueToday.map((p) => (
                    <ProblemRevisionCard
                      key={p.id}
                      problem={p}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No due */}
            {overdue.length === 0 && dueToday.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <CheckCircle2 className="h-10 w-10 mb-2 text-emerald-600 opacity-60" />
                <p className="text-base text-zinc-400">All caught up!</p>
                <p className="text-sm mt-1">No revisions due today</p>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-zinc-400 flex items-center gap-1.5 mb-2">
                  <RefreshCw className="h-4 w-4" />
                  Upcoming — Next 7 Days ({upcoming.length})
                </h2>
                <div className="space-y-2">
                  {upcoming.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-zinc-800/50 opacity-70"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-xs ${getDifficultyColor(p.difficulty)}`}
                          >
                            {p.difficulty}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {formatPlatform(p.platform)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300">{p.name}</p>
                      </div>
                      <span className="text-xs text-zinc-500 flex-shrink-0">
                        {p.nextRevisionDate
                          ? formatRelativeDate(p.nextRevisionDate)
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
