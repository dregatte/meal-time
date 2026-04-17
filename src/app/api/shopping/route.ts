import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveShoppingList } from "@/lib/shopping";
import type { WeekSlotRow } from "@/types";

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart") ?? getMondayOfWeek();

  const [slots, inventoryItems] = await Promise.all([
    prisma.weekSlot.findMany({
      where: { weekStart, recipeId: { not: null } },
      include: { recipe: true },
    }),
    prisma.inventoryItem.findMany(),
  ]);

  const groups = deriveShoppingList(slots as WeekSlotRow[], inventoryItems);
  return NextResponse.json({ weekStart, groups });
}
