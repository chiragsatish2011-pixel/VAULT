"use client";

import React, { useState } from "react";
import { KeyRound, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      // Success: reload window to let server render the dashboard
      window.location.reload();
    } catch {
      setError("Network or server connection error.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#fbfbfd] dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-6 selection:bg-[#0071e3] selection:text-white transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Apple-style minimalist icon & wordmark */}
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 shadow-sm">
          <KeyRound className="w-8 h-8 text-[#0071e3] dark:text-[#2997ff]" />
        </div>

        <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-2 text-center text-neutral-950 dark:text-white">
          VAULT
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 text-center font-normal">
          Administrative Access
        </p>

        {error && (
          <div className="w-full mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative w-full">
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Passkey"
              disabled={loading}
              autoFocus
              className="w-full h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !passkey.trim()}
            className="w-full h-12 rounded-xl bg-[#0071e3] dark:bg-[#2997ff] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Stateless JWT • Constant-time Verification</span>
        </div>
      </div>
    </main>
  );
}
