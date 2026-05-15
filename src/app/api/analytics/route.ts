import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all data in parallel
  const [sessions, problems, revisions] = await Promise.all([
    prisma.session.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
    }),
    prisma.problem.findMany({
      where: { userId },
      orderBy: { dateSolved: "asc" },
    }),
    prisma.revision.findMany({
      where: { userId },
    }),
  ]);

  // Total hours
  const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const totalHours = totalSeconds / 3600;

  // Total problems
  const totalProblems = problems.length;

  // Problems by difficulty
  const problemsByDifficulty = {
    easy: problems.filter((p) => p.difficulty === "EASY").length,
    medium: problems.filter((p) => p.difficulty === "MEDIUM").length,
    hard: problems.filter((p) => p.difficulty === "HARD").length,
  };

  // Problems by topic
  const topicCount: Record<string, number> = {};
  problems.forEach((p) => {
    p.topics.forEach((t) => {
      topicCount[t] = (topicCount[t] ?? 0) + 1;
    });
  });
  const problemsByTopic = Object.entries(topicCount)
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: Math.round((count / totalProblems) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Daily activity (last 365 days)
  const today = new Date();
  const dailyMap: Record<string, { hours: number; problems: number; revisions: number }> =
    {};

  sessions.forEach((s) => {
    const day = format(new Date(s.startTime), "yyyy-MM-dd");
    if (!dailyMap[day]) dailyMap[day] = { hours: 0, problems: 0, revisions: 0 };
    dailyMap[day].hours += (s.duration ?? 0) / 3600;
  });

  problems.forEach((p) => {
    const day = format(new Date(p.dateSolved), "yyyy-MM-dd");
    if (!dailyMap[day]) dailyMap[day] = { hours: 0, problems: 0, revisions: 0 };
    dailyMap[day].problems += 1;
  });

  revisions.forEach((r) => {
    const day = format(new Date(r.revisedAt), "yyyy-MM-dd");
    if (!dailyMap[day]) dailyMap[day] = { hours: 0, problems: 0, revisions: 0 };
    dailyMap[day].revisions += 1;
  });

  const dailyActivity = Object.entries(dailyMap)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Weekly hours (last 12 weeks)
  const weekStart = subDays(today, 12 * 7);
  const weeks = eachWeekOfInterval({ start: weekStart, end: today });
  const weeklyHours = weeks.map((weekDate) => {
    const weekEnd = endOfWeek(weekDate);
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.startTime);
      return d >= weekDate && d <= weekEnd;
    });
    const hours = weekSessions.reduce(
      (sum, s) => sum + (s.duration ?? 0) / 3600,
      0
    );
    const problemCount = problems.filter((p) => {
      const d = new Date(p.dateSolved);
      return d >= weekDate && d <= weekEnd;
    }).length;

    return {
      week: format(weekDate, "MMM d"),
      hours: Math.round(hours * 10) / 10,
      problems: problemCount,
    };
  });

  // Streak calculation
  const activeDays = new Set(
    [...sessions.map((s) => format(new Date(s.startTime), "yyyy-MM-dd")),
     ...problems.map((p) => format(new Date(p.dateSolved), "yyyy-MM-dd"))]
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check streak going backwards from today
  for (let i = 0; i <= 365; i++) {
    const day = format(subDays(today, i), "yyyy-MM-dd");
    if (activeDays.has(day)) {
      if (i === 0 || currentStreak > 0) currentStreak++;
    } else if (currentStreak > 0) {
      break;
    } else if (i === 0) {
      // Today not active, check yesterday
    }
  }

  // Longest streak
  const sortedDays = Array.from(activeDays).sort();
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Avg session length
  const completedSessions = sessions.filter((s) => s.duration && s.duration > 0);
  const avgSessionLength =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0) /
        completedSessions.length
      : 0;

  // Revision completion rate
  const duePastProblems = problems.filter(
    (p) => p.nextRevisionDate && p.nextRevisionDate <= today
  ).length;
  const revisedCount = revisions.length;
  const revisionCompletionRate =
    duePastProblems > 0
      ? Math.min(100, Math.round((revisedCount / duePastProblems) * 100))
      : 100;

  // Problems over time (cumulative monthly)
  const monthlyMap: Record<string, number> = {};
  problems.forEach((p) => {
    const month = format(new Date(p.dateSolved), "MMM yy");
    monthlyMap[month] = (monthlyMap[month] ?? 0) + 1;
  });
  let cumulative = 0;
  const problemsOverTime = Object.entries(monthlyMap).map(([date, count]) => {
    cumulative += count;
    return { date, cumulative };
  });

  return NextResponse.json({
    totalHours: Math.round(totalHours * 10) / 10,
    totalProblems,
    totalSessions: sessions.length,
    currentStreak,
    longestStreak,
    avgSessionLength: Math.round(avgSessionLength),
    problemsByDifficulty,
    problemsByTopic,
    weeklyHours,
    dailyActivity,
    revisionCompletionRate,
    problemsOverTime,
  });
}
