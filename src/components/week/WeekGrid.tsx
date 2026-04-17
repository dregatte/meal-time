"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import type { RecipeRow, WeekSlotRow, DayKey, MealKey } from "@/types";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];
const MEALS: MealKey[] = ["lunch", "dinner"];

function getMondayOfWeek(offset = 0): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function formatMonday(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

interface SlotMap {
  [key: string]: WeekSlotRow | undefined;
}

export default function WeekGrid() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getMondayOfWeek(weekOffset);

  const [slots, setSlots] = useState<SlotMap>({});
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<{ day: DayKey; meal: MealKey } | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [weekRes, recipesRes] = await Promise.all([
      fetch(`/api/week?weekStart=${weekStart}`),
      fetch("/api/recipes"),
    ]);
    const { slots: slotList } = await weekRes.json();
    const recipeList: RecipeRow[] = await recipesRes.json();

    const map: SlotMap = {};
    for (const s of slotList as WeekSlotRow[]) {
      map[`${s.day}-${s.meal}`] = s;
    }
    setSlots(map);
    setRecipes(recipeList);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function assignSlot(day: DayKey, meal: MealKey, recipeId: number | null) {
    await fetch("/api/week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, day, meal, recipeId }),
    });
    setPicking(null);
    fetchData();
  }

  async function getSuggestions() {
    setSuggesting(true);
    setSuggestion("");

    const inStockRes = await fetch("/api/inventory");
    const inventory: { name: string; quantity: string | null; status: string }[] = await inStockRes.json();
    const inStockItems = inventory.filter((i) => i.status === "in_stock").map((i) => ({ name: i.name, quantity: i.quantity }));

    const filledSlots = Object.entries(slots)
      .filter(([, s]) => s?.recipe)
      .map(([key, s]) => {
        const [day, meal] = key.split("-");
        return { day, meal, recipeName: s!.recipe!.name };
      });

    const emptySlots = DAYS.flatMap((d) =>
      MEALS.filter((m) => !slots[`${d.key}-${m}`]?.recipeId).map((m) => ({ day: d.key, meal: m }))
    );

    const res = await fetch("/api/week/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventoryItems: inStockItems, filledSlots, emptySlots }),
    });
    const { suggestion: text } = await res.json();
    setSuggestion(text ?? "");
    setSuggesting(false);
  }

  if (loading) return <p className="p-4 text-gray-400">Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          ← Prev
        </button>
        <span className="text-sm font-medium text-gray-700">
          Week of {formatMonday(weekStart)}
        </span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          Next →
        </button>
      </div>

      {/* Grid */}
      <div className="space-y-2">
        {DAYS.map(({ key: day, label }) => (
          <div key={day} className="bg-white rounded-2xl p-3 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{label}</h3>
            <div className="grid grid-cols-2 gap-2">
              {MEALS.map((meal) => {
                const slot = slots[`${day}-${meal}`];
                const recipe = slot?.recipe;
                return (
                  <div key={meal} className="rounded-xl bg-gray-50 p-2 min-h-[52px] relative">
                    <p className="text-xs text-gray-400 capitalize mb-1">{meal}</p>
                    {recipe ? (
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-medium text-gray-700 leading-tight">{recipe.name}</span>
                        <button
                          onClick={() => assignSlot(day, meal, null)}
                          className="text-gray-300 hover:text-red-400 shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPicking({ day, meal })}
                        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-500"
                      >
                        <Plus size={13} /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AI suggestions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <button
          onClick={getSuggestions}
          disabled={suggesting}
          className="flex items-center gap-2 w-full justify-center bg-violet-100 text-violet-700 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-200 disabled:opacity-50 transition-colors"
        >
          {suggesting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {suggesting ? "Getting suggestions..." : "Get AI Meal Suggestions"}
        </button>
        {suggestion && (
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {suggestion}
          </div>
        )}
      </div>

      {/* Recipe picker modal */}
      {picking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setPicking(null)}>
          <div
            className="bg-white w-full max-h-[70vh] rounded-t-3xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold">Pick a recipe</h2>
              <button onClick={() => setPicking(null)}><X size={20} /></button>
            </div>
            {recipes.length === 0 ? (
              <p className="p-6 text-sm text-gray-400 text-center">No recipes saved yet. Add some in the Recipes tab.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recipes.map((r) => (
                  <li key={r.id}>
                    <button
                      className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 transition-colors"
                      onClick={() => assignSlot(picking.day, picking.meal, r.id)}
                    >
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
