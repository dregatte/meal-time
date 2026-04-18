"use client";

import { useState, useRef } from "react";
import { Wand2, ImagePlus, Plus, Minus, X } from "lucide-react";
import type { Ingredient, ParsedRecipe, RecipeRow } from "@/types";

interface Props {
  initial?: RecipeRow;
  onSave: () => void;
  onCancel: () => void;
}

const EMPTY: ParsedRecipe = {
  name: "",
  description: "",
  ingredients: [{ name: "", quantity: "", unit: "" }],
  method: [""],
  prepMins: 0,
  cookMins: 0,
  servings: 2,
  tags: [],
};

export default function RecipeForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ParsedRecipe>(() => {
    if (!initial) return EMPTY;
    let ingredients: Ingredient[] = [];
    let method: string[] = [];
    try { ingredients = JSON.parse(initial.ingredients); } catch {}
    try { method = JSON.parse(initial.method); } catch {}
    return {
      name: initial.name,
      description: initial.description ?? "",
      ingredients: ingredients.length ? ingredients : EMPTY.ingredients,
      method: method.length ? method : EMPTY.method,
      prepMins: initial.prepMins,
      cookMins: initial.cookMins,
      servings: initial.servings,
      tags: initial.tags ? initial.tags.split(",").filter(Boolean) : [],
    };
  });
  const [photo, setPhoto] = useState<string | null>(initial?.photoBase64 ?? null);
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleParseAI() {
    if (!photo && !pasteText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/recipes/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photo, text: pasteText }),
      });
      const parsed: ParsedRecipe = await res.json();
      setForm({
        ...parsed,
        ingredients: parsed.ingredients?.length ? parsed.ingredients : EMPTY.ingredients,
        method: parsed.method?.length ? parsed.method : EMPTY.method,
        tags: parsed.tags ?? [],
      });
    } finally {
      setParsing(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const body = {
      ...form,
      ingredients: JSON.stringify(form.ingredients),
      method: JSON.stringify(form.method),
      tags: form.tags,
      photoBase64: photo,
    };
    await fetch(initial ? `/api/recipes/${initial.id}` : "/api/recipes", {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onSave();
  }

  function setIngredient(i: number, field: keyof Ingredient, val: string) {
    setForm((f) => {
      const ings = [...f.ingredients];
      ings[i] = { ...ings[i], [field]: val };
      return { ...f, ingredients: ings };
    });
  }

  function setStep(i: number, val: string) {
    setForm((f) => {
      const m = [...f.method];
      m[i] = val;
      return { ...f, method: m };
    });
  }

  return (
    <form onSubmit={handleSave} className="p-4 space-y-5">
      {/* Photo + AI parse */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm border border-dashed border-gray-300 rounded-xl px-3 py-2 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <ImagePlus size={16} />
            {photo ? "Change photo" : "Add photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        {photo && (
          <div className="relative w-full h-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="preview" className="w-full h-36 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <textarea
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          rows={3}
          placeholder="Paste recipe text here (optional)..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        <button
          type="button"
          onClick={handleParseAI}
          disabled={parsing || (!photo && !pasteText.trim())}
          className="flex items-center gap-2 text-sm bg-violet-100 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-200 disabled:opacity-40 transition-colors"
        >
          <Wand2 size={15} />
          {parsing ? "Parsing..." : "Parse with AI"}
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipe Name *</label>
        <input
          required
          className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
        <textarea
          className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      {/* Times + servings */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prep (min)</label>
          <input
            type="number" min={0}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={form.prepMins}
            onChange={(e) => setForm((f) => ({ ...f, prepMins: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cook (min)</label>
          <input
            type="number" min={0}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={form.cookMins}
            onChange={(e) => setForm((f) => ({ ...f, cookMins: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servings</label>
          <input
            type="number" min={1}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={form.servings}
            onChange={(e) => setForm((f) => ({ ...f, servings: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingredients</label>
        <div className="mt-1 space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => setIngredient(i, "quantity", e.target.value)}
              />
              <input
                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                placeholder="Unit"
                value={ing.unit}
                onChange={(e) => setIngredient(i, "unit", e.target.value)}
              />
              <input
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                placeholder="Ingredient"
                value={ing.name}
                onChange={(e) => setIngredient(i, "name", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, j) => j !== i) }))}
                className="text-gray-300 hover:text-red-400"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: "", quantity: "", unit: "" }] }))}
            className="text-sm text-orange-500 flex items-center gap-1 hover:text-orange-600"
          >
            <Plus size={14} /> Add ingredient
          </button>
        </div>
      </div>

      {/* Method */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</label>
        <div className="mt-1 space-y-2">
          {form.method.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs text-gray-400 pt-2 w-5 shrink-0">{i + 1}.</span>
              <textarea
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-300"
                rows={2}
                value={step}
                onChange={(e) => setStep(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, method: f.method.filter((_, j) => j !== i) }))}
                className="text-gray-300 hover:text-red-400 pt-1"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, method: [...f.method, ""] }))}
            className="text-sm text-orange-500 flex items-center gap-1 hover:text-orange-600"
          >
            <Plus size={14} /> Add step
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</label>
        <div className="mt-1 flex flex-wrap gap-1 mb-2">
          {form.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
              {tag}
              <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
            placeholder="budget, vegetarian, quick..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const t = tagInput.trim().replace(/,$/, "");
                if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
                setTagInput("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const t = tagInput.trim();
              if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
              setTagInput("");
            }}
            className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : (initial ? "Update Recipe" : "Save Recipe")}
        </button>
      </div>
    </form>
  );
}
