"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ProjectSummary } from "@/types";
import { ExternalLink, Play } from "lucide-react";

interface CardStackHero3DProps {
  projects: ProjectSummary[];
  onSelectProject: (project: ProjectSummary) => void;
  onBlastOpen: (project: ProjectSummary) => void;
}

export function CardStackHero3D({ projects, onSelectProject, onBlastOpen }: CardStackHero3DProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number>(3); // Default active project
  const containerRef = useRef<HTMLDivElement>(null);

  const displayProjects = projects.slice(0, 24);
  const activeProject = displayProjects[hoveredIdx] || displayProjects[0];

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const targetIndex = Math.min(
      displayProjects.length - 1,
      Math.floor(clampedX * displayProjects.length)
    );
    setHoveredIdx(targetIndex);
  }, [displayProjects.length]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-6 px-4 sm:px-8 select-none font-sans overflow-hidden">
      {/* Hero Stage: Wordmark Pulled UP & 16:9 Cinemascope Cards Lifting UPWARDS */}
      <div className="relative w-full max-w-7xl mx-auto flex-1 flex flex-col justify-start items-center pt-2 sm:pt-4">
        {/* ========================================================================= */}
        {/* GIANT BOLD WHITE SERIF WORDMARK: VISIBLE IN UPPER HERO (NOT SINKING DOWN) */}
        {/* ========================================================================= */}
        <div className="relative z-0 pt-2 sm:pt-4 pb-0 text-center select-none pointer-events-none w-full">
          <h1 className="font-editorial text-8xl sm:text-9xl md:text-[13rem] lg:text-[15.5rem] text-white tracking-tighter leading-none font-black opacity-95 text-center drop-shadow-2xl transition-all duration-300">
            {activeProject ? activeProject.title.split(" ")[0] : "VAULT"}
          </h1>
        </div>

        {/* ========================================================================= */}
        {/* 16:9 3D CARD DECK (PHYSICAL THICKNESS & PURE UPWARD LIFT — NO WAVE EFFECT) */}
        {/* ========================================================================= */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          className="relative z-10 w-full h-[380px] sm:h-[440px] flex items-center justify-center cursor-ew-resize mt-[-20px] sm:mt-[-40px] md:mt-[-60px]"
          style={{
            perspective: "1600px",
            perspectiveOrigin: "50% 65%",
          }}
        >
          {displayProjects.map((project, idx) => {
            const isHovered = hoveredIdx === idx;
            const capturePath = `/captures/${project.slug}.webp`;

            // Consistent 3D diagonal angle across ALL cards (no rotation change on hover!)
            const rotateY = -38;
            const rotateX = 8;
            const rotateZ = -2;

            // PURE UPWARD LIFT: Only the hovered card lifts! All other cards stay 100% STILL!
            const translateY = isHovered ? -68 : 0;
            const zIndex = isHovered ? 90 : 10 + idx;

            // Horizontal distribution across width
            const totalCards = displayProjects.length;
            const progress = idx / (totalCards - 1);
            const xPercent = (progress - 0.5) * 88;

            return (
              <div
                key={project.id}
                onClick={() => onBlastOpen(project)}
                className="absolute w-[280px] sm:w-[380px] md:w-[460px] aspect-[16/9] rounded-2xl shadow-2xl transition-all duration-260 ease-out cursor-pointer overflow-hidden group select-none bg-[#09090b]"
                style={{
                  left: `calc(50% + ${xPercent}%)`,
                  transform: `translateX(-50%) translateY(${translateY}px) translateZ(0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  zIndex: zIndex,
                  // 3D Physical Extruded Slab Edge (5px solid metallic rim)
                  boxShadow: isHovered
                    ? "0 0 0 1.5px rgba(255,255,255,0.85), -1px 1px 0 #52525b, -2px 2px 0 #3f3f46, -3px 3px 0 #27272a, -4px 4px 0 #18181b, -5px 5px 0 #09090b, 0 35px 70px -10px rgba(0,0,0,0.98), 0 0 35px rgba(255,255,255,0.22)"
                    : "0 0 0 1px rgba(255,255,255,0.25), -1px 1px 0 #3f3f46, -2px 2px 0 #27272a, -3px 3px 0 #18181b, -4px 4px 0 #0f0f11, -5px 5px 0 #09090b, 0 20px 40px -8px rgba(0,0,0,0.9)",
                }}
              >
                {/* SOLID RENDER: 100% Solid Website Home Page Capture */}
                <div className="relative w-full h-full bg-black">
                  <Image
                    src={capturePath}
                    alt={project.title}
                    fill
                    unoptimized
                    priority={idx < 4}
                    className="object-cover object-top"
                  />
                </div>

                {/* Glassy metallic edge reflection (subtle bevel highlight) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-white/20 pointer-events-none rounded-2xl" />

                {/* Embedded Metallic EMV Chip in Top-Left Corner */}
                <div className="absolute top-3 left-3 z-20 w-8 h-6 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-200/80 shadow-md flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-4 border border-amber-700/40 rounded-xs" />
                </div>

                {/* Subtle Hover Action Pill */}
                {isHovered && (
                  <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/90 text-white text-xs font-mono font-bold border border-white/40 backdrop-blur-md shadow-xl animate-fadeIn">
                    <span>Click to Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Indicator Bar (Clean Monochrome) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-neutral-400 px-4 pt-4 border-t border-neutral-900">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{String(hoveredIdx + 1).padStart(2, "0")} / {String(displayProjects.length).padStart(2, "0")}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300 font-sans truncate max-w-sm sm:max-w-md">{activeProject.title}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onBlastOpen(activeProject)}
            className="px-4 py-1.5 rounded-full bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer shadow-lg flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-black" />
            <span>Blast Open</span>
          </button>

          <a
            href={activeProject.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline flex items-center gap-1 font-bold text-xs font-mono"
          >
            <span>Visit Live</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
