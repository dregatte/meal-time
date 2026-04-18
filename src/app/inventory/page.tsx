import InventoryList from "@/components/inventory/InventoryList";

export default function InventoryPage() {
  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <h1 className="text-xl font-bold">Inventory</h1>
      </header>
      <InventoryList />
    </div>
  );
}
