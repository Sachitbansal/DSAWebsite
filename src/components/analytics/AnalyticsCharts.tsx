"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DailyLineChartProps {
  data: { label: string; date: string; hours: number }[];
  onPointClick: (date: string) => void;
}

export function DailyLineChart({ data, onPointClick }: DailyLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        onClick={(e) => {
          if (e?.activePayload?.[0]) {
            const d = e.activePayload[0].payload as { date: string };
            onPointClick(d.date);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1a0030" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0c001e",
            border: "1px solid #2a0050",
            borderRadius: "6px",
            color: "#e4e4e7",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#a1a1aa" }}
          formatter={(value) => [`${value}h`, "Hours"]}
          cursor={{ stroke: "#3f3f46" }}
        />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 3 }}
          activeDot={{ r: 5, fill: "#60a5fa" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface HourlyChartProps {
  data: { hour: number; minutes: number }[];
}

const HOUR_LABELS: Record<number, string> = {
  0: "12a",
  6: "6a",
  12: "12p",
  18: "6p",
  23: "11p",
};

export function HourlyChart({ data }: HourlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a0030" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fill: "#71717a", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(h) => HOUR_LABELS[h as number] ?? ""}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}m`}
        />
        <Tooltip
          contentStyle={{
            background: "#0c001e",
            border: "1px solid #2a0050",
            borderRadius: "6px",
            color: "#e4e4e7",
            fontSize: "12px",
          }}
          labelFormatter={(h) => {
            const hour = h as number;
            const suffix = hour < 12 ? "am" : "pm";
            const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${display}:00 ${suffix}`;
          }}
          formatter={(value) => [`${value}m`, "DSA"]}
          cursor={{ fill: "#27272a" }}
        />
        <Bar dataKey="minutes" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.minutes > 0 ? "#3b82f6" : "#1e1e2e"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
