import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

const createSessionSchema = z.object({
  label: z.enum([
    "LEETCODE",
    "STRIVER",
    "REVISION",
    "CONTEST",
    "NOTES",
    "DEBUGGING",
    "MOCK_INTERVIEW",
  ]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const today = searchParams.get("today");
  const week = searchParams.get("week");

  let dateFilter = {};

  if (today === "true") {
    const now = new Date();
    dateFilter = {
      startTime: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    };
  } else if (week === "true") {
    const now = new Date();
    dateFilter = {
      startTime: {
        gte: startOfWeek(now),
        lte: endOfWeek(now),
      },
    };
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      ...dateFilter,
    },
    orderBy: { startTime: "desc" },
    take: today === "true" ? 20 : 50,
  });

  const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);

  return NextResponse.json({ sessions, totalSeconds });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSessionSchema.parse(body);

    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        label: data.label,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        duration: data.duration ?? null,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
