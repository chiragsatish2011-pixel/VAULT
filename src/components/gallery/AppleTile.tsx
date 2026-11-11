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
    ? "/captures/default-fallback.webp"
    : site.thumbnailUrl || site.thumbnail1440 || site.thumbnail800 || "/captures/default-fallback.webp";

  return (
    <div
      className="grid-tile relative group overflow-hidden bg-black aspect-[16/10] select-none"
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
        {/* Full-bleed Thumbnail */}
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={site.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, (max-width: 1920px) 25vw, (max-width: 2560px) 20vw, 16.66vw"
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
            placeholder={site.blurDataURL ? "blur" : "empty"}
            blurDataURL={site.blurDataURL || undefined}
            onError={() => setImageError(true)}
            className="object-cover object-top w-full h-full transform transition-transform duration-700 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
          />
        </div>

        {/* Gradient Overlay & Info: slides up on hover, focus, or tap */}
        <div
          className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-7 md:p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 ease-out ${
            isFocused ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-white text-lg sm:text-xl font-semibold tracking-tight truncate">
              {site.name}
            </h2>
            <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium text-white/90 group-hover:text-apple-blue transition-colors">
              Visit
              <span aria-hidden="true" className="text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </span>
          </div>

          {site.description && (
            <p className="mt-1.5 text-[13px] sm:text-sm text-white/75 line-clamp-2 leading-relaxed font-normal">
              {site.description}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}
