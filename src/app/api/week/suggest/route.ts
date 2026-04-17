import { NextResponse } from "next/server";
import { suggestMeals } from "@/lib/claude";

export async function POST(req: Request) {
  const body = await req.json();
  const { inventoryItems, filledSlots, emptySlots } = body;

  try {
    const suggestion = await suggestMeals({ inventoryItems, filledSlots, emptySlots });
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("Suggest meals error:", err);
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
  }
}
