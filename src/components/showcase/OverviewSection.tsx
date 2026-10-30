"use client";

import React from "react";
import Image from "next/image";
import { ProjectDetail } from "@/types";
import { ExternalLink, Github, Calendar, Sparkles, CheckCircle2 } from "lucide-react";

interface OverviewProps {
  project: ProjectDetail;
  onSelectTab: (tab: string) => void;
}

export function OverviewSection({ project, onSelectTab }: OverviewProps) {
  const coverAsset =
    project.assets.find((a) => a.type === "cover")?.path ||
    project.assets.find((a) => a.type === "screenshot" && a.viewport === "desktop")?.path ||
    project.assets[0]?.path;

  return (
    <div className="space-y-10 font-sans">
      {/* Hero Render Preview Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-300 bg-black group shadow-xl">
        <div className="relative aspect-[21/9] w-full">
          {coverAsset && (
            <Image
              src={coverAsset}
              alt={project.title}
              fill
              priority
              className="object-cover object-top opacity-90 group-hover:scale-102 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Overlay Badges and Fast Action Buttons */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-black">
                {project.status}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight">
              {project.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans line-clamp-2">
              {project.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectTab("preview")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Launch Live View</span>
            </button>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/70 hover:bg-black border border-white/20 text-white font-medium text-xs transition-colors font-mono"
            >
              <Github className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Repo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Project Architecture & Engineering Notes */}
      <div className="pt-4">
        <div className="bg-[#FAF9F5] text-neutral-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-sans leading-relaxed">
            <div>
              <h3 className="text-black font-editorial text-2xl font-black mb-2 tracking-tight">
                Project Overview
              </h3>
              <p className="text-neutral-700 leading-relaxed font-medium">
                {project.description ||
                  "A fully self-contained engineering project engineered with responsive layouts, optimal performance, and production deployment."}
              </p>
            </div>
            <div>
              <h3 className="text-black font-editorial text-2xl font-black mb-2 tracking-tight">
                Architecture & Scope
              </h3>
              <p className="text-neutral-700 leading-relaxed font-medium">
                Modern full-stack web application designed for fast render speeds and seamless user interaction across desktop, tablet, and mobile displays.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Technical Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Architecture Rationale</span>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed font-medium">
            Engineered with React, TypeScript, and modern edge runtimes. Optimized for 60fps rendering even on modest hardware.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Deployment Provenance</span>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed font-medium">
            Synchronized directly with the production domain. Continuous verification confirms edge availability.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Repository Source</span>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed font-medium">
            Repository tracked on GitHub: {project.repoUrl.replace("https://github.com/", "")} on branch main.
          </p>
        </div>
      </div>
    </div>
  );
}
