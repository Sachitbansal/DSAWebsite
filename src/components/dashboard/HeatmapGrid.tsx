"use client";

import React, { useState } from "react";
import { format, getDay, startOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;
  count: number; // 0-4 intensity
  hours: number;
  problems: number;
}

interface HeatmapGridProps {
  data: HeatmapDay[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    hours: number;
    problems: number;
    x: number;
    y: number;
  } | null>(null);

  // Organize data into weeks
  const weeks: (HeatmapDay | null)[][] = [];

  if (data.length > 0) {
    // Find the start day of the first week
    const firstDate = new Date(data[0].date);
    const dayOfWeek = getDay(firstDate);

    let currentWeek: (HeatmapDay | null)[] = Array(dayOfWeek).fill(null);

    for (const day of data) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }

    // Pad last week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Get month labels
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((d) => d !== null);
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: MONTHS[month], weekIndex });
        lastMonth = month;
      }
    }
  });

  const getColorClass = (count: number) => {
    switch (count) {
      case 0: return "heatmap-0";
      case 1: return "heatmap-1";
      case 2: return "heatmap-2";
      case 3: return "heatmap-3";
      case 4: return "heatmap-4";
      default: return "heatmap-0";
    }
  };

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex ml-8 mb-1">
        {weeks.map((_, weekIndex) => {
          const label = monthLabels.find((m) => m.weekIndex === weekIndex);
          return (
            <div key={weekIndex} className="w-[13px] flex-shrink-0">
              {label && (
                <span className="text-[10px] text-zinc-500">{label.month}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1">
          {DAYS.map((day, i) => (
            <div key={day} className="h-[11px] text-[9px] text-zinc-600 leading-[11px]">
              {i % 2 === 1 ? day.slice(0, 3) : ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    "heatmap-cell cursor-pointer",
                    day ? getColorClass(day.count) : "heatmap-0 opacity-30"
                  )}
                  onMouseEnter={(e) => {
                    if (day) {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({
                        date: day.date,
                        hours: day.hours,
                        problems: day.problems,
                        x: rect.left,
                        y: rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-zinc-500 mr-1">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={cn("heatmap-cell", getColorClass(level))} />
        ))}
        <span className="text-[10px] text-zinc-500 ml-1">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs pointer-events-none"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 60,
          }}
        >
          <div className="font-medium text-zinc-100">
            {format(new Date(tooltip.date), "MMM d, yyyy")}
          </div>
          <div className="text-zinc-400">
            {tooltip.hours.toFixed(1)}h studied · {tooltip.problems} problems
          </div>
        </div>
      )}
    </div>
  );
}
