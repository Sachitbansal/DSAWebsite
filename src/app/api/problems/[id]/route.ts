import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getRevisionDate } from "@/lib/utils";

const updateProblemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  platform: z
    .enum(["LEETCODE", "CODEFORCES", "ATCODER", "HACKERRANK", "GFGS", "STRIVER", "OTHER"])
    .optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  topics: z.array(z.string()).optional(),
  solvedIndependently: z.boolean().optional(),
  timeTaken: z.number().int().positive().nullable().optional(),
  confidenceRating: z.number().int().min(1).max(5).optional(),
  notes: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const problem = await prisma.problem.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { revisions: true },
  });

  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(problem);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.problem.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateProblemSchema.parse(body);

    const updated = await prisma.problem.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.problem.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.problem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

// PATCH for marking revision done
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.problem.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const action = body.action;

  if (action === "markRevision") {
    const newRevisionCount = existing.revisionCount + 1;
    const nextDate = getRevisionDate(new Date(), newRevisionCount);

    const [problem] = await prisma.$transaction([
      prisma.problem.update({
        where: { id: params.id },
        data: {
          revisionCount: newRevisionCount,
          nextRevisionDate: nextDate,
          confidenceRating: body.confidenceAfter ?? existing.confidenceRating,
        },
      }),
      prisma.revision.create({
        data: {
          problemId: params.id,
          userId: session.user.id,
          notes: body.notes ?? null,
          confidenceAfter: body.confidenceAfter ?? existing.confidenceRating,
        },
      }),
    ]);

    return NextResponse.json(problem);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
