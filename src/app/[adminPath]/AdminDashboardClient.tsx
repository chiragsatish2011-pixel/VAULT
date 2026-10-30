"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Terminal, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Download, 
  Upload, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  ArrowUp, 
  ArrowDown,
  Edit,
  Sliders,
  Layers,
  Database
} from "lucide-react";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  liveUrl: string;
  repoUrl: string;
  hostingNotes?: string | null;
  status: string;
  visibility: string;
  featured: boolean;
  tags: string[];
  accentColor: string;
  lastSyncedSha?: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  docsCount: number;
  hasSpec: boolean;
}

interface AdminDashboardProps {
  initialProjects: ProjectItem[];
  adminPath: string;
}

export function AdminDashboardClient({ initialProjects, adminPath }: AdminDashboardProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<ProjectItem | null>(null);

  // Ingestion form state
  const [liveUrl, setLiveUrl] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [hostingNotes, setHostingNotes] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState<string>("#00F0FF");

  // Ingestion pipeline logs
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ step: number; message: string; timestamp: string }>>([]);
  const [ingestionCompleted, setIngestionCompleted] = useState<{ slug: string; url: string } | null>(null);

  // Logout handler
  const handleLogout = async (everywhere = false) => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ everywhere }),
    });
    window.location.href = "/";
  };

  // Run Ingestion Pipeline
  const handleStartIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIngesting(true);
    setLogs([]);
    setIngestionCompleted(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveUrl,
          repoUrl,
          hostingNotes: hostingNotes || undefined,
          tags,
          featured: isFeatured,
          accentColor,
        }),
      });

      if (!response.body) {
        throw new Error("No response body received from ingestion server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(line.replace("data: ", ""));
              setLogs((prev) => [...prev, eventData]);

              if (eventData.data && eventData.data.url) {
                setIngestionCompleted({
                  slug: eventData.data.slug,
                  url: eventData.data.url,
                });
              }
            } catch {}
          }
        }
      }

      // Refresh project list
      const updatedRes = await fetch("/api/admin/projects");
      if (updatedRes.ok) {
        const updatedList = await updatedRes.json();
        setProjects(
          updatedList.map((p: any) => ({
            ...p,
            tags: JSON.parse(p.tags || "[]"),
            docsCount: p.docs?.length || 0,
            hasSpec: !!p.specCard,
          }))
        );
      }
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        { step: -1, message: `Pipeline Exception: ${err.message}`, timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsIngesting(false);
    }
  };

  // Delete project
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert("Failed to delete project.");
    }
  };

  // Re-sync single project
  const handleResync = (p: ProjectItem) => {
    setLiveUrl(p.liveUrl);
    setRepoUrl(p.repoUrl);
    setHostingNotes(p.hostingNotes || "");
    setTagsInput(p.tags.join(", "));
    setIsFeatured(p.featured);
    setAccentColor(p.accentColor);
    setShowAddModal(true);
  };

  // Reorder projects
  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= projects.length) return;

    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[newIdx];
    newProjects[newIdx] = temp;

    // Update orderIndex
    newProjects[index].orderIndex = index;
    newProjects[newIdx].orderIndex = newIdx;

    setProjects(newProjects);

    // Save to server
    await fetch(`/api/admin/projects/${newProjects[index].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIndex: index }),
    });
    await fetch(`/api/admin/projects/${newProjects[newIdx].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIndex: newIdx }),
    });
  };

  // JSON Export
  const handleExportJson = async () => {
    const res = await fetch("/api/admin/export");
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-vault-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vault-emerald animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider">
              VAULT CONTROL CENTER
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-vault-surface border border-vault-border text-vault-accent">
              PATH: /{adminPath}
            </span>
          </div>
          <p className="text-xs text-vault-muted font-mono mt-1">
            Sovereign project ingestion, automated reverse engineering, and spec sheet management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vault-accent text-black font-semibold text-xs hover:bg-cyan-300 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest New Project</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-vault-surface border border-vault-border text-xs font-mono text-vault-muted hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-vault-violet" />
            <span>Backup JSON</span>
          </button>
          <button
            onClick={() => handleLogout(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-vault-surface border border-vault-border text-xs font-mono text-vault-crimson hover:bg-vault-crimson/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Projects Table Panel */}
      <div className="glass-panel rounded-2xl border border-vault-border overflow-hidden bg-vault-card">
        <div className="p-4 bg-vault-surface/60 border-b border-vault-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-vault-accent" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              MANAGED SHOWCASES ({projects.length})
            </span>
          </div>
          <span className="text-[11px] font-mono text-vault-subtle">
            DRAG OR ARROW TO REORDER
          </span>
        </div>

        <div className="divide-y divide-vault-border/60">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-vault-muted text-xs font-mono">
              No projects in database. Click "Ingest New Project" to add one.
            </div>
          ) : (
            projects.map((p, idx) => (
              <div
                key={p.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-vault-surface/30 transition-colors"
              >
                {/* Left: Reorder & Info */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Reorder Arrows */}
                  <div className="flex flex-col gap-1 text-vault-muted pt-1">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === projects.length - 1}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Accent Dot */}
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: p.accentColor }}
                  />

                  {/* Text meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/p/${p.slug}`}
                        target="_blank"
                        className="font-display font-bold text-sm text-white hover:text-vault-accent transition-colors flex items-center gap-1.5 truncate"
                      >
                        <span>{p.title}</span>
                        <ExternalLink className="w-3 h-3 text-vault-muted" />
                      </Link>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-vault-surface border border-vault-border text-vault-emerald">
                        {p.status}
                      </span>
                      {p.featured && (
                        <span className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-vault-amber/15 text-vault-amber border border-vault-amber/30">
                          <Star className="w-2.5 h-2.5 fill-vault-amber" /> Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-vault-muted truncate mt-0.5 max-w-xl">
                      {p.tagline}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-vault-subtle mt-2">
                      <span>Docs: {p.docsCount} sections</span>
                      <span>•</span>
                      <span>Spec Card: {p.hasSpec ? "Ready" : "Missing"}</span>
                      <span>•</span>
                      <span>Sha: {p.lastSyncedSha?.slice(0, 7) || "HEAD"}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResync(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-surface hover:bg-vault-border border border-vault-border text-xs font-mono text-vault-accent transition-colors"
                    title="Re-run pipeline with GitHub sync"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-Analyze</span>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-2 rounded-lg bg-vault-surface hover:bg-vault-crimson/20 border border-vault-border text-vault-muted hover:text-vault-crimson transition-colors"
                    title="Delete showcase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Ingest Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-vault-surface border border-vault-border rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-vault-border">
              <div className="flex items-center gap-2 text-vault-accent">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-white">
                  ONE-CLICK INGESTION PIPELINE
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setIsIngesting(false);
                }}
                className="text-vault-muted hover:text-white text-xs font-mono px-2 py-1"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Ingestion Form */}
            <form onSubmit={handleStartIngest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-vault-subtle uppercase">
                    Live Site URL *
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://myproject.dev"
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-vault-bg border border-vault-border text-xs text-white placeholder-vault-muted focus:outline-none focus:border-vault-accent font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-vault-subtle uppercase">
                    GitHub Repo URL *
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-vault-bg border border-vault-border text-xs text-white placeholder-vault-muted focus:outline-none focus:border-vault-accent font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-vault-subtle uppercase">
                  Hosting & Storage Notes (Optional)
                </label>
                <input
                  type="text"
                  value={hostingNotes}
                  onChange={(e) => setHostingNotes(e.target.value)}
                  placeholder="e.g. Hetzner AX102 cluster, ZFS NVMe RAID-1, Cloudflare Anycast"
                  className="w-full px-3.5 py-2 rounded-lg bg-vault-bg border border-vault-border text-xs text-white placeholder-vault-muted focus:outline-none focus:border-vault-accent font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-mono text-vault-subtle uppercase">
                    Custom Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Rust, WebAssembly, ClickHouse"
                    className="w-full px-3.5 py-2 rounded-lg bg-vault-bg border border-vault-border text-xs text-white placeholder-vault-muted focus:outline-none focus:border-vault-accent font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-vault-subtle uppercase">
                    Signature Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-vault-border bg-vault-bg cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white">{accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded bg-vault-bg border-vault-border text-vault-accent"
                />
                <label htmlFor="featuredToggle" className="text-xs font-mono text-white cursor-pointer">
                  Pin as Featured Showcase on Home Landing
                </label>
              </div>

              <button
                type="submit"
                disabled={isIngesting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-vault-accent hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
              >
                {isIngesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span>Run Analysis & Build Showcase</span>
                  </>
                )}
              </button>
            </form>

            {/* Live SSE Ingestion Console Output */}
            {logs.length > 0 && (
              <div className="p-4 rounded-xl bg-[#09090e] border border-vault-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-vault-subtle pb-1 border-b border-vault-border/60">
                  <span>LIVE INGESTION LOG</span>
                  <span>{logs.length} EVENTS</span>
                </div>
                <div className="font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 ${
                        log.message.startsWith("ERROR")
                          ? "text-vault-crimson"
                          : log.message.startsWith("SUCCESS")
                          ? "text-vault-emerald font-bold"
                          : "text-vault-muted"
                      }`}
                    >
                      <span className="text-vault-subtle select-none">
                        [{log.step > 0 ? `0${log.step}/05` : "ERR"}]
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>

                {ingestionCompleted && (
                  <div className="pt-3 border-t border-vault-border/60 flex items-center justify-between">
                    <span className="text-xs font-mono text-vault-emerald">
                      Showcase ready for viewing!
                    </span>
                    <a
                      href={ingestionCompleted.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-emerald text-black text-xs font-bold font-mono"
                    >
                      <span>View Showcase Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
