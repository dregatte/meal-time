"use client";

import { Clock, Users, ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import type { RecipeRow } from "@/types";

interface Props {
  recipe: RecipeRow;
  canEdit: boolean;
  onDelete: (id: number) => void;
  onEdit: (recipe: RecipeRow) => void;
}

export default function RecipeCard({ recipe, canEdit, onDelete, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const tags = recipe.tags ?? [];
  const totalMins = recipe.prep_mins + recipe.cook_mins;
  const addedBy = recipe.profiles?.display_name || recipe.profiles?.email?.split("@")[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {recipe.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.photo_url} alt={recipe.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-snug flex-1">{recipe.name}</h3>
          {canEdit && (
            <div className="flex gap-1 shrink-0">
              <button onClick={() => onEdit(recipe)} className="text-gray-400 hover:text-orange-500 p-1"><Pencil size={15} /></button>
              <button onClick={() => onDelete(recipe.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 size={15} /></button>
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
        )}

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
          {totalMins > 0 && <span className="flex items-center gap-1"><Clock size={13} /> {totalMins} min</span>}
          <span className="flex items-center gap-1"><Users size={13} /> {recipe.servings} servings</span>
          {addedBy && <span className="text-gray-300">by {addedBy}</span>}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        <button onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Hide details" : "Show ingredients & method"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {recipe.ingredients?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Ingredients</h4>
                <ul className="text-sm space-y-0.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-gray-700">{ing.quantity} {ing.unit} {ing.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {recipe.method?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Method</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  {recipe.method.map((step, i) => (
                    <li key={i} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
