export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, endOfWeek, eachWeekOfInterval, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { startTime: "asc" },
  });

  const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Daily activity map
  const dailyMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = format(new Date(s.startTime), "yyyy-MM-dd");
    dailyMap[day] = (dailyMap[day] ?? 0) + (s.duration ?? 0) / 3600;
  });

  const dailyActivity = Object.entries(dailyMap)
    .map(([date, hours]) => ({ date, hours: Math.round(hours * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Weekly hours (last 12 weeks)
  const weekStart = subDays(today, 12 * 7);
  const weeks = eachWeekOfInterval({ start: weekStart, end: today });
  const weeklyHours = weeks.map((weekDate) => {
    const weekEnd = endOfWeek(weekDate);
    const hours = sessions
      .filter((s) => {
        const d = new Date(s.startTime);
        return d >= weekDate && d <= weekEnd;
      })
      .reduce((sum, s) => sum + (s.duration ?? 0) / 3600, 0);
    return {
      week: format(weekDate, "MMM d"),
      hours: Math.round(hours * 10) / 10,
    };
  });

  // Last 7 days — daily hours for the bar chart
  const dailyWeek = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const hours = sessions
      .filter((s) => {
        const d = new Date(s.startTime);
        return d >= dayStart && d <= dayEnd;
      })
      .reduce((sum, s) => sum + (s.duration ?? 0) / 3600, 0);
    return {
      day: format(date, "EEE"),
      date: dateStr,
      hours: Math.round(hours * 10) / 10,
    };
  });

  // Streak (session days only)
  const activeDays = new Set(
    sessions.map((s) => format(new Date(s.startTime), "yyyy-MM-dd"))
  );

  let currentStreak = 0;
  for (let i = 0; i <= 365; i++) {
    const day = format(subDays(today, i), "yyyy-MM-dd");
    if (activeDays.has(day)) {
      currentStreak++;
    } else if (i === 0) {
      // today not active, allow — check yesterday
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDays = Array.from(activeDays).sort();
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const completedSessions = sessions.filter((s) => s.duration && s.duration > 0);
  const avgSessionLength =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0) /
            completedSessions.length
        )
      : 0;

  return NextResponse.json({
    totalHours,
    totalSessions: sessions.length,
    currentStreak,
    longestStreak,
    avgSessionLength,
    weeklyHours,
    dailyActivity,
    dailyWeek,
  });
}
