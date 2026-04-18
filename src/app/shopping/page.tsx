import ShoppingList from "@/components/shopping/ShoppingList";

export default function ShoppingPage() {
  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <h1 className="text-xl font-bold">Shopping List</h1>
      </header>
      <ShoppingList />
    </div>
  );
}
