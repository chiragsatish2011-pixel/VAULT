"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProjectSummary } from "@/types";
import { ArrowLeft, ArrowRight, ExternalLink, Play, Monitor, Code } from "lucide-react";

interface CinemascopeStageProps {
  projects: ProjectSummary[];
  onBlastOpen: (project: ProjectSummary) => void;
}

export function CinemascopeStageView({ projects, onBlastOpen }: CinemascopeStageProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);

  const activeProject = projects[selectedIdx] || projects[0];
  const capturePath = `/captures/${activeProject.slug}.webp`;

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
    setIsInteractive(false);
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
    setIsInteractive(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between py-12 px-4 sm:px-8 select-none font-sans max-w-7xl mx-auto">
      {/* Top Section Header - Pure Monochrome */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-300">
        <div>
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
            Section 03 // Production Releases
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl text-black tracking-tight font-normal">
            Cinemascope Stage
          </h2>
        </div>

        {/* Counter and Switcher Controls */}
        <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
          <span className="font-bold text-black text-sm">
            {String(selectedIdx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black transition-colors cursor-pointer"
              title="Previous Project [Left Arrow]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black transition-colors cursor-pointer"
              title="Next Project [Right Arrow]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 16:9 Cinemascope Browser Stage */}
      <div className="my-8 w-full">
        {/* The 16:9 Frame */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
          {/* Active Render (Live Iframe OR 1920x1080 Headless Capture) */}
          {isInteractive ? (
            <iframe
              src={activeProject.liveUrl}
              title={activeProject.title}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div
              onClick={() => onBlastOpen(activeProject)}
              className="relative w-full h-full cursor-pointer group"
            >
              <Image
                src={capturePath}
                alt={activeProject.title}
                fill
                unoptimized
                priority
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* Center Play Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-5 py-2.5 rounded-full bg-black/85 text-white text-xs font-mono font-bold border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Blast Full Screen</span>
                </div>
              </div>
            </div>
          )}

          {/* Top-Right Floating Controls Inside Frame */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setIsInteractive((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-black text-white text-[11px] font-mono font-bold tracking-tight border border-white/20 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-white" />
              <span>{isInteractive ? "Static Render" : "Interact Live Inside Stage"}</span>
            </button>

            <button
              onClick={() => onBlastOpen(activeProject)}
              className="p-1.5 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 shadow-lg backdrop-blur-md cursor-pointer"
              title="Blast Open"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>
        </div>

        {/* Clean Self-Explanatory Project Metadata Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-neutral-800">
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl sm:text-4xl text-black font-normal tracking-tight">
              {activeProject.title}
            </h3>
            <p className="text-neutral-600 text-sm font-sans max-w-2xl leading-relaxed">
              {activeProject.tagline || activeProject.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <button
              onClick={() => onBlastOpen(activeProject)}
              className="px-4 py-2 rounded-lg bg-black text-white font-bold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Blast Open</span>
            </button>
            <a
              href={activeProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black font-bold transition-colors"
            >
              <span>Visit Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {activeProject.repoUrl && (
              <a
                href={activeProject.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black font-bold transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Filmstrip Carousel of All 26 Projects */}
      <div className="w-full pt-4 border-t border-neutral-300 space-y-2">
        <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          Index Filmstrip ({projects.length} verified production deployments)
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-thin">
          {projects.map((p, idx) => {
            const isCurrent = idx === selectedIdx;
            const thumbPath = `/captures/${p.slug}.webp`;

            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedIdx(idx);
                  setIsInteractive(false);
                }}
                className={`relative w-36 sm:w-44 aspect-[16/9] rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer border ${
                  isCurrent
                    ? "ring-2 ring-black border-transparent scale-105 shadow-xl"
                    : "border-neutral-300 opacity-60 hover:opacity-100 hover:border-neutral-500"
                }`}
              >
                <Image
                  src={thumbPath}
                  alt={p.title}
                  fill
                  unoptimized
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-1 left-2 right-2 text-left">
                  <span className="text-[10px] font-mono font-bold text-white truncate block drop-shadow-md">
                    {p.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
