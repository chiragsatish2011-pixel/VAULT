"use client";

import React, { useState } from "react";
import { ProjectSummary } from "@/types";
import { CardStackHero3D } from "@/components/hero/CardStackHero3D";
import { ArchivalDossierView } from "./ArchivalDossierView";
import { LiquidBlastModal } from "@/components/cinematic/LiquidBlastModal";

interface GalleryViewProps {
  initialProjects: ProjectSummary[];
}

export function GalleryView({ initialProjects }: GalleryViewProps) {
  const [blastedProject, setBlastedProject] = useState<ProjectSummary | null>(null);

  return (
    <div className="relative w-full bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Cellular Liquid Blast Modal (z-[100] above everything) */}
      <LiquidBlastModal
        project={blastedProject}
        onClose={() => setBlastedProject(null)}
      />

      {/* SECTION 1: Full-Screen 3D Cinemascope Showcase (Hero IS the Cinemascope Stage) */}
      <section id="hero" className="relative w-full min-h-screen bg-black flex flex-col justify-between">
        <CardStackHero3D
          projects={initialProjects}
          onSelectProject={(p) => setBlastedProject(p)}
          onBlastOpen={(p) => setBlastedProject(p)}
        />
      </section>

      {/* SECTION 2: Full-Screen Physical Archival Folder Stack (Video 1 "Fragments 15–20") */}
      <section id="dossier" className="relative w-full min-h-screen bg-black text-white py-16 flex flex-col justify-center border-t border-neutral-900">
        <ArchivalDossierView
          projects={initialProjects}
          onOpenLiveSite={(p) => setBlastedProject(p)}
        />
      </section>
    </div>
  );
}
