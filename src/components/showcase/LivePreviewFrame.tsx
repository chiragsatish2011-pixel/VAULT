"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProjectDetail } from "@/types";
import { Monitor, Tablet, Smartphone, ExternalLink, RotateCw, AlertTriangle, Play, ShieldAlert } from "lucide-react";

interface LivePreviewProps {
  project: ProjectDetail;
}

export function LivePreviewFrame({ project }: LivePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeBlocked, setIframeBlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [key, setKey] = useState<number>(0);

  // Check screenshot assets for current viewport
  const currentScreenshot =
    project.assets.find((a) => a.type === "screenshot" && a.viewport === device)?.path ||
    project.assets.find((a) => a.type === "screenshot" && a.viewport === "desktop")?.path ||
    project.assets.find((a) => a.type === "screenshot")?.path ||
    project.assets[0]?.path;

  const videoAsset = project.assets.find((a) => a.type === "video");

  // Device frame sizing
  const getFrameDimensions = () => {
    switch (device) {
      case "mobile":
        return "max-w-[390px] h-[780px]";
      case "tablet":
        return "max-w-[768px] h-[850px]";
      case "desktop":
      default:
        return "w-full h-[780px]";
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Device Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-vault-surface border border-vault-border">
        {/* Device Viewport Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-vault-bg border border-vault-border/80">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              device === "desktop"
                ? "bg-vault-accent/20 text-vault-accent font-semibold"
                : "text-vault-muted hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              device === "tablet"
                ? "bg-vault-accent/20 text-vault-accent font-semibold"
                : "text-vault-muted hover:text-white"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              device === "mobile"
                ? "bg-vault-accent/20 text-vault-accent font-semibold"
                : "text-vault-muted hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Mock Browser URL Bar */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vault-bg border border-vault-border text-xs font-mono text-vault-muted truncate">
          <span className="w-2 h-2 rounded-full bg-vault-emerald" />
          <span className="text-vault-muted truncate">{project.liveUrl}</span>
        </div>

        {/* Right Action: Refresh & New Tab */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeBlocked((prev) => !prev)}
            className="text-[11px] font-mono text-vault-muted hover:text-white px-2 py-1 rounded bg-vault-card border border-vault-border"
            title="Toggle between live iframe and verified high-res snapshot"
          >
            {iframeBlocked ? "Try Live Iframe" : "View Captured Fallback"}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-vault-bg hover:bg-vault-border border border-vault-border text-vault-muted hover:text-white transition-colors"
            title="Reload frame"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-vault-accent text-black font-semibold text-xs hover:bg-cyan-300 transition-colors shadow-md"
          >
            <span>Open Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="w-full flex justify-center items-center py-4 bg-vault-bg/60 rounded-2xl border border-vault-border/50">
        <div
          className={`relative transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-vault-border bg-vault-surface ${getFrameDimensions()}`}
        >
          {/* Mock Browser Header Window Dots */}
          <div className="h-8 bg-vault-surface border-b border-vault-border px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs font-sans text-neutral-400 font-bold truncate max-w-sm">
              {project.title}
            </div>
            <div className="w-8" />
          </div>

          {/* Fallback View (If iframe is blocked or CSP restricted) */}
          {iframeBlocked ? (
            <div className="relative w-full h-[calc(100%-2rem)] bg-vault-card flex flex-col justify-between overflow-y-auto">
              {/* Fallback Banner */}
              <div className="p-3 bg-vault-amber/10 border-b border-vault-amber/20 flex items-center justify-between text-xs font-mono text-vault-amber">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-vault-amber shrink-0" />
                  <span>Interactive frame restricted by remote CSP / X-Frame-Options headers. Showing high-fidelity verified capture.</span>
                </div>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold hover:text-white shrink-0 ml-2"
                >
                  Open in New Tab →
                </a>
              </div>

              {/* Render High-Res Snapshot or Looping Video */}
              <div className="relative flex-1 w-full min-h-[500px] overflow-hidden bg-black">
                {videoAsset ? (
                  <video
                    src={videoAsset.path}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-contain"
                  />
                ) : currentScreenshot ? (
                  <div className="relative w-full h-full min-h-[600px]">
                    <Image
                      src={currentScreenshot}
                      alt={`${project.title} preview capture`}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center text-vault-muted text-xs">
                    No preview asset found.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Interactive Iframe */
            <div className="relative w-full h-[calc(100%-2rem)] bg-white">
              <iframe
                key={key}
                src={project.liveUrl}
                title={`${project.title} Live Interactive Render`}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIframeBlocked(true);
                  setIsLoading(false);
                }}
              />

              {isLoading && (
                <div className="absolute inset-0 bg-vault-bg/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-vault-muted">
                  <RotateCw className="w-6 h-6 animate-spin text-vault-accent" />
                  <span className="text-xs font-mono">Initializing live preview sandbox...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
