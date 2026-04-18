export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface ParsedRecipe {
  name: string;
  description: string;
  ingredients: Ingredient[];
  method: string[];
  prepMins: number;
  cookMins: number;
  servings: number;
  tags: string[];
}

// Supabase DB row shapes (snake_case from DB)
export interface RecipeRow {
  id: number;
  name: string;
  description: string | null;
  ingredients: Ingredient[];   // jsonb — already parsed by Supabase client
  method: string[];            // jsonb — already parsed
  prep_mins: number;
  cook_mins: number;
  servings: number;
  photo_url: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string | null; email: string | null } | null;
}

export interface InventoryItemRow {
  id: number;
  user_id: string;
  name: string;
  quantity: string | null;
  status: "in_stock" | "to_buy";
  created_at: string;
  updated_at: string;
}

export interface WeekSlotRow {
  id: number;
  user_id: string;
  week_start: string;
  day: string;
  meal: string;
  recipe_id: number | null;
  recipe: RecipeRow | null;
  note: string | null;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type MealKey = "lunch" | "dinner";
