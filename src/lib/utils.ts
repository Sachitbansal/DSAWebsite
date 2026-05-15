import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, parseISO, isToday, isYesterday } from "date-fns";
import type { DailyStats } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }
  return `${hours.toFixed(1)}h`;
}

export function calculateStreak(dailyStats: DailyStats[]): {
  current: number;
  longest: number;
} {
  if (!dailyStats.length) return { current: 0, longest: 0 };

  // Sort by date descending
  const sorted = [...dailyStats]
    .filter((d) => d.hours > 0 || d.problems > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!sorted.length) return { current: 0, longest: 0 };

  // Calculate current streak
  let current = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);
  for (const stat of sorted) {
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);
    const diff = differenceInDays(checkDate, statDate);

    if (diff === 0 || diff === 1) {
      current++;
      checkDate = statDate;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longest = 0;
  let tempStreak = 1;

  const ascSorted = [...sorted].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 1; i < ascSorted.length; i++) {
    const prev = new Date(ascSorted[i - 1].date);
    const curr = new Date(ascSorted[i].date);
    const diff = differenceInDays(curr, prev);

    if (diff === 1) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak, current);

  return { current, longest };
}

export function getRevisionDate(
  solvedDate: Date,
  revisionCount: number
): Date {
  const intervals = [2, 7, 21, 60]; // days
  const interval = intervals[Math.min(revisionCount, intervals.length - 1)];
  const date = new Date(solvedDate);
  date.setDate(date.getDate() + interval);
  return date;
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "text-emerald-400";
    case "MEDIUM":
      return "text-amber-400";
    case "HARD":
      return "text-red-400";
    default:
      return "text-zinc-400";
  }
}

export function getConfidenceLabel(rating: number): string {
  const labels = ["", "Very Low", "Low", "Medium", "High", "Very High"];
  return labels[rating] ?? "Unknown";
}

export function formatSessionLabel(label: string): string {
  const labels: Record<string, string> = {
    LEETCODE: "LeetCode",
    STRIVER: "Striver",
    REVISION: "Revision",
    CONTEST: "Contest",
    NOTES: "Notes",
    DEBUGGING: "Debugging",
    MOCK_INTERVIEW: "Mock Interview",
  };
  return labels[label] ?? label;
}

export function formatPlatform(platform: string): string {
  const platforms: Record<string, string> = {
    LEETCODE: "LeetCode",
    CODEFORCES: "Codeforces",
    ATCODER: "AtCoder",
    HACKERRANK: "HackerRank",
    GFGS: "GeeksForGeeks",
    STRIVER: "Striver",
    OTHER: "Other",
  };
  return platforms[platform] ?? platform;
}

export function generateHeatmapData(
  dailyStats: DailyStats[]
): { date: string; count: number; hours: number; problems: number }[] {
  const statsMap = new Map<string, DailyStats>();
  dailyStats.forEach((s) => {
    statsMap.set(format(new Date(s.date), "yyyy-MM-dd"), s);
  });

  const result = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const stats = statsMap.get(dateStr);

    result.push({
      date: dateStr,
      count: stats ? Math.min(Math.ceil(stats.hours), 4) : 0,
      hours: stats?.hours ?? 0,
      problems: stats?.problems ?? 0,
    });
  }

  return result;
}
