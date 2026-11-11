"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, Shield, Loader2, Eye, EyeOff } from "lucide-react";

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
        setError(data.error || "Incorrect passkey. Please verify and try again.");
        setLoading(false);
        return;
      }

      // Success: replace location to let server render authenticated dashboard
      window.location.replace("/chirag");
    } catch {
      setError("Unable to connect to authentication gateway.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center p-6 selection:bg-[#2997ff] selection:text-black overflow-hidden font-sans">
      {/* Ambient Lighting Pools */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-b from-[#0071e3]/20 via-[#2997ff]/5 to-transparent blur-[140px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-t from-white/[0.03] to-transparent blur-[120px]"
      />

      {/* Floating Monolith Card */}
      <div className="relative w-full max-w-[420px] rounded-3xl bg-[#0a0a0d]/90 border-2 border-white/[0.14] p-8 sm:p-10 backdrop-blur-3xl shadow-[0_32px_96px_-12px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.2)] flex flex-col items-center z-10">
        {/* Specular hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
        />

        {/* Lock Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.25)]">
            <Lock className="w-7 h-7 text-[#2997ff]" />
          </div>
          <div className="absolute -inset-1.5 rounded-2xl bg-[#2997ff]/25 blur-lg -z-10" />
        </div>

        {/* Wordmark */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent mb-2 text-center">
          VAULT
        </h1>
        <p className="text-xs sm:text-[13px] text-neutral-400 mb-8 text-center font-normal leading-relaxed max-w-[280px]">
          Enter master passkey to access VAULT admin.
        </p>

        {/* Error Callout */}
        {error && (
          <div className="w-full mb-6 py-3 px-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-fadeIn backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative w-full">
            <input
              type={showPasskey ? "text" : "password"}
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter master passkey"
              disabled={loading}
              autoFocus
              className="w-full h-13 px-4.5 pr-12 rounded-xl bg-white/[0.04] border-2 border-white/[0.14] text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#2997ff] focus:ring-4 focus:ring-[#2997ff]/15 transition-all font-mono tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPasskey(!showPasskey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPasskey ? "Hide passkey" : "Show passkey"}
            >
              {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !passkey.trim()}
            className="w-full h-13 rounded-xl bg-gradient-to-b from-[#0077ed] to-[#0062c4] hover:from-[#0071e3] hover:to-[#005bb5] active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all cursor-pointer shadow-[0_6px_24px_rgba(0,113,227,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] border border-white/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Access Console</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Details */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] w-full flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
            <span>Admin Gateway</span>
          </div>
          <Link
            href="/"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Exit to Gallery</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
