"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChefHat, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <ChefHat size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Meal Time</h1>
          <p className="text-gray-500 mt-2">Family meal planning, together.</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
            <div className="text-4xl">📬</div>
            <h2 className="font-semibold text-gray-800">Check your email</h2>
            <p className="text-sm text-gray-500">
              We sent a magic link to <strong>{email}</strong>.
              <br />Tap it to sign in — no password needed.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-orange-500 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email address
              </label>
              <div className="mt-1 flex items-center border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400 overflow-hidden">
                <div className="pl-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-3 text-sm focus:outline-none bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Sending..." : "Send magic link"}
            </button>

            <p className="text-xs text-center text-gray-400">
              Enter your email and we&apos;ll send you a link to sign in instantly.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
