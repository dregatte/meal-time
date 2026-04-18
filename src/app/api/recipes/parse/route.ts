import { NextResponse } from "next/server";
import { parseRecipe } from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { imageBase64, text } = body;
  if (!imageBase64 && !text?.trim()) {
    return NextResponse.json({ error: "Provide imageBase64 or text" }, { status: 400 });
  }

  try {
    const parsed = await parseRecipe({ imageBase64, text });
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Recipe parse error:", err);
    return NextResponse.json({ error: "Failed to parse recipe" }, { status: 500 });
  }
}
