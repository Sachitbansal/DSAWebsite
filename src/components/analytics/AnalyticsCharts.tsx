"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WeeklyStats, TopicStats } from "@/types";

const COLORS = [
  "#52525b", "#71717a", "#a1a1aa", "#d4d4d8",
  "#18181b", "#3f3f46", "#27272a", "#e4e4e7",
];

const DIFF_COLORS = {
  Easy: "#34d399",
  Medium: "#fbbf24",
  Hard: "#f87171",
};

interface WeeklyChartProps {
  data: WeeklyStats[];
}

export function WeeklyHoursChart({ data }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="week"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "6px",
            color: "#e4e4e7",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#a1a1aa"
          strokeWidth={2}
          dot={{ fill: "#a1a1aa", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface TopicChartProps {
  data: TopicStats[];
}

export function TopicPieChart({ data }: TopicChartProps) {
  const top8 = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={top8}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="count"
          nameKey="topic"
        >
          {top8.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "6px",
            color: "#e4e4e7",
            fontSize: "12px",
          }}
          formatter={(value, name) => [`${value} problems`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#a1a1aa", fontSize: "11px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface DifficultyChartProps {
  easy: number;
  medium: number;
  hard: number;
}

export function DifficultyBarChart({ easy, medium, hard }: DifficultyChartProps) {
  const data = [
    { name: "Easy", count: easy, fill: DIFF_COLORS.Easy },
    { name: "Medium", count: medium, fill: DIFF_COLORS.Medium },
    { name: "Hard", count: hard, fill: DIFF_COLORS.Hard },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "6px",
            color: "#e4e4e7",
            fontSize: "12px",
          }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ProblemsOverTimeProps {
  data: { date: string; cumulative: number }[];
}

export function ProblemsOverTimeChart({ data }: ProblemsOverTimeProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "6px",
            color: "#e4e4e7",
            fontSize: "12px",
          }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="cumulative" fill="#52525b" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
