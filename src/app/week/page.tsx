import WeekGrid from "@/components/week/WeekGrid";

export default function WeekPage() {
  return (
    <div>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <h1 className="text-xl font-bold">Week of Cooks</h1>
      </header>
      <WeekGrid />
    </div>
  );
}
