import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getMondayOfWeek(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart") ?? getMondayOfWeek();

  const slots = await prisma.weekSlot.findMany({
    where: { weekStart },
    include: { recipe: true },
  });
  return NextResponse.json({ weekStart, slots });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { weekStart, day, meal, recipeId, note } = body;

  const slot = await prisma.weekSlot.upsert({
    where: { weekStart_day_meal: { weekStart, day, meal } },
    create: { weekStart, day, meal, recipeId: recipeId ?? null, note: note ?? null },
    update: { recipeId: recipeId ?? null, note: note ?? null },
    include: { recipe: true },
  });
  return NextResponse.json(slot);
}
