"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldAlert, Terminal, AlertTriangle, ArrowRight, Eye, EyeOff } from "lucide-react";

interface StealthAuthGateProps {
  adminPath: string;
  autoPrompt?: boolean;
}

export function StealthAuthGate({ adminPath, autoPrompt = false }: StealthAuthGateProps) {
  const [showPrompt, setShowPrompt] = useState<boolean>(autoPrompt);
  const [passphrase, setPassphrase] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Hidden key shortcut to reveal login: Ctrl+Shift+L or double clicking the 404 code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        setShowPrompt(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        setLoading(false);
        return;
      }

      // Success: reload window to let server render Admin Dashboard
      window.location.reload();
    } catch (err: any) {
      setError("Network or server error during authentication.");
      setLoading(false);
    }
  };

  // If prompt is not triggered, display standard authentic 404 page
  if (!showPrompt) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h1
          onClick={() => setShowPrompt(true)}
          className="font-display font-black text-7xl sm:text-9xl text-vault-border hover:text-vault-muted cursor-pointer transition-colors select-none"
          title="Click to authenticate"
        >
          404
        </h1>
        <p className="mt-4 text-sm font-mono text-vault-muted">
          NOT FOUND: The requested resource does not exist on this server.
        </p>
        <p className="mt-2 text-xs text-vault-subtle font-mono">
          [Hint for creator: Press <kbd className="px-1 py-0.5 rounded bg-vault-surface border border-vault-border text-white">Ctrl+Shift+L</kbd> or click 404 to unlock]
        </p>
      </div>
    );
  }

  // Passphrase Authentication Challenge
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-vault-border shadow-2xl space-y-6 bg-vault-card/90 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-vault-border">
          <div className="flex items-center gap-2 text-vault-accent">
            <Lock className="w-5 h-5" />
            <h2 className="font-display font-bold text-base text-white tracking-wide">
              VAULT SECURITY GATE
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-vault-surface border border-vault-border text-vault-muted">
            ARGON2 / BCRYPT
          </span>
        </div>

        <p className="text-xs text-vault-muted font-mono leading-relaxed">
          Administrative session access is restricted. Passphrase is verified server-side with constant-time comparison and progressive lockout protection.
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-vault-crimson/10 border border-vault-crimson/30 flex items-start gap-2 text-xs font-mono text-vault-crimson">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>{error}</span>
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <div className="mt-1 text-[11px] text-vault-muted">
                  Remaining attempts before lockout: {remainingAttempts}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-vault-subtle uppercase flex items-center justify-between">
              <span>Passphrase Challenge</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-vault-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter master admin passphrase..."
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg bg-vault-surface border border-vault-border text-sm text-white placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-vault-accent hover:bg-cyan-300 text-black font-semibold text-xs transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Hash...</span>
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => setShowPrompt(false)}
            className="text-[11px] font-mono text-vault-subtle hover:text-vault-muted transition-colors"
          >
            ← Return to unauthenticated 404 state
          </button>
        </div>
      </div>
    </div>
  );
}
