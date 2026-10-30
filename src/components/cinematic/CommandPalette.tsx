"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Code2, Cpu, FileText, MonitorPlay, Shield, X, Sparkles, Globe, FolderGit2 } from "lucide-react";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";

interface QuickItem {
  id: string;
  title: string;
  subtitle: string;
  category: "project" | "section" | "action";
  icon: React.ReactNode;
  url: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projects, setProjects] = useState<Array<{ slug: string; title: string; tagline: string; tags: string[] }>>(
    FALLBACK_PROJECTS.map((p) => ({
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      tags: p.tags,
    }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchLatestProjects = useCallback(() => {
    fetch("/api/projects/quick?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {});
  }, []);

  // Load project list on mount
  useEffect(() => {
    fetchLatestProjects();
  }, [fetchLatestProjects]);

  // Keyboard shortcut listener and custom events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      fetchLatestProjects();
      setIsOpen(true);
    };

    const handleProjectsUpdated = () => {
      fetchLatestProjects();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("vault:open-command-palette", handleCustomOpen);
    window.addEventListener("vault:projects-updated", handleProjectsUpdated);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("vault:open-command-palette", handleCustomOpen);
      window.removeEventListener("vault:projects-updated", handleProjectsUpdated);
    };
  }, [fetchLatestProjects]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Build items based on query
  const items: QuickItem[] = [];

  // Project matches
  projects.forEach((p) => {
    const q = query.toLowerCase();
    if (
      !query ||
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      items.push({
        id: `proj-${p.slug}`,
        title: p.title,
        subtitle: p.tagline,
        category: "project",
        icon: <Cpu className="w-4 h-4 text-white" />,
        url: `/p/${p.slug}`,
      });
      // Also add direct section jumps for this project
      if (query.length > 1) {
        items.push({
          id: `code-${p.slug}`,
          title: `${p.title} — GitHub Code Browser`,
          subtitle: "Explore repo tree & syntax highlighted code",
          category: "section",
          icon: <Code2 className="w-4 h-4 text-neutral-400" />,
          url: `/p/${p.slug}?tab=code`,
        });
        items.push({
          id: `prev-${p.slug}`,
          title: `${p.title} — Live Sandbox Preview`,
          subtitle: "Responsive multi-device iframe inspection",
          category: "section",
          icon: <MonitorPlay className="w-4 h-4 text-emerald-400" />,
          url: `/p/${p.slug}?tab=preview`,
        });
      }
    }
  });

  // Global actions
  if (
    !query ||
    "add website sync github ingest".includes(query.toLowerCase())
  ) {
    items.push({
      id: "act-add-website",
      title: "Add New Website / Sync GitHub",
      subtitle: "Ingest repository or live URL with auto-updating 16:9 banner",
      category: "action",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      url: "#add-website",
    });
  }

  // Keyboard navigation within the list
  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex]);
    }
  };

  const handleSelect = (item: QuickItem) => {
    setIsOpen(false);
    if (item.url === "#add-website") {
      window.dispatchEvent(new CustomEvent("vault:open-add-website"));
      return;
    }
    router.push(item.url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#09090b] border border-neutral-800 shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleItemKeyDown}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, repos, live URLs, or actions..."
            className="w-full bg-transparent text-sm sm:text-base font-mono text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-neutral-900 font-sans">
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm font-mono text-neutral-500">
              No matching showcases or repositories found for &quot;{query}&quot;
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? "bg-neutral-900 border border-neutral-700" : "hover:bg-neutral-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "bg-black text-neutral-300 border-neutral-800"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.category === "action" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ACTION
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 truncate mt-0.5 font-sans font-medium">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "text-white translate-x-1" : "text-neutral-600"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-neutral-900 bg-black flex items-center justify-between text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-sans font-semibold text-neutral-400">{items.length} Results</span>
        </div>
      </div>
    </div>
  );
}
