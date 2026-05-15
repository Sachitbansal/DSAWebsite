"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProblemTable } from "@/components/problems/ProblemTable";
import { AddProblemModal } from "@/components/problems/AddProblemModal";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Plus, Code2 } from "lucide-react";
import type { Problem } from "@/types";

interface ProblemsData {
  problems: Problem[];
}

export default function ProblemsPage() {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = useQuery<ProblemsData>({
    queryKey: ["problems"],
    queryFn: async () => {
      const res = await fetch("/api/problems");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const problems = data?.problems ?? [];

  // Stats
  const easy = problems.filter((p) => p.difficulty === "EASY").length;
  const medium = problems.filter((p) => p.difficulty === "MEDIUM").length;
  const hard = problems.filter((p) => p.difficulty === "HARD").length;

  return (
    <AppLayout>
      <div className="p-6 space-y-5 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Problems</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {problems.length} total ·{" "}
              <span className="text-emerald-500">{easy}E</span> ·{" "}
              <span className="text-amber-500">{medium}M</span> ·{" "}
              <span className="text-red-500">{hard}H</span>
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Problem
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-zinc-900/50 border border-zinc-800 rounded animate-pulse"
              />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Code2 className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-base mb-1">No problems yet</p>
            <p className="text-sm mb-4">
              Start tracking your solved problems
            </p>
            <Button onClick={() => setShowModal(true)} variant="outline">
              Add your first problem
            </Button>
          </div>
        ) : (
          <ProblemTable problems={problems} onRefresh={refetch} />
        )}

        <AddProblemModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => refetch()}
        />
      </div>
    </AppLayout>
  );
}
