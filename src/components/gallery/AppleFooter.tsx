"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface AppleFooterProps {
  totalCount: number;
}

export function AppleFooter({ totalCount }: AppleFooterProps) {
  const currentYear = new Date().getFullYear();
  const [count, setCount] = useState(totalCount);

  useEffect(() => {
    if (totalCount > 0) {
      setCount(totalCount);
    } else {
      try {
        const raw = localStorage.getItem("vault_curated_sites");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setCount(parsed.filter((s: any) => !s.hidden).length);
        }
      } catch {}
    }
  }, [totalCount]);

  return (
    <footer className="w-full bg-[#fbfbfd] dark:bg-[#000000] text-black/60 dark:text-white/60 text-[12px] sm:text-[13px] border-t border-black/[0.08] dark:border-white/[0.08] py-14 sm:py-20 px-6 sm:px-10 transition-colors">
      <div className="max-w-[2560px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
          <span className="font-medium text-black/80 dark:text-white/80">VAULT</span>
          <span className="hidden sm:inline text-black/30 dark:text-white/30">•</span>
          <span>Designed & built by Chirag S.</span>
          <span className="hidden sm:inline text-black/30 dark:text-white/30">•</span>
          <span>{count} works</span>
        </div>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          <a
            href="https://github.com/chiragsatish2011-pixel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded"
          >
            GitHub
          </a>
          <span className="text-black/30 dark:text-white/30">•</span>
          <span>© {currentYear}</span>
        </div>
      </div>
    </footer>
  );
}
