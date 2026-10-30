"use client";

import React, { useState } from "react";
import { ProjectDetail, GitFileTreeNode } from "@/types";
import { 
  FileCode, 
  Github, 
  GitBranch, 
  GitCommit, 
  Tag, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Code2,
  Folder,
  Layers,
  Paperclip
} from "lucide-react";

interface FolderDossierProps {
  project: ProjectDetail;
}

// Visual color palette for the dossier tabs matching Video 1
const FOLDER_COLORS = [
  { bg: "#1E40AF", border: "#3B82F6", text: "#FFFFFF", name: "Cobalt" },     // Blue
  { bg: "#B91C1C", border: "#EF4444", text: "#FFFFFF", name: "Crimson" },    // Red
  { bg: "#047857", border: "#10B981", text: "#FFFFFF", name: "Emerald" },    // Green
  { bg: "#6D28D9", border: "#8B5CF6", text: "#FFFFFF", name: "Violet" },     // Purple
  { bg: "#C2410C", border: "#F97316", text: "#FFFFFF", name: "Amber" },      // Orange
  { bg: "#831843", border: "#EC4899", text: "#FFFFFF", name: "Magenta" },    // Rose
  { bg: "#18181B", border: "#3F3F46", text: "#FFFFFF", name: "Obsidian" },   // Black
];

