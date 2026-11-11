"use client";

import Link from "next/link";
import { VaultSite } from "@/lib/sites-store";
import { AppleTile } from "./AppleTile";

interface AppleGridProps {
  sites: VaultSite[];
}

export function AppleGrid({ sites }: AppleGridProps) {
  if (!sites || sites.length === 0) {
    return (
      <section className="w-full max-w-4xl mx-auto py-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed border-black/15 dark:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center mb-6 text-apple-blue">
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
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-3">
            VAULT Archive Ready
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8 font-normal leading-relaxed">
            All previous entries have been reset. Access the administrative portal to capture and index your web deployments.
          </p>
          <Link
            href="/chirag"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0071e3] dark:bg-[#2997ff] text-white font-medium text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <span>Open Admin Portal</span>
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
