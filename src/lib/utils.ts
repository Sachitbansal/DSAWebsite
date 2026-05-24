import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday, isYesterday } from "date-fns";

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

export function formatHrMin(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0 && m === 0) return "0 min";
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
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
    MANUAL: "Manual",
  };
  return labels[label] ?? label;
}

interface DailyEntry {
  date: string;
  hours: number;
}

export function generateHeatmapData(
  dailyStats: DailyEntry[]
): { date: string; count: number; hours: number }[] {
  const statsMap = new Map<string, number>();
  dailyStats.forEach((s) => {
    statsMap.set(format(new Date(s.date), "yyyy-MM-dd"), s.hours);
  });

  const result = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const hours = statsMap.get(dateStr) ?? 0;

    result.push({
      date: dateStr,
      count: hours > 0 ? Math.min(Math.ceil(hours), 4) : 0,
      hours,
    });
  }

  return result;
}
