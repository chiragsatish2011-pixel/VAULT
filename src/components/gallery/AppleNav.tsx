"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AppleNavProps {
  totalCount: number;
}

export function AppleNav({ totalCount }: AppleNavProps) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [count, setCount] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vault_curated_sites");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.filter((s: any) => !s.hidden).length;
        }
      } catch {}
    }
    return totalCount;
  });

  useEffect(() => {
    const updateCount = () => {
      try {
        const raw = localStorage.getItem("vault_curated_sites");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setCount(parsed.filter((s: any) => !s.hidden).length);
            return;
          }
        }
      } catch {}
      if (totalCount > 0) setCount(totalCount);
    };

    updateCount();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<any[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setCount(customEvent.detail.filter((s) => !s.hidden).length);
      } else {
        updateCount();
      }
    };

    window.addEventListener("vault_sites_updated", handleUpdate);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("vault_sites_updated", handleUpdate);
      window.removeEventListener("storage", updateCount);
    };
  }, [totalCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolledPastHero
          ? "bg-[#000000]/80 backdrop-blur-2xl border-b border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[2560px] mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
        {/* Wordmark with Specular Gradient */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded"
          aria-label="VAULT Home"
        >
          <span className="font-semibold text-[17px] tracking-[-0.03em] bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            VAULT
          </span>
        </Link>

        {/* Right Info: Live Status & Creator */}
        <div className="flex items-center gap-3 sm:gap-4 text-[12px] sm:text-[13px] text-white/70 font-normal">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-medium text-white/90">
              {count} Works
            </span>
          </div>

          <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline" />

          <a
            href="https://github.com/chiragsatish2011-pixel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded font-medium text-white/80"
          >
            Chirag S.
          </a>
        </div>
      </div>
    </header>
  );
}
