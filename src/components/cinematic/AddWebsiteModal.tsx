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
  ArrowRight,
  ExternalLink,
  Layers
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

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSyncedProject(null);
      setStepMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) {
      setError("Please provide a valid GitHub repository URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSyncedProject(null);

    try {
      setStepMessage("Connecting to GitHub repository...");
      await new Promise((r) => setTimeout(r, 400));

      setStepMessage("Fetching commits and file tree manifests...");
      await new Promise((r) => setTimeout(r, 400));

      setStepMessage("Capturing 16:9 desktop banner screenshot...");
      
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          liveUrl: liveUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync website repository");
      }

      setStepMessage("Mounting to 3D card deck and archival file stack...");
      await new Promise((r) => setTimeout(r, 400));

      setSyncedProject(data.project);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred during synchronization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = (repo: string, live: string) => {
    setRepoUrl(`https://github.com/${repo}`);
    setLiveUrl(live);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none font-sans">
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
              Safe ingestion • Automated 16:9 banner capture • Live 3D deck sync
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
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Website & Repository Synced</span>
                  </div>
                  <span className="text-neutral-500 text-xs font-mono">16:9 BANNER READY</span>
                </div>

                {/* Banner Preview */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-800 bg-black">
                  <Image
                    src={syncedProject.bannerUrl}
                    alt={syncedProject.title}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                </div>

                <div className="space-y-1">
                  <div className="font-editorial text-xl font-bold text-white">{syncedProject.title}</div>
                  <div className="text-xs text-neutral-400 line-clamp-2">{syncedProject.tagline}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <a
                  href={syncedProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-colors shadow-lg"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    setSyncedProject(null);
                    setRepoUrl("");
                    setLiveUrl("");
                  }}
                  className="px-5 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-white font-mono font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Add Another Site
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSync} className="space-y-6">
              <div className="space-y-4">
                {/* GitHub URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-300 font-bold flex items-center gap-2">
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Repository URL</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/chiragsatish2011-pixel/EditorOps"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                    required
                  />
                </div>

                {/* Live URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-300 font-bold flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Website URL (Optional / Auto-Detected)</span>
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

              {/* Quick Presets for User Repos */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-neutral-500 uppercase">Quick Add From Your Repositories:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "EditorOps", repo: "chiragsatish2011-pixel/EditorOps", live: "https://editor-ops-alpha.vercel.app/" },
                    { label: "VaayuChat", repo: "chiragsatish2011-pixel/VaayuChat", live: "https://vaayu-chat-1xss.vercel.app/" },
                    { label: "Nomin", repo: "chiragsatish2011-pixel/Nomin", live: "https://nomin-ai-nine.vercel.app/" },
                    { label: "Showbook", repo: "chiragsatish2011-pixel/Showbook", live: "https://showbook-xi.vercel.app/" },
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

              {/* Ingestion Pipeline Status Feedback */}
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
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-white text-black font-black text-xs uppercase font-mono tracking-wider hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl hover:scale-101"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Ingestion & Capture...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Sync Repository & Auto-Capture Banner</span>
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
