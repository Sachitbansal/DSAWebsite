"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDifficultyColor,
  formatPlatform,
  formatRelativeDate,
  getConfidenceLabel,
} from "@/lib/utils";
import { ExternalLink, Search, SortAsc, SortDesc, Filter, CheckCircle2, XCircle } from "lucide-react";
import type { Problem, Difficulty, Platform } from "@/types";

interface ProblemTableProps {
  problems: Problem[];
  onRefresh: () => void;
}

type SortField = "name" | "dateSolved" | "difficulty" | "timeTaken" | "revisionCount" | "confidenceRating";
type SortDir = "asc" | "desc";

export function ProblemTable({ problems, onRefresh }: ProblemTableProps) {
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState<Difficulty | "ALL">("ALL");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "ALL">("ALL");
  const [filterTopic, setFilterTopic] = useState("ALL");
  const [filterIndependent, setFilterIndependent] = useState<"ALL" | "YES" | "NO">("ALL");
  const [sortField, setSortField] = useState<SortField>("dateSolved");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique topics
  const allTopics = Array.from(
    new Set(problems.flatMap((p) => p.topics))
  ).sort();

  // Filter
  const filtered = problems.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = filterDiff === "ALL" || p.difficulty === filterDiff;
    const matchPlatform =
      filterPlatform === "ALL" || p.platform === filterPlatform;
    const matchTopic =
      filterTopic === "ALL" || p.topics.includes(filterTopic);
    const matchIndependent =
      filterIndependent === "ALL" ||
      (filterIndependent === "YES" ? p.solvedIndependently : !p.solvedIndependently);

    return (
      matchSearch && matchDiff && matchPlatform && matchTopic && matchIndependent
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number | Date = a[sortField] as string | number | Date;
    let bVal: string | number | Date = b[sortField] as string | number | Date;

    if (sortField === "dateSolved") {
      aVal = new Date(a.dateSolved).getTime();
      bVal = new Date(b.dateSolved).getTime();
    } else if (sortField === "difficulty") {
      const order = { EASY: 0, MEDIUM: 1, HARD: 2 };
      aVal = order[a.difficulty];
      bVal = order[b.difficulty];
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <SortAsc className="h-3 w-3" />
    ) : (
      <SortDesc className="h-3 w-3" />
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this problem?")) return;
    await fetch(`/api/problems/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="pl-9 bg-zinc-900 border-zinc-700"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`border-zinc-700 ${showFilters ? "bg-zinc-800" : ""}`}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-zinc-900/50 rounded-md border border-zinc-800">
          <Select
            value={filterDiff}
            onValueChange={(v) => setFilterDiff(v as Difficulty | "ALL")}
          >
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700 h-8 text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPlatform}
            onValueChange={(v) => setFilterPlatform(v as Platform | "ALL")}
          >
            <SelectTrigger className="w-36 bg-zinc-900 border-zinc-700 h-8 text-xs">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Platforms</SelectItem>
              <SelectItem value="LEETCODE">LeetCode</SelectItem>
              <SelectItem value="CODEFORCES">Codeforces</SelectItem>
              <SelectItem value="STRIVER">Striver</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterTopic}
            onValueChange={setFilterTopic}
          >
            <SelectTrigger className="w-36 bg-zinc-900 border-zinc-700 h-8 text-xs">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Topics</SelectItem>
              {allTopics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterIndependent}
            onValueChange={(v) =>
              setFilterIndependent(v as "ALL" | "YES" | "NO")
            }
          >
            <SelectTrigger className="w-36 bg-zinc-900 border-zinc-700 h-8 text-xs">
              <SelectValue placeholder="Solved" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="YES">Independent</SelectItem>
              <SelectItem value="NO">With Help</SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-auto text-xs text-zinc-500 self-center">
            {sorted.length} / {problems.length}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th
                className="text-left px-4 py-2.5 text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 whitespace-nowrap"
                onClick={() => handleSort("name")}
              >
                <span className="flex items-center gap-1">
                  Problem <SortIcon field="name" />
                </span>
              </th>
              <th
                className="text-left px-3 py-2.5 text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 whitespace-nowrap"
                onClick={() => handleSort("difficulty")}
              >
                <span className="flex items-center gap-1">
                  Diff <SortIcon field="difficulty" />
                </span>
              </th>
              <th className="text-left px-3 py-2.5 text-zinc-500 font-medium whitespace-nowrap">
                Topics
              </th>
              <th
                className="text-left px-3 py-2.5 text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 whitespace-nowrap"
                onClick={() => handleSort("timeTaken")}
              >
                <span className="flex items-center gap-1">
                  Time <SortIcon field="timeTaken" />
                </span>
              </th>
              <th
                className="text-left px-3 py-2.5 text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 whitespace-nowrap"
                onClick={() => handleSort("confidenceRating")}
              >
                <span className="flex items-center gap-1">
                  Conf <SortIcon field="confidenceRating" />
                </span>
              </th>
              <th
                className="text-left px-3 py-2.5 text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 whitespace-nowrap"
                onClick={() => handleSort("revisionCount")}
              >
                <span className="flex items-center gap-1">
                  Rev <SortIcon field="revisionCount" />
                </span>
              </th>
              <th
                className="text-left px-3 py-2.5 text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 whitespace-nowrap"
                onClick={() => handleSort("dateSolved")}
              >
                <span className="flex items-center gap-1">
                  Date <SortIcon field="dateSolved" />
                </span>
              </th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-12 text-zinc-600"
                >
                  No problems found
                </td>
              </tr>
            ) : (
              sorted.map((problem) => (
                <tr
                  key={problem.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {problem.solvedIndependently ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-zinc-200">
                          {problem.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {formatPlatform(problem.platform)}
                        </div>
                      </div>
                      {problem.url && (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-zinc-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {problem.topics.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                      {problem.topics.length > 2 && (
                        <span className="text-[10px] text-zinc-600">
                          +{problem.topics.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-400 text-xs font-mono">
                    {problem.timeTaken ? `${problem.timeTaken}m` : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`w-1.5 h-1.5 rounded-full ${
                            n <= problem.confidenceRating
                              ? "bg-zinc-300"
                              : "bg-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-400 text-xs font-mono">
                    {problem.revisionCount}x
                  </td>
                  <td className="px-3 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {formatRelativeDate(problem.dateSolved)}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(problem.id)}
                      className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
