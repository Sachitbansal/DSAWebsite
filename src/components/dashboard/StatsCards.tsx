import React from "react";
import { Flame, Clock, TrendingUp, Zap } from "lucide-react";
import { formatHrMin } from "@/lib/utils";

interface StatsCardsProps {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  todayHours: number;
  weekHours: number;
}

const cards = [
  {
    key: "today",
    label: "Today",
    icon: Clock,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10 border-blue-400/20",
    accent: "from-blue-500/5 to-transparent",
    border: "border-blue-500/15",
  },
  {
    key: "week",
    label: "This Week",
    icon: TrendingUp,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10 border-violet-400/20",
    accent: "from-violet-500/5 to-transparent",
    border: "border-violet-500/15",
  },
  {
    key: "streak",
    label: "Streak",
    icon: Flame,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10 border-orange-400/20",
    accent: "from-orange-500/5 to-transparent",
    border: "border-orange-500/15",
  },
  {
    key: "total",
    label: "All Time",
    icon: Zap,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
    accent: "from-emerald-500/5 to-transparent",
    border: "border-emerald-500/15",
  },
];

export function StatsCards({ totalHours, currentStreak, longestStreak, todayHours, weekHours }: StatsCardsProps) {
  const values = {
    today: { value: formatHrMin(todayHours), sub: "focused today" },
    week: { value: formatHrMin(weekHours), sub: "this week" },
    streak: { value: `${currentStreak}d`, sub: `best: ${longestStreak}d` },
    total: { value: formatHrMin(totalHours), sub: "all time" },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const { value, sub } = values[card.key as keyof typeof values];
        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-xl border bg-zinc-900/50 p-4 sm:p-5 ${card.border}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} pointer-events-none`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{card.label}</p>
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg border ${card.iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 leading-none">
                {value}
              </p>
              <p className="text-xs text-zinc-600 mt-1.5">{sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
