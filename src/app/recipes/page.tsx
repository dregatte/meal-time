"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeForm from "@/components/recipes/RecipeForm";
import type { RecipeRow } from "@/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecipeRow | null>(null);

  const fetchRecipes = useCallback(async () => {
    const res = await fetch("/api/recipes");
    setRecipes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  async function deleteRecipe(id: number) {
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    fetchRecipes();
  }

  function handleSaved() {
    setShowForm(false);
    setEditing(null);
    fetchRecipes();
  }

  if (showForm || editing) {
    return (
      <div>
        <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
          <h1 className="text-xl font-bold">{editing ? "Edit Recipe" : "New Recipe"}</h1>
        </header>
        <RecipeForm
          initial={editing ?? undefined}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Recipes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors shadow"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍳</p>
            <p className="text-sm">No recipes yet.</p>
            <p className="text-sm">Tap + to add your first recipe.</p>
          </div>
        )}
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onDelete={deleteRecipe}
            onEdit={(recipe) => setEditing(recipe)}
          />
        ))}
      </div>
    </div>
  );
}
