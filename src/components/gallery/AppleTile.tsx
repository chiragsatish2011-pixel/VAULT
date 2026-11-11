"use client";

import Image from "next/image";
import { useState } from "react";
import { VaultSite } from "@/lib/sites-store";

interface AppleTileProps {
  site: VaultSite;
  isPriority?: boolean;
  index: number;
}

export function AppleTile({ site, isPriority = false, index }: AppleTileProps) {
  const [imageError, setImageError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Fallback if thumbnail path is relative or needs default
  const imageSrc = imageError
    ? site.blurDataURL || "/captures/default-fallback.webp"
    : site.thumbnailUrl || site.thumbnail1440 || site.thumbnail800 || site.blurDataURL || "/captures/default-fallback.webp";

  const isDataUri = imageSrc.startsWith("data:");

  return (
    <div
      className="grid-tile relative group overflow-hidden rounded-2xl border-2 border-black/15 dark:border-white/20 bg-neutral-100 dark:bg-[#0c0c0e] aspect-[16/10] select-none shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all duration-300 hover:border-[#0071e3] dark:hover:border-[#2997ff] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,113,227,0.22)] dark:hover:shadow-[0_24px_64px_rgba(41,151,255,0.35)]"
      style={{
        animationDelay: `${Math.min((index % 6) * 50, 300)}ms`,
      }}
    >
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.name} — Visit live site`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="block w-full h-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-inset z-10"
      >
        {/* Full-bleed Thumbnail with crisp clipping */}
        <div className="relative w-full h-full overflow-hidden bg-neutral-100 dark:bg-[#0c0c0e]">
          <Image
            src={imageSrc}
            alt={site.name}
            fill
            unoptimized={isDataUri}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, (max-width: 1920px) 25vw, (max-width: 2560px) 20vw, 16.66vw"
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
            placeholder={!isDataUri && site.blurDataURL ? "blur" : "empty"}
            blurDataURL={site.blurDataURL || undefined}
            onError={() => setImageError(true)}
            className="object-cover object-top w-full h-full transform transition-transform duration-700 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
          />
        </div>

        {/* Cinematic Inner Bezel Hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/15 group-hover:ring-2 group-hover:ring-[#0071e3]/40 dark:group-hover:ring-[#2997ff]/50 transition-all duration-200 z-20"
        />

        {/* Gradient Overlay & Info: slides up on hover, focus, or tap */}
        <div
          className={`absolute inset-0 z-30 flex flex-col justify-end p-6 sm:p-7 md:p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 ease-out ${
            isFocused ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-white text-lg sm:text-xl font-semibold tracking-tight truncate drop-shadow-sm">
              {site.name}
            </h2>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-white group-hover:text-white transition-colors bg-white/15 dark:bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25 group-hover:bg-[#0071e3] group-hover:border-[#0071e3]">
              <span>Visit</span>
              <span aria-hidden="true" className="text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </span>
          </div>

          {site.description && (
            <p className="mt-2 text-[13px] sm:text-sm text-white/80 line-clamp-2 leading-relaxed font-normal drop-shadow-sm">
              {site.description}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}
