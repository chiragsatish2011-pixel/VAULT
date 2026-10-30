"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Code2, Cpu, FileText, MonitorPlay, Shield, X, Sparkles } from "lucide-react";

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
  const [projects, setProjects] = useState<Array<{ slug: string; title: string; tagline: string; tags: string[] }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load project list for search
  useEffect(() => {
    fetch("/api/projects/quick")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {
        // Fallback static entries
        setProjects([
          { slug: "kronos", title: "KRONOS Stream Engine", tagline: "Distributed time-series engine in Rust", tags: ["Rust", "Wasm"] },
          { slug: "neura-flow", title: "NEURA-FLOW Studio", tagline: "Visual multimodal agent orchestrator", tags: ["Next.js", "PyTorch"] },
          { slug: "cyber-vault", title: "CYBER-VAULT Sovereign Identity", tagline: "Zero-knowledge secrets manager", tags: ["Go", "WebCrypto"] },
        ]);
      });
  }, []);

  // Keyboard shortcut listener
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

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("vault:open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("vault:open-command-palette", handleCustomOpen);
    };
  }, []);

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
    if (
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.tagline.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    ) {
      items.push({
        id: `proj-${p.slug}`,
        title: p.title,
        subtitle: p.tagline,
        category: "project",
        icon: <Cpu className="w-4 h-4 text-vault-accent" />,
        url: `/p/${p.slug}`,
      });
      // Also add direct section jumps for this project
      if (query.length > 2) {
        items.push({
          id: `code-${p.slug}`,
          title: `${p.title} — GitHub Code Browser`,
          subtitle: "Explore repo tree & syntax highlighted code",
          category: "section",
          icon: <Code2 className="w-4 h-4 text-vault-violet" />,
          url: `/p/${p.slug}?tab=code`,
        });
        items.push({
          id: `spec-${p.slug}`,
          title: `${p.title} — Model Spec Card`,
          subtitle: "NVIDIA-style structured specification sheet",
          category: "section",
          icon: <FileText className="w-4 h-4 text-vault-emerald" />,
          url: `/p/${p.slug}?tab=spec`,
        });
      }
    }
  });

  // Action shortcuts
  if (!query || "home gallery projects".includes(query.toLowerCase())) {
    items.push({
      id: "act-home",
      title: "Public Showcase Gallery",
      subtitle: "Return to home showcase gallery and projects",
      category: "action",
      icon: <Sparkles className="w-4 h-4 text-vault-amber" />,
      url: "/",
    });
  }

  const handleSelect = (item: QuickItem) => {
    setIsOpen(false);
    router.push(item.url);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-vault-surface border border-vault-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-vault-border/80 gap-3 bg-vault-card/60">
          <Search className="w-4 h-4 text-vault-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a project name, tech stack, or jump to code/spec..."
            className="w-full bg-transparent text-sm text-white placeholder-vault-muted outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-vault-muted hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono bg-vault-bg px-2 py-0.5 rounded border border-vault-border text-vault-muted shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-vault-muted font-mono">
              No matching projects or documentation found.
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-vault-accent/10 border border-vault-accent/30 text-white"
                      : "text-vault-muted hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-md ${
                        isSelected ? "bg-vault-accent/20" : "bg-vault-bg"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-vault-muted truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-vault-bg border border-vault-border text-vault-subtle">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-vault-accent" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-vault-border/60 bg-vault-bg flex items-center justify-between text-[11px] font-mono text-vault-subtle">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div>VAULT SEARCH ENGINE</div>
        </div>
      </div>
    </div>
  );
}
