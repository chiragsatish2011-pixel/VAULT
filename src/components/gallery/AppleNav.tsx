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
      // Past 180px scroll depth, activate the frosted backdrop
      setScrolledPastHero(window.scrollY > 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolledPastHero
          ? "bg-[#fbfbfd]/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[2560px] mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-black dark:text-white transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded"
          aria-label="VAULT Home"
        >
          <span className="font-semibold text-[17px] tracking-tight">VAULT</span>
        </Link>

        {/* Right Info: Live site counter & creator */}
        <div className="flex items-center gap-4 text-[13px] text-black/60 dark:text-white/60 font-normal">
          <span>{totalCount} Works</span>
          <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
          <a
            href="https://github.com/chiragsatish2011-pixel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded"
          >
            Chirag S.
          </a>
        </div>
      </div>
    </header>
  );
}
