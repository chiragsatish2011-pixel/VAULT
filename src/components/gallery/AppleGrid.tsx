"use client";

import { VaultSite } from "@/lib/sites-store";
import { AppleTile } from "./AppleTile";

interface AppleGridProps {
  sites: VaultSite[];
}

export function AppleGrid({ sites }: AppleGridProps) {
  if (!sites || sites.length === 0) {
    return (
      <section className="w-full py-32 px-6 flex flex-col items-center justify-center text-center">
        <p className="text-xl text-black/60 dark:text-white/60 font-light">
          No projects published yet. Check back soon.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Screen Wall Gallery"
      className="w-full relative bg-black border-0 p-0 m-0"
    >
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-0 border-0 outline-none p-0 m-0">
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
