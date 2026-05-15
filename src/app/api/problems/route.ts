import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getRevisionDate } from "@/lib/utils";

const createProblemSchema = z.object({
  name: z.string().min(1).max(255),
  platform: z
    .enum(["LEETCODE", "CODEFORCES", "ATCODER", "HACKERRANK", "GFGS", "STRIVER", "OTHER"])
    .default("LEETCODE"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  topics: z.array(z.string()).default([]),
  solvedIndependently: z.boolean().default(true),
  timeTaken: z.number().int().positive().nullable().optional(),
  confidenceRating: z.number().int().min(1).max(5).default(3),
  notes: z.string().nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal("")),
  dateSolved: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dueToday = searchParams.get("dueToday");

  if (dueToday === "true") {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const problems = await prisma.problem.findMany({
      where: {
        userId: session.user.id,
        nextRevisionDate: {
          lte: today,
        },
      },
      orderBy: { nextRevisionDate: "asc" },
    });

    return NextResponse.json({ problems });
  }

  const problems = await prisma.problem.findMany({
    where: { userId: session.user.id },
    orderBy: { dateSolved: "desc" },
  });

  return NextResponse.json({ problems });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createProblemSchema.parse(body);

    const dateSolved = data.dateSolved ? new Date(data.dateSolved) : new Date();
    const nextRevisionDate = getRevisionDate(dateSolved, 0);

    const problem = await prisma.problem.create({
      data: {
        userId: session.user.id,
        name: data.name,
        platform: data.platform,
        difficulty: data.difficulty,
        topics: data.topics,
        solvedIndependently: data.solvedIndependently,
        timeTaken: data.timeTaken ?? null,
        confidenceRating: data.confidenceRating,
        notes: data.notes ?? null,
        url: data.url || null,
        dateSolved,
        nextRevisionDate,
        revisionCount: 0,
      },
    });

    return NextResponse.json(problem, { status: 201 });
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
