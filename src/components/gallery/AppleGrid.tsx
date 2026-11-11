"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VaultSite } from "@/lib/sites-store";
import { AppleTile } from "./AppleTile";

interface AppleGridProps {
  sites: VaultSite[];
}

export function AppleGrid({ sites: initialSites }: AppleGridProps) {
  const [sites, setSites] = useState<VaultSite[]>(initialSites || []);

  useEffect(() => {
    if (initialSites && initialSites.length > 0) {
      setSites(initialSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(initialSites));
      } catch {}
    } else {
      try {
        const raw = localStorage.getItem("vault_curated_sites");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSites(parsed.filter((s: VaultSite) => !s.hidden));
          }
        }
      } catch {}
    }
  }, [initialSites]);
  if (!sites || sites.length === 0) {
    return (
      <section className="w-full max-w-4xl mx-auto py-16 sm:py-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="relative w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed border-black/15 dark:border-white/20 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] flex flex-col items-center overflow-hidden">
          {/* Subtle Ambient Backlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial-glow opacity-30 -z-10"
          />

          {/* Aperture / Screen Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-[#121216] border-2 border-black/10 dark:border-white/15 flex items-center justify-center mb-6 text-[#0071e3] dark:text-[#2997ff] shadow-md dark:shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white mb-2">
            No projects published yet
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8 font-normal leading-relaxed">
            Manage and curate your web portfolio from the admin console.
          </p>

          <Link
            href="/chirag"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-b from-[#0077ed] to-[#0062c4] hover:from-[#0071e3] hover:to-[#005bb5] active:scale-98 text-white font-medium text-sm transition-all shadow-[0_6px_24px_rgba(0,113,227,0.35),inset_0_1px_0_0_rgba(255,255,255,0.3)] border border-white/20"
          >
            <span>Open Admin Console</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Screen Wall Gallery"
      className="w-full max-w-[2560px] mx-auto px-5 sm:px-8 lg:px-12 pb-24 sm:pb-32"
    >
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 sm:gap-7 lg:gap-8">
        {sites.map((site, index) => (
          <AppleTile
            key={site.id}
            site={site}
            index={index}
            isPriority={index < 6}
          />
        ))}
      </div>
    </section>
  );
}
