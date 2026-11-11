"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AppleNavProps {
  totalCount: number;
}

export function AppleNav({ totalCount }: AppleNavProps) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Past 100px scroll depth, activate the frosted backdrop
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
          ? "bg-[#fbfbfd]/75 dark:bg-[#000000]/75 backdrop-blur-2xl border-b border-black/[0.08] dark:border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
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
          <span className="font-semibold text-[17px] tracking-[-0.03em] bg-gradient-to-b from-neutral-950 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
            VAULT
          </span>
        </Link>

        {/* Right Info: Live Status & Creator */}
        <div className="flex items-center gap-3 sm:gap-4 text-[12px] sm:text-[13px] text-black/60 dark:text-white/60 font-normal">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-medium text-black/80 dark:text-white/80">
              {totalCount} Works
            </span>
          </div>

          <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20 hidden sm:inline" />

          <a
            href="https://github.com/chiragsatish2011-pixel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded font-medium"
          >
            Chirag S.
          </a>
        </div>
      </div>
    </header>
  );
}
