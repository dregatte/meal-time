"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Refrigerator } from "lucide-react";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeForm from "@/components/recipes/RecipeForm";
import type { RecipeRow, InventoryItemRow, Ingredient } from "@/types";
import { createClient } from "@/lib/supabase/client";

function canMakeRecipe(recipe: RecipeRow, inStockNames: string[]): boolean {
  if (!recipe.ingredients?.length) return false;
  return recipe.ingredients.every((ing: Ingredient) =>
    inStockNames.some(
      (n) => n.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(n)
    )
  );
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [inventory, setInventory] = useState<InventoryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecipeRow | null>(null);
  const [filterCookable, setFilterCookable] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAll = useCallback(async () => {
    const [recipesRes, inventoryRes, { data: { user } }] = await Promise.all([
      fetch("/api/recipes"),
      fetch("/api/inventory"),
      supabase.auth.getUser(),
    ]);
    setRecipes(await recipesRes.json());
    setInventory(await inventoryRes.json());
    setUserId(user?.id ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function deleteRecipe(id: number) {
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    fetchAll();
  }

  const inStockNames = inventory.filter((i) => i.status === "in_stock").map((i) => i.name.toLowerCase());
  const cookableRecipes = recipes.filter((r) => canMakeRecipe(r, inStockNames));
  const displayed = filterCookable ? cookableRecipes : recipes;

  if (showForm || editing) {
    return (
      <div>
        <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
          <h1 className="text-xl font-bold">{editing ? "Edit Recipe" : "New Recipe"}</h1>
        </header>
        <RecipeForm
          initial={editing ?? undefined}
          onSave={() => { setShowForm(false); setEditing(null); fetchAll(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Recipes</h1>
          <button onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors shadow">
            <Plus size={20} />
          </button>
        </div>

        {/* Cookable filter */}
        {cookableRecipes.length > 0 && (
          <button
            onClick={() => setFilterCookable((v) => !v)}
            className={`mt-3 flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors ${
              filterCookable
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-green-600 border-green-300 hover:bg-green-50"
            }`}
          >
            <Refrigerator size={14} />
            {filterCookable
              ? `Showing ${cookableRecipes.length} cookable now`
              : `${cookableRecipes.length} recipe${cookableRecipes.length !== 1 ? "s" : ""} you can cook now`}
          </button>
        )}
      </header>

      <div className="p-4 space-y-4">
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
        {!loading && displayed.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">{filterCookable ? "🥗" : "🍳"}</p>
            <p className="text-sm">
              {filterCookable
                ? "No recipes match your current inventory."
                : "No recipes yet. Tap + to add your first."}
            </p>
          </div>
        )}
        {displayed.map((r) => (
          <div key={r.id} className="relative">
            {filterCookable && (
              <div className="absolute -top-1 -right-1 z-10 bg-green-400 text-white text-xs px-2 py-0.5 rounded-full shadow">
                Ready to cook!
              </div>
            )}
            <RecipeCard
              recipe={r}
              canEdit={r.created_by === userId}
              onDelete={deleteRecipe}
              onEdit={setEditing}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
