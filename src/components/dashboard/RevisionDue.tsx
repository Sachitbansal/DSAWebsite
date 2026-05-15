"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { getDifficultyColor, formatPlatform } from "@/lib/utils";
import type { Problem } from "@/types";

interface RevisionDueProps {
  problems: Problem[];
}

export function RevisionDue({ problems }: RevisionDueProps) {
  if (!problems.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
        <RefreshCw className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">No revisions due today</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {problems.map((problem) => (
        <div
          key={problem.id}
          className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}
              >
                {problem.difficulty}
              </span>
              <span className="text-xs text-zinc-500">
                {formatPlatform(problem.platform)}
              </span>
            </div>
            <p className="text-sm text-zinc-200 truncate">{problem.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Revision #{problem.revisionCount + 1}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-3">
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                Open
              </a>
            )}
            <Link href={`/revisions?mark=${problem.id}`}>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Mark Done
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
