"use client";

import React, { useState } from "react";
import { format, getDay } from "date-fns";
import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;
  count: number;
  hours: number;
}

interface HeatmapGridProps {
  data: HeatmapDay[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const COLOR_CLASSES: Record<number, string> = {
  0: "heatmap-0",
  1: "heatmap-1",
  2: "heatmap-2",
  3: "heatmap-3",
  4: "heatmap-4",
};

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    hours: number;
    x: number;
    y: number;
  } | null>(null);

  // Build weeks array
  const weeks: (HeatmapDay | null)[][] = [];

  if (data.length > 0) {
    const firstDate = new Date(data[0].date + "T12:00:00");
    const dayOfWeek = getDay(firstDate);
    let currentWeek: (HeatmapDay | null)[] = Array(dayOfWeek).fill(null);

    for (const day of data) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  // Month label positions
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((d) => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date + "T12:00:00").getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: MONTHS[month], weekIndex });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="relative w-full select-none">
      {/* Outer wrapper: day-label column + grid column */}
      <div className="flex gap-1 w-full min-w-[340px]">

        {/* Day labels column — fixed width */}
        <div className="flex flex-col shrink-0 w-5 pt-4">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center text-[9px] text-zinc-700 font-medium"
              style={{ minHeight: 0 }}
            >
              {i % 2 === 1 ? d : ""}
            </div>
          ))}
        </div>

        {/* Grid + month labels stacked */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">

          {/* Month labels row — each slot is flex-1 matching its week column */}
          <div className="flex w-full gap-[2px]">
            {weeks.map((_, weekIndex) => {
              const label = monthLabels.find((m) => m.weekIndex === weekIndex);
              return (
                <div key={weekIndex} className="flex-1 min-w-0">
                  {label && (
                    <span className="text-[9px] text-zinc-500 font-medium whitespace-nowrap">{label.month}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Week columns */}
          <div className="flex w-full gap-[2px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex-1 flex flex-col gap-[2px] min-w-0">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      "heatmap-cell w-full aspect-square cursor-pointer transition-opacity",
                      day ? COLOR_CLASSES[day.count] ?? "heatmap-0" : "heatmap-0 opacity-25"
                    )}
                    onMouseEnter={(e) => {
                      if (day) {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({ date: day.date, hours: day.hours, x: rect.left, y: rect.top });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-zinc-600 mr-1">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={cn("heatmap-cell w-3 h-3", COLOR_CLASSES[level])} />
        ))}
        <span className="text-[10px] text-zinc-600 ml-1">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 56 }}
        >
          <div className="font-medium text-zinc-100">
            {format(new Date(tooltip.date + "T12:00:00"), "MMM d, yyyy")}
          </div>
          <div className="text-zinc-400">
            {tooltip.hours.toFixed(1)}h studied
          </div>
        </div>
      )}
    </div>
  );
}
