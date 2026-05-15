import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createNoteSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1).max(255),
  content: z.string().default(""),
  codeSnippets: z.array(z.any()).default([]),
  complexity: z.record(z.string()).default({}),
  tricks: z.string().nullable().optional(),
  edgeCases: z.string().nullable().optional(),
  templates: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const notes = await prisma.algorithmNote.findMany({
    where: {
      userId: session.user.id,
      ...(category ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createNoteSchema.parse(body);

    const note = await prisma.algorithmNote.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(note, { status: 201 });
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
