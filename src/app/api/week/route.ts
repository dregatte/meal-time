import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart") ?? getMondayOfWeek();

  const { data, error } = await supabase
    .from("week_slots")
    .select("*, recipe:recipes(*)")
    .eq("user_id", user.id)
    .eq("week_start", weekStart);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weekStart, slots: data });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weekStart, day, meal, recipeId, note } = await req.json();

  const { data, error } = await supabase
    .from("week_slots")
    .upsert(
      { user_id: user.id, week_start: weekStart, day, meal, recipe_id: recipeId ?? null, note: note ?? null },
      { onConflict: "user_id,week_start,day,meal" }
    )
    .select("*, recipe:recipes(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
