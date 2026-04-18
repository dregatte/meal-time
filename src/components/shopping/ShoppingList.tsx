"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import type { ShoppingGroup } from "@/lib/shopping";

function getMondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export default function ShoppingList() {
  const [groups, setGroups] = useState<ShoppingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const fetchList = useCallback(async () => {
    setLoading(true);
    const weekStart = getMondayOfWeek();
    const res = await fetch(`/api/shopping?weekStart=${weekStart}`);
    const data = await res.json();
    setGroups(data.groups ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  function toggleCheck(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const checkedCount = checked.size;

  if (loading) return <p className="p-4 text-gray-400">Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      {/* Summary bar */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {checkedCount} of {totalItems} items
          </span>
          <button
            onClick={fetchList}
            className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-sm">Nothing to buy!</p>
          <p className="text-sm">Plan your week or your inventory already covers everything.</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.recipeName} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
              <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                {group.recipeName}
              </h3>
            </div>
            <ul className="divide-y divide-gray-50">
              {group.items.map((item, i) => {
                const key = `${group.recipeName}-${item.name}-${i}`;
                const done = checked.has(key);
                return (
                  <li key={key}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCheck(key)}
                    >
                      {done ? (
                        <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-gray-300 shrink-0" />
                      )}
                      <span className={`text-sm flex-1 ${done ? "line-through text-gray-300" : "text-gray-700"}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.quantity} {item.unit}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
