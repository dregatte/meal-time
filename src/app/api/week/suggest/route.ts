import { NextResponse } from "next/server";
import { suggestMeals } from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
