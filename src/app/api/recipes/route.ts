import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*, profiles(display_name, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, ingredients, method, prepMins, cookMins, servings, photoUrl, tags } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase.from("recipes").insert({
    name: name.trim(),
    description: description || null,
    ingredients: typeof ingredients === "string" ? JSON.parse(ingredients) : (ingredients ?? []),
    method: typeof method === "string" ? JSON.parse(method) : (method ?? []),
    prep_mins: prepMins ?? 0,
    cook_mins: cookMins ?? 0,
    servings: servings ?? 2,
    photo_url: photoUrl || null,
    tags: Array.isArray(tags) ? tags : [],
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
