import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, Code2, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalHours: number;
  totalProblems: number;
  currentStreak: number;
  longestStreak: number;
  todayHours: number;
  todayProblems: number;
  weekHours: number;
}

export function StatsCards({
  totalHours,
  totalProblems,
  currentStreak,
  longestStreak,
  todayHours,
  todayProblems,
  weekHours,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Today",
      value: `${todayHours.toFixed(1)}h`,
      sub: `${todayProblems} problems`,
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "This Week",
      value: `${weekHours.toFixed(1)}h`,
      sub: "focused study",
      icon: TrendingUp,
      color: "text-violet-400",
    },
    {
      label: "Current Streak",
      value: `${currentStreak}d`,
      sub: `best: ${longestStreak}d`,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Total Problems",
      value: totalProblems.toString(),
      sub: `${totalHours.toFixed(0)}h total`,
      icon: Code2,
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
                  <p className="text-2xl font-mono font-semibold text-zinc-100">
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
