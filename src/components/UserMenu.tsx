"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const name = email.split("@")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
          <User size={14} className="text-orange-500" />
        </div>
        <span className="max-w-[80px] truncate">{name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-1 min-w-[160px]">
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-50 mb-1">{email}</div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
