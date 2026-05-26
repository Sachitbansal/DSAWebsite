export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  const date = new Date(dateParam + "T12:00:00");
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      startTime: { gte: dayStart, lte: dayEnd },
    },
  });

  // Compute minutes of DSA per hour slot 0–23
  const hourMap: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = 0;

  for (const s of sessions) {
    if (!s.endTime) continue;
    const sessionStart = new Date(s.startTime).getTime();
    const sessionEnd = new Date(s.endTime).getTime();

    for (let h = 0; h < 24; h++) {
      const hourStart = dayStart.getTime() + h * 3600000;
      const hourEnd = hourStart + 3600000;
      const overlap = Math.min(sessionEnd, hourEnd) - Math.max(sessionStart, hourStart);
      if (overlap > 0) {
        hourMap[h] += overlap / 60000; // ms → minutes
      }
    }
  }

  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    minutes: Math.round(hourMap[h] * 10) / 10,
  }));

  return NextResponse.json({ hourly });
}
