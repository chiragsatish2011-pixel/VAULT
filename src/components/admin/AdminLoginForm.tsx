"use client";

import React, { useState } from "react";
import { KeyRound, ArrowRight, ShieldCheck, Loader2, Lock, Eye, EyeOff } from "lucide-react";

export function AdminLoginForm() {
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
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
    <main className="min-h-screen w-full bg-[#fbfbfd] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-6 selection:bg-[#0071e3] selection:text-white transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Apple-style minimalist icon with ambient specular glow */}
        <div className="relative w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-[#121216] border-2 border-black/10 dark:border-white/15 flex items-center justify-center mb-6 shadow-xl dark:shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
          <div className="absolute inset-0 rounded-3xl bg-radial-glow opacity-50 pointer-events-none" />
          <Lock className="w-8 h-8 text-[#0071e3] dark:text-[#2997ff]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] mb-2 text-center text-neutral-950 dark:text-white">
          VAULT
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-8 text-center font-normal tracking-wide uppercase">
          Administrative Console
        </p>

        {error && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative w-full">
            <input
              type={showPasskey ? "text" : "password"}
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter Admin Passkey"
              disabled={loading}
              autoFocus
              className="w-full h-13 px-4 pr-11 rounded-2xl bg-white dark:bg-[#141418] border-2 border-black/15 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-4 focus:ring-[#0071e3]/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPasskey(!showPasskey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !passkey.trim()}
            className="w-full h-13 rounded-2xl bg-[#0071e3] dark:bg-[#2997ff] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer shadow-md hover:shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Stateless JWT • Bcrypt Verification</span>
        </div>
      </div>
    </main>
  );
}
