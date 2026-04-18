import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from("recipes").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, ingredients, method, prepMins, cookMins, servings, photoUrl, tags } = body;

  const { data, error } = await supabase.from("recipes").update({
    name: name?.trim(),
    description: description || null,
    ingredients: typeof ingredients === "string" ? JSON.parse(ingredients) : (ingredients ?? []),
    method: typeof method === "string" ? JSON.parse(method) : (method ?? []),
    prep_mins: prepMins ?? 0,
    cook_mins: cookMins ?? 0,
    servings: servings ?? 2,
    photo_url: photoUrl || null,
    tags: Array.isArray(tags) ? tags : [],
    updated_at: new Date().toISOString(),
  }).eq("id", params.id).eq("created_by", user.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("recipes").delete().eq("id", params.id).eq("created_by", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
