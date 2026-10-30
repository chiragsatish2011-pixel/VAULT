"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Github, 
  Globe, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddWebsiteModal({ isOpen, onClose, onSuccess }: AddWebsiteModalProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [syncedProject, setSyncedProject] = useState<any | null>(null);
  const [isAlreadyUpToDate, setIsAlreadyUpToDate] = useState(false);

  // Reset state on open and handle Escape key
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSyncedProject(null);
      setIsAlreadyUpToDate(false);
      setStepMessage("");

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const executeSync = async (forceUpdate = false) => {
    const trimmedRepo = repoUrl.trim();
    const trimmedLive = liveUrl.trim();

    if (!trimmedRepo && !trimmedLive) {
      setError("Please provide either a GitHub repository link or a website URL (or both).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSyncedProject(null);
    setIsAlreadyUpToDate(false);

    try {
      setStepMessage("Analyzing repository & deployment fingerprint...");
      await new Promise((r) => setTimeout(r, 350));

      setStepMessage(forceUpdate ? "Force re-capturing 16:9 desktop banner..." : "Checking index & capturing banner...");

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: trimmedRepo || undefined,
          liveUrl: trimmedLive || undefined,
          force: forceUpdate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process website sync");
      }

      setSyncedProject(data.project);
      setIsAlreadyUpToDate(Boolean(data.alreadyExists && !forceUpdate));

      // Emit event so Command Palette search updates instantly!
      window.dispatchEvent(new CustomEvent("vault:projects-updated"));
    } catch (err: any) {
      setError(err.message || "An error occurred during synchronization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSync(false);
  };

  const handleQuickPreset = (repo: string, live: string) => {
    setRepoUrl(`https://github.com/${repo}`);
    setLiveUrl(live);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#09090b] text-white border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-neutral-900">
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl sm:text-3xl font-black text-white tracking-tight">
              Add New Website / Sync GitHub
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Provide Git URL alone, Web URL alone, or both • Automated 16:9 banner capture
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {syncedProject ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Notification Banner: Already Up to Date vs Newly Added */}
              {isAlreadyUpToDate ? (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider block text-white">Already Up to Date</span>
                    <span>This project is already indexed and verified in the showcase vault. No duplicate needed!</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider block">Website & Banner Captured</span>
                    <span>Successfully integrated into the 3D card deck and repository stack!</span>
                  </div>
                </div>
              )}

              {/* Banner Preview Card */}
              <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">{syncedProject.title}</span>
                  <span className="text-neutral-500">16:9 BANNER PREVIEW</span>
                </div>

                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                  <Image
                    src={syncedProject.bannerUrl}
                    alt={syncedProject.title}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                </div>

                <p className="text-xs text-neutral-400 font-sans line-clamp-2">
                  {syncedProject.tagline}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <a
                    href={syncedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-colors shadow-lg"
                  >
                    <span>Visit Live Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {syncedProject.repoUrl && (
                    <a
                      href={syncedProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs hover:bg-neutral-800 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Repo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isAlreadyUpToDate && (
                    <button
                      type="button"
                      onClick={() => executeSync(true)}
                      className="px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Force Re-Capture</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSyncedProject(null);
                      setRepoUrl("");
                      setLiveUrl("");
                    }}
                    className="px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Add Another
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* GitHub URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Repository URL</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-normal">Works alone or with Web URL</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/chiragsatish2011-pixel/EditorOps"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                </div>

                {/* Live URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Website URL</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-normal">Works alone or with Git URL</span>
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://editor-ops-alpha.vercel.app/"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-neutral-500 uppercase">Quick Add From Your Repositories:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "EditorOps", repo: "chiragsatish2011-pixel/EditorOps", live: "https://editor-ops-alpha.vercel.app/" },
                    { label: "VaayuChat", repo: "chiragsatish2011-pixel/VaayuChat", live: "https://vaayu-chat-1xss.vercel.app/" },
                    { label: "Nomin", repo: "chiragsatish2011-pixel/Nomin", live: "https://nomin-ai-nine.vercel.app/" },
                    { label: "vastraabharana", repo: "chiragsatish2011-pixel/vastraabharana", live: "https://vastraabharana.vercel.app/" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleQuickPreset(p.repo, p.live)}
                      className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono text-neutral-300 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Progress */}
              {isLoading && (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-3 text-xs font-mono text-white">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>{stepMessage}</span>
                  </div>
                  <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-pulse w-3/4 rounded-full" />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!repoUrl.trim() && !liveUrl.trim())}
                className="w-full py-3.5 rounded-full bg-white text-black font-black text-xs uppercase font-mono tracking-wider hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 shadow-xl hover:scale-101"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Capturing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Verify, Sync & Capture 16:9 Banner</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
