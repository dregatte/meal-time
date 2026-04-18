import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Meal Time",
  description: "Family meal planning together",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <div className="max-w-lg mx-auto min-h-screen pb-20">
          {user && (
            <div className="sticky top-0 z-20 bg-gray-50 flex justify-end px-4 py-2">
              <UserMenu email={user.email ?? ""} />
            </div>
          )}
          {children}
        </div>
        {user && <BottomNav />}
      </body>
    </html>
  );
}
