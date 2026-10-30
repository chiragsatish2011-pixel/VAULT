"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Code2, Calendar, GitCommit, ArrowUpRight, Play, Sparkles } from "lucide-react";
import { Card3D } from "@/components/cinematic/Card3D";
import { ProjectSummary } from "@/types";

interface ProjectCardProps {
  project: ProjectSummary;
  onBlastOpen?: (project: ProjectSummary) => void;
}

export function ProjectCard({ project, onBlastOpen }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const screenshot =
    project.assets.find((a) => a.type === "cover")?.path ||
    project.assets.find((a) => a.type === "screenshot" && a.viewport === "desktop")?.path ||
    project.assets[0]?.path ||
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80";

  const videoAsset = project.assets.find((a) => a.type === "video");

  const handleCardClick = (e: React.MouseEvent) => {
    // If onBlastOpen is provided and clicked on the preview area
    if (onBlastOpen) {
      e.preventDefault();
      onBlastOpen(project);
    }
  };

  return (
    <Card3D accentColor={project.accentColor} className="h-full">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full bg-[#0A0A0E] border border-vault-border/80 hover:border-white/30 transition-all duration-300 relative group/card cursor-pointer shadow-xl"
        onClick={handleCardClick}
      >
        {/* Device Tablet / Laptop Frame Preview (Video 2 Style) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050507]">
          {videoAsset && isHovered ? (
            <video
              src={videoAsset.path}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full group-hover/card:scale-103 transition-transform duration-500">
              <Image
                src={screenshot}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-top opacity-90 group-hover/card:opacity-100 transition-opacity duration-300"
              />
            </div>
          )}

          {/* Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E] via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium backdrop-blur-md border ${
                project.status === "Live"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : project.status === "WIP"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-neutral-500/15 border-neutral-500/40 text-neutral-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  project.status === "Live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {project.status.toUpperCase()}
            </span>

            {/* Signature Accent Pill */}
            <div
              className="w-2.5 h-2.5 rounded-full shadow-md"
              style={{
                backgroundColor: project.accentColor,
                boxShadow: `0 0 10px ${project.accentColor}`,
              }}
            />
          </div>

          {/* Liquid Blast Quick Action Overlay on Hover */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 transition-all duration-300 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider shadow-2xl transform group-hover/card:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Blast Live View</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-300">Click to blast open site</span>
          </div>
        </div>

        {/* Content Body: Editorial Typography + Monochrome High Contrast */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Title with Editorial Serif Font */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl font-editorial font-bold text-white group-hover/card:text-neutral-200 transition-colors">
                {project.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover/card:text-white transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 shrink-0 mt-1" />
            </div>

            {/* Tagline */}
            <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
              {project.tagline}
            </p>
          </div>

          {/* Bottom Area: Colored Tech Chips & Actions */}
          <div className="mt-5 pt-4 border-t border-vault-border/60 space-y-3">
            {/* Tech Chips */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-vault-surface border border-vault-border text-neutral-300"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 4 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-500">
                  +{project.tags.length - 4}
                </span>
              )}
            </div>

            {/* Footer with date and Direct Showcase Link */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>

              <Link
                href={`/p/${project.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-white hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Full Dossier</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  );
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
