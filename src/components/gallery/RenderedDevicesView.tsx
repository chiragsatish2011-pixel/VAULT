"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProjectSummary } from "@/types";
import { ArrowUpRight, ExternalLink, Play, Monitor } from "lucide-react";

interface RenderedDevicesProps {
  projects: ProjectSummary[];
  onBlastOpen: (project: ProjectSummary) => void;
}

export function RenderedDevicesView({ projects, onBlastOpen }: RenderedDevicesProps) {
  // Allow toggling live interactive iframe directly inside the card!
  const [interactiveSlugs, setInteractiveSlugs] = useState<Record<string, boolean>>({});

  const toggleInteractive = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInteractiveSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-16 font-sans">
      {/* Editorial Header - Pure Monochrome */}
      <div className="text-center space-y-2">
        <h2 className="font-editorial text-4xl sm:text-6xl text-black tracking-tight">
          Live Deployments
        </h2>
      </div>

      {/* Vertical Stacking of 16:9 Website Cards (Strictly rendering the actual website) */}
      <div className="space-y-16">
        {projects.map((project) => {
          const capturePath = `/captures/${project.slug}.webp`;
          const isInteractive = !!interactiveSlugs[project.slug];

          return (
            <div
              key={project.id}
              className="space-y-4"
            >
              {/* Clean 16:9 Device Frame (Strictly 16:9, renders the website only, zero clutter) */}
              <div
                onClick={() => onBlastOpen(project)}
                className="group relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-neutral-300 hover:border-black shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Real Website Render: Interactive Iframe OR 1920x1080 Headless Capture */}
                {isInteractive ? (
                  <iframe
                    src={project.liveUrl}
                    title={project.title}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={capturePath}
                      alt={project.title}
                      fill
                      unoptimized
                      priority={project.orderIndex === 0}
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </div>
                )}

                {/* Subtle Hover Overlay with Live Render Toggle */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors pointer-events-none" />

                {/* In-Card Direct Interaction Pill */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={(e) => toggleInteractive(project.slug, e)}
                    className="px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-[11px] font-mono font-bold tracking-tight border border-white/20 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
                    title={isInteractive ? "Switch to Static Capture" : "Interact Live Inside Card"}
                  >
                    <Monitor className="w-3 h-3 text-white" />
                    <span>{isInteractive ? "Static Mode" : "Interact In Card"}</span>
                  </button>
                </div>
              </div>

              {/* Minimal Clean Monochrome Title & Direct Actions Bar */}
              <div className="flex items-center justify-between px-2 text-xs font-mono text-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="font-editorial text-2xl sm:text-3xl text-black font-normal tracking-tight">
                    {project.title}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onBlastOpen(project)}
                    className="hover:text-black text-neutral-600 transition-colors cursor-pointer underline text-xs font-bold"
                  >
                    Blast Open
                  </button>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-black text-neutral-600 transition-colors"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/p/${project.slug}`}
                    className="flex items-center gap-1 hover:text-black text-neutral-600 transition-colors"
                  >
                    <span>Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
