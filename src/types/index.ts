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

export interface RecipeRow {
  id: number;
  name: string;
  description: string | null;
  ingredients: string; // JSON
  method: string;      // JSON
  prepMins: number;
  cookMins: number;
  servings: number;
  photoBase64: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemRow {
  id: number;
  name: string;
  quantity: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeekSlotRow {
  id: number;
  weekStart: string;
  day: string;
  meal: string;
  recipeId: number | null;
  recipe: RecipeRow | null;
  note: string | null;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type MealKey = "lunch" | "dinner";
