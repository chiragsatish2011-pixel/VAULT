"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { VaultSite } from "@/lib/sites-store";
import { AppleTile } from "./AppleTile";

interface AppleGridProps {
  sites: VaultSite[];
}

export function AppleGrid({ sites: initialSites }: AppleGridProps) {
  const [sites, setSites] = useState<VaultSite[]>(() => {
    // 1. Immediately check localStorage during client hydration
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vault_curated_sites");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((s: VaultSite) => !s.hidden);
          }
        }
      } catch {}
    }
    return (initialSites || []).filter((s) => !s.hidden);
  });

  const syncFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem("vault_curated_sites");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSites(parsed.filter((s: VaultSite) => !s.hidden));
          return true;
        }
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => {
    // 1. Prioritize local client storage
    const hasLocal = syncFromStorage();

    // 2. If no local edits exist, seed from server initialSites
    if (!hasLocal && initialSites && initialSites.length > 0) {
      setSites(initialSites.filter((s) => !s.hidden));
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(initialSites));
      } catch {}
    }

    // 3. Listen for in-window updates from Admin console
    const handleVaultUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<VaultSite[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setSites(customEvent.detail.filter((s) => !s.hidden));
      } else {
        syncFromStorage();
      }
    };
    window.addEventListener("vault_sites_updated", handleVaultUpdate);

    // 4. Listen for cross-tab storage updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vault_curated_sites") {
        syncFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 5. BroadcastChannel for instant cross-tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("vault_sync_channel");
        bc.onmessage = (msg) => {
          if (msg.data?.type === "SYNC_SITES" && Array.isArray(msg.data.sites)) {
            setSites(msg.data.sites.filter((s: VaultSite) => !s.hidden));
          }
        };
      } catch {}
    }

    // 6. Dynamic fetch from public /api/sites
    fetch("/api/sites", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sites && Array.isArray(data.sites) && data.sites.length > 0) {
          try {
            const rawLocal = localStorage.getItem("vault_curated_sites");
            const localUpdatedAt = localStorage.getItem("vault_curated_updated_at");
            // Only overwrite if client has not made custom local edits
            if (!rawLocal || !localUpdatedAt) {
              setSites(data.sites.filter((s: VaultSite) => !s.hidden));
              localStorage.setItem("vault_curated_sites", JSON.stringify(data.sites));
            }
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("vault_sites_updated", handleVaultUpdate);
      window.removeEventListener("storage", handleStorageChange);
      if (bc) bc.close();
    };
  }, [initialSites, syncFromStorage]);

  if (!sites || sites.length === 0) {
    return (
      <section className="w-full max-w-4xl mx-auto py-16 sm:py-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="relative w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-xl shadow-2xl flex flex-col items-center overflow-hidden">
          {/* Subtle Ambient Backlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial-glow opacity-30 -z-10"
          />

          {/* Aperture / Screen Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-[#121216] border-2 border-white/15 flex items-center justify-center mb-6 text-[#2997ff] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            No projects published yet
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto mb-8 font-normal leading-relaxed">
            Manage and curate your web portfolio from the admin console.
          </p>

          <Link
            href="/chirag"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-b from-[#0077ed] to-[#0062c4] hover:from-[#0071e3] hover:to-[#005bb5] active:scale-98 text-white font-medium text-sm transition-all shadow-[0_6px_24px_rgba(0,113,227,0.35),inset_0_1px_0_0_rgba(255,255,255,0.3)] border border-white/20 cursor-pointer"
          >
            <span>Open Admin Console</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Screen Wall Gallery"
      className="w-full max-w-[2560px] mx-auto px-5 sm:px-8 lg:px-12 pb-24 sm:pb-32"
    >
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 sm:gap-7 lg:gap-8">
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
