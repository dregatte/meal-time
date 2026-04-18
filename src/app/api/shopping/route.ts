import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

interface Ingredient { name: string; quantity: string; unit: string; }

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart") ?? getMondayOfWeek();

  const [{ data: slots }, { data: inventory }] = await Promise.all([
    supabase
      .from("week_slots")
      .select("*, recipe:recipes(*)")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .not("recipe_id", "is", null),
    supabase
      .from("inventory_items")
      .select("name, status")
      .eq("user_id", user.id)
      .eq("status", "in_stock"),
  ]);

  const inStockNames = (inventory ?? []).map((i) => i.name.toLowerCase());
  const isInStock = (name: string) =>
    inStockNames.some((n) => n.includes(name.toLowerCase()) || name.toLowerCase().includes(n));

  const groups: { recipeName: string; items: Ingredient[] }[] = [];
  const seen = new Set<string>();

  for (const slot of slots ?? []) {
    if (!slot.recipe) continue;
    const ingredients: Ingredient[] = slot.recipe.ingredients ?? [];
    const needed = ingredients.filter((ing: Ingredient) => {
      const key = ing.name.toLowerCase();
      if (seen.has(key) || isInStock(ing.name)) return false;
      seen.add(key);
      return true;
    });
    if (needed.length > 0) groups.push({ recipeName: slot.recipe.name, items: needed });
  }

  return NextResponse.json({ weekStart, groups });
}
