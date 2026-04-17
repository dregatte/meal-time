"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, CheckCircle2, ShoppingCart } from "lucide-react";
import type { InventoryItemRow } from "@/types";

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/inventory");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity }),
    });
    setName("");
    setQuantity("");
    fetchItems();
  }

  async function toggleStatus(item: InventoryItemRow) {
    const next = item.status === "in_stock" ? "to_buy" : "in_stock";
    await fetch(`/api/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    fetchItems();
  }

  async function deleteItem(id: number) {
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    fetchItems();
  }

  const inStock = items.filter((i) => i.status === "in_stock");
  const toBuy = items.filter((i) => i.status === "to_buy");

  if (loading) return <p className="p-4 text-gray-400">Loading...</p>;

  return (
    <div className="p-4 space-y-6">
      <form onSubmit={addItem} className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button
          type="submit"
          className="bg-orange-500 text-white rounded-lg p-2 hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </form>

      <Section
        title="In Stock"
        items={inStock}
        onToggle={toggleStatus}
        onDelete={deleteItem}
        emptyText="Nothing in stock yet"
      />
      <Section
        title="To Buy"
        items={toBuy}
        onToggle={toggleStatus}
        onDelete={deleteItem}
        emptyText="Shopping list is clear"
      />
    </div>
  );
}

function Section({
  title,
  items,
  onToggle,
  onDelete,
  emptyText,
}: {
  title: string;
  items: InventoryItemRow[];
  onToggle: (item: InventoryItemRow) => void;
  onDelete: (id: number) => void;
  emptyText: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
            >
              <button
                onClick={() => onToggle(item)}
                className="text-gray-400 hover:text-orange-500 transition-colors"
                title={item.status === "in_stock" ? "Mark as to buy" : "Mark as in stock"}
              >
                {item.status === "in_stock" ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <ShoppingCart size={20} className="text-orange-400" />
                )}
              </button>
              <span className="flex-1 text-sm font-medium">{item.name}</span>
              {item.quantity && (
                <span className="text-xs text-gray-400">{item.quantity}</span>
              )}
              <button
                onClick={() => onDelete(item.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
