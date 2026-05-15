import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEntrySchema = z.object({
  title: z.string().min(1).max(255),
  problemId: z.string().nullable().optional(),
  initialThought: z.string().nullable().optional(),
  stuckPoint: z.string().nullable().optional(),
  wrongIntuition: z.string().nullable().optional(),
  correctIntuition: z.string().nullable().optional(),
  missedPattern: z.string().nullable().optional(),
  implementationBug: z.string().nullable().optional(),
  edgeCaseMissed: z.string().nullable().optional(),
  learningOutcome: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { learningOutcome: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createEntrySchema.parse(body);

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(entry, { status: 201 });
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
