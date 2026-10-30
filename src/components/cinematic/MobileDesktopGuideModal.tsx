"use client";

import React, { useState, useEffect } from "react";
import { Monitor, X, Smartphone, ArrowRight, Sparkles } from "lucide-react";

export function MobileDesktopGuideModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile || dismissed) return null;

  return (
    <>
      {/* Floating Mobile Prompt Pill */}
      <aside 
        aria-label="Desktop Mode Notification"
        className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-fadeIn"
      >
        <div className="bg-[#121215]/95 border border-neutral-700 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-white">
          <div 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer flex-1"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Enable Desktop View</span>
                <span className="text-[9px] bg-white text-black px-1.5 py-0.2 rounded font-mono font-bold">Recommended</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-sans">
                For cinematic 3D cards & interactive code
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-white text-black text-xs font-mono font-bold"
            >
              How
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Guide Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-sm bg-[#121215] border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-white" />
                <h3 className="font-editorial text-xl font-normal">Desktop Site Guide</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              To experience the full 3D cinemascope card rack, tactile desk file animations, and interactive code tree on your phone:
            </p>

            <div className="space-y-3 text-xs">
              {/* Safari */}
              <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="font-bold text-white text-[12px] flex items-center gap-1.5 font-mono">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
                  <span>Safari (iPhone / iPad)</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  Tap <strong>aA</strong> in the address bar → tap <strong>Request Desktop Website</strong>.
                </div>
              </div>

              {/* Chrome */}
              <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="font-bold text-white text-[12px] flex items-center gap-1.5 font-mono">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
                  <span>Google Chrome (Phone)</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  Tap <strong>⋮</strong> menu icon → check <strong>Desktop site</strong>.
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setDismissed(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-xs font-mono hover:bg-neutral-200 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
