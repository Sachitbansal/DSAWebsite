import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, TrendingUp, Zap } from "lucide-react";
import { formatHrMin } from "@/lib/utils";

interface StatsCardsProps {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  todayHours: number;
  weekHours: number;
}

export function StatsCards({
  totalHours,
  currentStreak,
  longestStreak,
  todayHours,
  weekHours,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Today",
      value: formatHrMin(todayHours),
      sub: "focused",
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "This Week",
      value: formatHrMin(weekHours),
      sub: "this week",
      icon: TrendingUp,
      color: "text-violet-400",
    },
    {
      label: "Streak",
      value: `${currentStreak}d`,
      sub: `best: ${longestStreak}d`,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Total",
      value: formatHrMin(totalHours),
      sub: "all time",
      icon: Zap,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                  <p className="text-xl font-mono font-semibold text-zinc-100 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{stat.sub}</p>
                </div>
                <Icon className={`h-4 w-4 ${stat.color} mt-0.5`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
