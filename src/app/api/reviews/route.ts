import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { format } from "date-fns";

const reviewSchema = z.object({
  date: z.string(),
  wentWell: z.string().nullable().optional(),
  wastedTime: z.string().nullable().optional(),
  wasDifficult: z.string().nullable().optional(),
  improveNext: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (date) {
    const review = await prisma.dailyReview.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
      },
    });
    return NextResponse.json({ review });
  }

  const reviews = await prisma.dailyReview.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const review = await prisma.dailyReview.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      create: {
        userId: session.user.id,
        date,
        wentWell: data.wentWell ?? null,
        wastedTime: data.wastedTime ?? null,
        wasDifficult: data.wasDifficult ?? null,
        improveNext: data.improveNext ?? null,
      },
      update: {
        wentWell: data.wentWell ?? null,
        wastedTime: data.wastedTime ?? null,
        wasDifficult: data.wasDifficult ?? null,
        improveNext: data.improveNext ?? null,
      },
    });

    return NextResponse.json(review);
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
