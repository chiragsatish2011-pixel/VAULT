"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ProjectSummary } from "@/types";
import { 
  X, 
  ExternalLink, 
  RotateCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  HelpCircle, 
  Check, 
  ChevronRight,
  Maximize2
} from "lucide-react";

interface LiquidBlastModalProps {
  project: ProjectSummary | null;
  onClose: () => void;
}

export function LiquidBlastModal({ project, onClose }: LiquidBlastModalProps) {
  // Device auto-detection based on screen width
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [userOverride, setUserOverride] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [showBlastRipple, setShowBlastRipple] = useState<boolean>(true);
  const [showMobileGuide, setShowMobileGuide] = useState<boolean>(false);

  // Auto-detect viewport on mount and resize
  const detectAndSetDevice = useCallback(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (!userOverride) {
      if (width < 768) {
        setDevice("mobile");
      } else if (width < 1024) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    }
  }, [userOverride]);

  useEffect(() => {
    detectAndSetDevice();
    window.addEventListener("resize", detectAndSetDevice);
    return () => window.removeEventListener("resize", detectAndSetDevice);
  }, [detectAndSetDevice]);

  useEffect(() => {
    if (!project) return;
    setShowBlastRipple(true);
    setIframeLoaded(false);

    const timer = setTimeout(() => {
      setShowBlastRipple(false);
    }, 550);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const currentScreenshot = `/captures/${project.slug}.webp`;

  // Dynamic device styles ensuring controls NEVER scroll off screen
  const getDeviceContainerStyle = () => {
    switch (device) {
      case "mobile":
        return "w-full max-w-[390px] aspect-[9/18.5] max-h-[calc(90vh-70px)]";
      case "tablet":
        return "w-full max-w-[768px] aspect-[4/3] max-h-[calc(90vh-70px)]";
      case "desktop":
      default:
        return "w-full max-w-6xl aspect-[16/10] sm:aspect-[16/9] max-h-[calc(90vh-70px)]";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden select-none bg-black/95 backdrop-blur-2xl">
      {/* Dark Ambient Backdrop Click to Close */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/90 pointer-events-auto"
      />

      {/* Cellular Liquid Ripple Rings Blast Effect */}
      {showBlastRipple && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="absolute w-44 h-44 rounded-full border-2 border-white/80 animate-cellular-ripple" />
          <div
            className="absolute w-72 h-72 rounded-full border border-white/50 animate-cellular-ripple"
            style={{ animationDelay: "0.15s" }}
          />
          <div
            className="absolute w-96 h-96 rounded-full border border-white/25 animate-cellular-ripple"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PINNED TOP CONTROL BAR: STICKY AT TOP, NEVER SCROLLS OFF SCREEN           */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-6xl flex items-center justify-between gap-4 py-2.5 px-4 mb-2 rounded-2xl bg-black/80 border border-neutral-800 backdrop-blur-xl shadow-2xl shrink-0">
        {/* Left: Project Title & Live Link */}
        <div className="flex items-center gap-3 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <h2 className="font-editorial text-lg sm:text-xl text-white font-normal tracking-tight truncate">
            {project.title}
          </h2>
          <span className="text-neutral-500 hidden md:inline">•</span>
          <span className="text-xs font-mono text-neutral-400 hidden md:inline truncate max-w-xs">
            {project.liveUrl.replace(/^https?:\/\//, "")}
          </span>
        </div>

        {/* Right: Device Viewport Controls & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Guide Button for Phone Users */}
          <button
            onClick={() => setShowMobileGuide(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
            title="Desktop Mode Guide for Mobile Phones"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Mobile Guide</span>
          </button>

          {/* Viewport switchers */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
            <button
              onClick={() => {
                setDevice("desktop");
                setUserOverride(true);
              }}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                device === "desktop" ? "bg-white text-black shadow-md font-bold" : "text-neutral-400 hover:text-white"
              }`}
              title="Desktop View (Default on PC/Mac)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setDevice("tablet");
                setUserOverride(true);
              }}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                device === "tablet" ? "bg-white text-black shadow-md font-bold" : "text-neutral-400 hover:text-white"
              }`}
              title="Tablet View (Default on iPads & Tablets)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setDevice("mobile");
                setUserOverride(true);
              }}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                device === "mobile" ? "bg-white text-black shadow-md font-bold" : "text-neutral-400 hover:text-white"
              }`}
              title="Mobile View (Default on Phones)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Launch External Link */}
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold transition-all shadow-md text-xs font-mono"
          >
            <span>Visit Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close [ESC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEVICE FRAME: SCALED RESPONSIVELY, NEVER OVERFLOWING SCREEN HEIGHT         */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex-1 w-full flex items-center justify-center min-h-0 py-1">
        <div
          className={`bg-black border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 relative ${getDeviceContainerStyle()}`}
        >
          {/* Mock Browser Header Bar */}
          <div className="h-9 bg-neutral-950 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 select-none text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 hover:bg-red-500 transition-colors cursor-pointer" onClick={onClose} />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            </div>

            <div className="flex items-center gap-2 px-3 py-0.5 rounded bg-black border border-neutral-800 text-[11px] font-mono text-neutral-400 max-w-sm truncate">
              <span className="truncate">{project.liveUrl}</span>
            </div>

            <div className="text-xs font-sans text-neutral-400 font-bold capitalize">
              {device}
            </div>
          </div>

          {/* Frame Content: Live Interactive Iframe or 1920x1080 Headless Capture */}
          <div className="relative flex-1 w-full h-[calc(100%-2.25rem)] bg-white overflow-hidden">
            <iframe
              src={project.liveUrl}
              title={`${project.title} Render View`}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIframeLoaded(true)}
            />

            {/* Fallback real capture layer while loading or if iframe blocked */}
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                <div className="relative w-full h-full opacity-85">
                  <Image
                    src={currentScreenshot}
                    alt={project.title}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white font-mono text-xs gap-2">
                  <RotateCw className="w-5 h-5 animate-spin text-white" />
                  <span>Connecting to live production deployment...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DESKTOP MODE GUIDE MODAL (Help phone users enable desktop site)     */}
      {/* ========================================================================= */}
      {showMobileGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121215] border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-white" />
                <h3 className="font-editorial text-xl font-normal">Enable Desktop View</h3>
              </div>
              <button
                onClick={() => setShowMobileGuide(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              For the full cinematic experience, 3D card physics, and interactive code explorer on mobile, enable <strong>Desktop Site</strong> in your mobile browser:
            </p>

            <div className="space-y-4 text-xs font-mono">
              {/* Safari (iOS) */}
              <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px]">1</span>
                  <span>Safari on iPhone / iPad</span>
                </div>
                <ol className="text-neutral-400 space-y-1 list-decimal list-inside text-[11px] font-sans">
                  <li>Tap the <strong>aA</strong> icon in the left side of the address bar.</li>
                  <li>Tap <strong>Request Desktop Website</strong>.</li>
                  <li>The showcase will reload in full desktop splendour!</li>
                </ol>
              </div>

              {/* Chrome (Android / iOS) */}
              <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
                  <span>Google Chrome on Phone</span>
                </div>
                <ol className="text-neutral-400 space-y-1 list-decimal list-inside text-[11px] font-sans">
                  <li>Tap the three dots <strong>⋮</strong> menu icon in the corner.</li>
                  <li>Check the checkbox for <strong>Desktop site</strong>.</li>
                  <li>Enjoy the full desktop 16:9 cinematic presentation!</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowMobileGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs font-mono hover:bg-neutral-200 transition-colors"
            >
              Got it, Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