export function FolderDossierBrowser({ project }: FolderDossierProps) {
  const snapshot = project.repoSnapshot;
  const tree: GitFileTreeNode[] = snapshot ? snapshot.tree : [];
  const languages = snapshot ? snapshot.languages : {};
  const commits = snapshot ? snapshot.commits : [];
  const releases = snapshot ? snapshot.releases : [];

  // Group tree into meaningful dossier files
  const priorityFiles = tree.filter((f) => {
    const p = f.path.toLowerCase();
    return (
      p.endsWith(".md") ||
      p.endsWith(".ts") ||
      p.endsWith(".tsx") ||
      p.endsWith(".rs") ||
      p.endsWith(".go") ||
      p.endsWith(".py") ||
      p.endsWith("toml") ||
      p.endsWith("json")
    );
  });

  const displayFiles = priorityFiles.length > 0 ? priorityFiles : tree;

  // Selected file index
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedFile = displayFiles[selectedIndex] || displayFiles[0];
  const [copied, setCopied] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"code" | "commits" | "releases">("code");

  const handleCopy = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentColor = FOLDER_COLORS[selectedIndex % FOLDER_COLORS.length];

  return (
    <div className="space-y-6">
      {/* Top Header Strip with Editorial Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vault-border">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Source Tree & Manifests
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view switcher */}
          <div className="flex items-center gap-1 bg-vault-surface border border-vault-border rounded-lg p-1 text-xs font-mono">
            <button
              onClick={() => setActiveView("code")}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === "code" ? "bg-white text-black font-semibold" : "text-vault-muted hover:text-white"
              }`}
            >
              Files ({displayFiles.length})
            </button>
            <button
              onClick={() => setActiveView("commits")}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === "commits" ? "bg-white text-black font-semibold" : "text-vault-muted hover:text-white"
              }`}
            >
              Commits ({commits.length})
            </button>
            <button
              onClick={() => setActiveView("releases")}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === "releases" ? "bg-white text-black font-semibold" : "text-vault-muted hover:text-white"
              }`}
            >
              Releases ({releases.length})
            </button>
          </div>

          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-vault-surface hover:bg-vault-border border border-vault-border text-white text-xs font-mono transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 text-vault-muted" />
          </a>
        </div>
      </div>

      {activeView === "code" && (
        <div className="space-y-0">
          {/* THE FILES IN A ROW: Cascading Colored Dossier Folder Tabs (Video 1 Look & Feel) */}
          <div className="w-full overflow-x-auto scrollbar-none pt-2 pb-0 flex items-end gap-1.5 px-2">
            {displayFiles.slice(0, 12).map((file, idx) => {
              const isSelected = selectedIndex === idx;
              const col = FOLDER_COLORS[idx % FOLDER_COLORS.length];
              const parts = file.path.split("/");
              const fileName = parts[parts.length - 1];

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedIndex(idx)}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-mono transition-all duration-300 border-t border-l border-r select-none ${
                    isSelected
                      ? "shadow-2xl z-20 translate-y-0"
                      : "opacity-80 hover:opacity-100 translate-y-1.5 hover:translate-y-0 z-10"
                  }`}
                  style={{
                    backgroundColor: col.bg,
                    borderColor: col.border,
                    color: col.text,
                    minWidth: "140px",
                    maxWidth: "200px",
                  }}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span className="truncate font-semibold tracking-tight">{fileName}</span>
                  {file.size && (
                    <span className="text-[10px] opacity-70 ml-auto shrink-0 font-normal">
                      {(file.size / 1024).toFixed(0)}k
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dossier Folder Body Panel */}
          <div
            className="w-full rounded-b-2xl rounded-tr-2xl border p-4 sm:p-6 shadow-2xl relative transition-all duration-300"
            style={{
              backgroundColor: currentColor.bg,
              borderColor: currentColor.border,
            }}
          >
            {/* The Inner Archival Paper Sheet (with binder hole punches and stamped receipt) */}
            <div className="w-full rounded-xl bg-[#F8F8FA] text-[#121214] shadow-2xl p-6 sm:p-8 relative min-h-[550px] flex flex-col font-mono overflow-hidden">
              {/* Binder Hole Punches on left edge (Video 1 detail) */}
              <div className="absolute left-3 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
                <div className="w-3.5 h-3.5 rounded-full bg-[#050507] border border-black/20 shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#050507] border border-black/20 shadow-inner" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#050507] border border-black/20 shadow-inner" />
              </div>

              {/* Top Header of Document */}
              <div className="pl-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-300">
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                    {selectedFile?.path}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1 font-mono">
                    <span>Sha: {selectedFile?.sha?.slice(0, 7) || "HEAD"}</span>
                    <span>•</span>
                    <span>Size: {((selectedFile?.size || 0) / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>

              {/* Code Viewer Bar */}
              <div className="pl-6 pt-4 flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-600">
                  Showing {selectedFile?.content ? selectedFile.content.split("\n").length : 0} lines of source
                </span>
                {selectedFile?.content && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-mono transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Syntax Highlighted Code Box (Dark high-contrast interior) */}
              <div className="ml-6 mt-4 flex-1 rounded-xl bg-[#0A0A0E] text-[#F0F0F5] border border-neutral-300/40 p-4 font-mono text-xs overflow-auto max-h-[500px] shadow-inner relative">
                {selectedFile?.content ? (
                  <div className="flex gap-4">
                    {/* Line numbers */}
                    <div className="select-none text-neutral-600 text-right pr-2 border-r border-neutral-800 text-[11px] leading-relaxed">
                      {selectedFile.content.split("\n").map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    {/* Code lines */}
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed flex-1 text-neutral-200">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="p-8 text-center text-neutral-500 text-xs">
                    File content loading or binary asset.
                  </div>
                )}
              </div>

              {/* Watermark Archival Stamp (Bottom Right) */}
              <div className="absolute bottom-4 right-6 pointer-events-none opacity-20 transform -rotate-12 border-2 border-dashed border-neutral-800 rounded-full w-24 h-24 flex flex-col items-center justify-center text-center text-[9px] font-bold text-neutral-800">
                <span>VAULT</span>
                <span>DOSSIER</span>
                <span>AUTHENTIC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commits Sub-view */}
      {activeView === "commits" && (
        <div className="space-y-3">
          {commits.map((c) => (
            <div
              key={c.sha}
              className="p-4 rounded-xl bg-vault-surface border border-vault-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-vault-bg border border-vault-border/60 text-vault-accent">
                  <GitCommit className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-semibold text-white">
                    {c.message}
                  </h5>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-vault-muted">
                    <span className="text-white font-semibold">{c.author}</span>
                    <span>•</span>
                    <span>{new Date(c.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-vault-bg border border-vault-border text-xs font-mono text-vault-muted hover:text-white transition-colors shrink-0"
              >
                <span>{c.shortSha}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Releases Sub-view */}
      {activeView === "releases" && (
        <div className="space-y-4">
          {releases.map((rel) => (
            <div
              key={rel.tagName}
              className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span className="font-editorial font-bold text-white text-lg">
                    {rel.name || rel.tagName}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {rel.tagName}
                  </span>
                </div>
                <span className="text-xs font-mono text-vault-muted">
                  {new Date(rel.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-vault-muted whitespace-pre-wrap leading-relaxed font-mono bg-vault-bg p-4 rounded-lg border border-vault-border/60">
                {rel.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
