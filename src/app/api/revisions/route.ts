import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayEnd = endOfDay(now);
  const tomorrowEnd = endOfDay(addDays(now, 7));

  // Due today or overdue
  const dueTodayOrOverdue = await prisma.problem.findMany({
    where: {
      userId: session.user.id,
      nextRevisionDate: {
        lte: todayEnd,
      },
    },
    orderBy: { nextRevisionDate: "asc" },
  });

  // Upcoming (next 7 days)
  const upcoming = await prisma.problem.findMany({
    where: {
      userId: session.user.id,
      nextRevisionDate: {
        gt: todayEnd,
        lte: tomorrowEnd,
      },
    },
    orderBy: { nextRevisionDate: "asc" },
  });

  const overdue = dueTodayOrOverdue.filter(
    (p) =>
      p.nextRevisionDate &&
      p.nextRevisionDate < startOfDay(now)
  );

  const dueToday = dueTodayOrOverdue.filter(
    (p) =>
      p.nextRevisionDate &&
      p.nextRevisionDate >= startOfDay(now) &&
      p.nextRevisionDate <= todayEnd
  );

  return NextResponse.json({
    overdue,
    dueToday,
    upcoming,
    totalDue: dueTodayOrOverdue.length,
  });
}
