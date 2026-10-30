"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, RefreshCw } from "lucide-react";
import { AddWebsiteModal } from "./AddWebsiteModal";

export function HeaderNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener("vault:open-add-website", handleOpenModal);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("vault:open-add-website", handleOpenModal);
    };
  }, []);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("vault:open-command-palette"));
  };

  return (
    <>
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <header
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-md border-b border-neutral-900 shadow-xl py-3"
            : "bg-black border-b border-neutral-900/60 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
          {/* Left Nav items (Video 1: Explore, Timeline, Map, Collections) */}
          <nav className="flex items-center gap-7 sm:gap-9">
            <Link href="/#explore" className="hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/#timeline" className="hover:text-white transition-colors">
              Timeline
            </Link>
            <Link href="/#map" className="hover:text-white transition-colors hidden sm:inline">
              Map
            </Link>
            <Link href="/#collections" className="hover:text-white transition-colors hidden md:inline">
              Collections
            </Link>
          </nav>

          {/* Center Circular (files) Logo (Exact Video 1 Detail) */}
          <Link href="/" className="group flex items-center justify-center">
            <div className="w-11 h-11 rounded-full border-2 border-neutral-500 group-hover:border-white flex items-center justify-center transition-all bg-black/40 group-hover:scale-105 shadow-md">
              <span className="font-editorial italic font-black text-white text-base tracking-tighter">
                files
              </span>
            </div>
          </Link>

          {/* Right Nav items: Search, + Add Website / Sync */}
          <div className="flex items-center gap-5 sm:gap-7">
            <button
              onClick={openCommandPalette}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Pure, Safe & Easy Method to Add New Website and Sync via GitHub */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono font-black text-xs transition-all cursor-pointer shadow-md hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Website</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
