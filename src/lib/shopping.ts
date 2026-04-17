import type { Ingredient, InventoryItemRow, RecipeRow, WeekSlotRow } from "@/types";

export interface ShoppingGroup {
  recipeName: string;
  items: Ingredient[];
}

export function deriveShoppingList(
  weekSlots: WeekSlotRow[],
  inventoryItems: InventoryItemRow[]
): ShoppingGroup[] {
  const inStockNames = inventoryItems
    .filter((i) => i.status === "in_stock")
    .map((i) => i.name.toLowerCase());

  const isInStock = (ingredientName: string) =>
    inStockNames.some(
      (n) => n.includes(ingredientName.toLowerCase()) || ingredientName.toLowerCase().includes(n)
    );

  const groups: ShoppingGroup[] = [];
  const seenIngredients = new Set<string>();

  for (const slot of weekSlots) {
    if (!slot.recipe) continue;

    const recipe = slot.recipe as RecipeRow;
    let ingredients: Ingredient[] = [];
    try {
      ingredients = JSON.parse(recipe.ingredients);
    } catch {
      continue;
    }

    const needed = ingredients.filter((ing) => {
      const key = ing.name.toLowerCase();
      if (seenIngredients.has(key)) return false;
      if (isInStock(ing.name)) return false;
      seenIngredients.add(key);
      return true;
    });

    if (needed.length > 0) {
      groups.push({ recipeName: recipe.name, items: needed });
    }
  }

  return groups;
}
