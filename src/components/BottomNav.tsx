"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Package, CalendarDays, ShoppingCart } from "lucide-react";

const tabs = [
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/week", label: "Week", icon: CalendarDays },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-2 text-xs gap-1 transition-colors ${
              active ? "text-orange-500" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className={active ? "font-semibold" : ""}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
