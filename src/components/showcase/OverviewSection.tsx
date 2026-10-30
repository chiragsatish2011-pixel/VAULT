"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProjectDetail } from "@/types";
import { formatProjectMicrocopy } from "@/lib/design-tokens";
import { ExternalLink, Github, Calendar, Sparkles, Paperclip, CheckCircle2, ShieldCheck } from "lucide-react";

interface OverviewProps {
  project: ProjectDetail;
  onSelectTab: (tab: string) => void;
}

export function OverviewSection({ project, onSelectTab }: OverviewProps) {
  const microcopy = formatProjectMicrocopy(project);

  const coverAsset =
    project.assets.find((a) => a.type === "cover")?.path ||
    project.assets.find((a) => a.type === "screenshot" && a.viewport === "desktop")?.path ||
    project.assets[0]?.path;

  // Layered paper drift
  const [pinkZ, setPinkZ] = useState<number>(20);
  const [receiptZ, setReceiptZ] = useState<number>(30);

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

      {/* Layered Physical Archival Documents (Prompt A Detail View: Pink Excerpt + Yellow Receipt) */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pt-4">
        {/* Pink Paper: File #01 / Excerpt A */}
        <div
          onClick={() => {
            setPinkZ(35);
            setReceiptZ(20);
          }}
          className="bg-[#F8D2D8] text-[#831843] p-6 rounded-xl shadow-xl flex-1 border border-[#F43F5E]/30 relative transition-all duration-200 cursor-pointer select-none transform -rotate-1 hover:rotate-0"
          style={{ zIndex: pinkZ }}
        >
          <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#F43F5E]/30 pb-2">
            <span className="font-bold uppercase tracking-wider">{microcopy.fileNumber}</span>
            <span className="font-editorial italic text-base">Excerpt A</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans leading-relaxed text-[#9F1239]">
            <div>
              <strong className="block text-[#831843] font-mono text-[11px] mb-1">
                PROBLEM & CONTEXT
              </strong>
              <p>
                Modern applications require rapid deployment cycles without compromising architectural rigor. Traditional showcases omit the engineering provenance and reverse-engineered blueprints.
              </p>
            </div>
            <div>
              <strong className="block text-[#831843] font-mono text-[11px] mb-1">
                SYNTHESIS & PROVENANCE
              </strong>
              <p>
                {project.description ||
                  "A fully self-contained engineering case study verified through automated AST parsing and live browser telemetry."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F43F5E]/30 flex items-center justify-between">
            <span className="text-[10px] font-mono opacity-80">{microcopy.date}</span>
            <span className="text-[9px] font-mono border border-[#831843] px-2 py-0.5 rounded uppercase font-bold">
              (files) AUTHENTIC
            </span>
          </div>
        </div>

        {/* Yellow Torn Receipt with Metal Paperclip (Prompt A) */}
        <div
          onClick={() => {
            setReceiptZ(35);
            setPinkZ(20);
          }}
          className="bg-[#FEF08A] text-[#713F12] p-5 rounded-lg shadow-xl w-full lg:w-72 border border-[#FACC15] transition-all duration-200 cursor-pointer select-none relative transform rotate-2 hover:rotate-0 shrink-0"
          style={{ zIndex: receiptZ }}
        >
          {/* Realistic metal paperclip */}
          <div className="absolute -top-4 left-6 text-neutral-600">
            <Paperclip className="w-7 h-7 transform -rotate-45" />
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-[#EAB308] pb-1.5 flex justify-between">
            <span>RECEIPT</span>
            <span>{microcopy.date.toUpperCase()}</span>
          </div>

          <div className="text-[11px] font-mono mt-3 space-y-1.5">
            <div>ID: {microcopy.receiptId}</div>
            <div>HOST: {microcopy.domain}</div>
            <div>SHA: {microcopy.sha}</div>
            <div>STATUS: {microcopy.statusText}</div>
            <div className="font-bold pt-2 border-t border-[#EAB308]/60 text-neutral-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{microcopy.auditText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Technical Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Architecture Rationale</span>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed">
            Engineered with React, TypeScript, and modern edge runtimes. Optimized for 60fps rendering even on modest hardware.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold font-mono text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Deployment Provenance</span>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed">
            Synchronized directly with the production domain {microcopy.domain}. Continuous verification confirms edge availability.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold font-mono text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Verified Source</span>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed">
            Repository tracked on GitHub: {project.repoUrl.replace("https://github.com/", "")} on branch main.
          </p>
        </div>
      </div>
    </div>
  );
}
