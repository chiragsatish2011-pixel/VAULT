"use client";

import React, { useState } from "react";
import { ProjectDetail, GitFileTreeNode } from "@/types";
import { 
  Folder, 
  FileCode, 
  Github, 
  GitBranch, 
  GitCommit, 
  Tag, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Code2
} from "lucide-react";

interface CodeBrowserProps {
  project: ProjectDetail;
}

export function CodeBrowser({ project }: CodeBrowserProps) {
  const snapshot = project.repoSnapshot;
  const tree: GitFileTreeNode[] = snapshot ? snapshot.tree : [];
  const languages = snapshot ? snapshot.languages : {};
  const commits = snapshot ? snapshot.commits : [];
  const releases = snapshot ? snapshot.releases : [];

  // Default selected file: README.md or first blob
  const defaultFile = tree.find((f) => f.path.toLowerCase() === "readme.md") || tree[0];
  const [selectedFile, setSelectedFile] = useState<GitFileTreeNode | undefined>(defaultFile);
  const [activeSubTab, setActiveSubTab] = useState<"code" | "commits" | "releases">("code");
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group tree into folder structures
  const folders = Array.from(
    new Set(
      tree.map((f) => {
        const parts = f.path.split("/");
        return parts.length > 1 ? parts.slice(0, -1).join("/") : null;
      }).filter(Boolean)
    )
  );

  return (
    <div className="space-y-6">
      {/* Top GitHub Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-vault-surface border border-vault-border">
        {/* Branch & Sub-nav Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-bg border border-vault-border text-xs font-mono text-vault-text">
            <GitBranch className="w-3.5 h-3.5 text-vault-accent" />
            <span className="font-semibold">main</span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-vault-bg border border-vault-border/80 text-xs font-mono">
            <button
              onClick={() => setActiveSubTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeSubTab === "code"
                  ? "bg-vault-accent/20 text-vault-accent font-semibold"
                  : "text-vault-muted hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Tree ({tree.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("commits")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeSubTab === "commits"
                  ? "bg-vault-accent/20 text-vault-accent font-semibold"
                  : "text-vault-muted hover:text-white"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commits ({commits.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("releases")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeSubTab === "releases"
                  ? "bg-vault-accent/20 text-vault-accent font-semibold"
                  : "text-vault-muted hover:text-white"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Releases ({releases.length})</span>
            </button>
          </div>
        </div>

        {/* Action: Open on GitHub */}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-vault-bg hover:bg-vault-border border border-vault-border text-white text-xs font-mono transition-colors"
        >
          <Github className="w-4 h-4 text-vault-accent" />
          <span>Open on GitHub</span>
          <ExternalLink className="w-3 h-3 text-vault-muted" />
        </a>
      </div>

      {/* Languages Breakdown Bar */}
      {Object.keys(languages).length > 0 && (
        <div className="p-3.5 rounded-xl bg-vault-surface/60 border border-vault-border space-y-2">
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-vault-bg">
            {Object.entries(languages).map(([lang, pct], idx) => {
              const colors = ["#00F0FF", "#9D4EDD", "#10B981", "#F59E0B", "#FF3366"];
              const color = colors[idx % colors.length];
              return (
                <div
                  key={lang}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  title={`${lang}: ${pct}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-vault-muted">
            {Object.entries(languages).map(([lang, pct], idx) => {
              const colors = ["#00F0FF", "#9D4EDD", "#10B981", "#F59E0B", "#FF3366"];
              const color = colors[idx % colors.length];
              return (
                <div key={lang} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-white">{lang}</span>
                  <span className="text-vault-subtle">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SubTab 1: Code Tree & File Viewer */}
      {activeSubTab === "code" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-xl border border-vault-border overflow-hidden bg-vault-card">
          {/* Left Tree Explorer (4 cols) */}
          <div className="md:col-span-4 border-r border-vault-border/80 bg-vault-surface/60 p-4 space-y-3 max-h-[680px] overflow-y-auto">
            <div className="text-[11px] font-mono text-vault-subtle uppercase tracking-wider flex items-center justify-between pb-2 border-b border-vault-border/60">
              <span>EXPLORER</span>
              <span>{tree.length} FILES</span>
            </div>

            <div className="space-y-1">
              {tree.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-vault-accent/15 text-vault-accent font-semibold border border-vault-accent/30"
                        : "text-vault-muted hover:text-white hover:bg-vault-bg"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-vault-accent" : "text-vault-muted"}`} />
                      <span className="truncate">{file.path}</span>
                    </div>
                    {file.size && (
                      <span className="text-[10px] text-vault-subtle shrink-0">
                        {(file.size / 1024).toFixed(1)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right File Viewer (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-vault-bg min-h-[500px] max-h-[680px]">
            {/* File Header & Breadcrumbs */}
            <div className="px-4 py-2.5 border-b border-vault-border flex items-center justify-between bg-vault-surface/80">
              <div className="flex items-center gap-1.5 text-xs font-mono text-vault-muted truncate">
                <span>{project.slug}</span>
                <ChevronRight className="w-3 h-3 text-vault-subtle" />
                <span className="text-white font-semibold">{selectedFile?.path || "Select a file"}</span>
              </div>

              {selectedFile?.content && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-vault-card border border-vault-border text-xs font-mono text-vault-muted hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-vault-emerald" />
                      <span className="text-vault-emerald">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Code Content Container */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-vault-text bg-[#09090e]">
              {selectedFile?.content ? (
                <div className="flex gap-4">
                  {/* Line Numbers */}
                  <div className="select-none text-vault-subtle text-right pr-2 border-r border-vault-border/50 text-[11px] leading-relaxed">
                    {selectedFile.content.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Code Body */}
                  <pre className="overflow-x-auto whitespace-pre leading-relaxed text-vault-text flex-1">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-vault-muted text-xs">
                  Select a file from the explorer on the left to inspect its contents.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Commit History */}
      {activeSubTab === "commits" && (
        <div className="space-y-3">
          {commits.length === 0 ? (
            <div className="p-8 text-center text-vault-muted text-xs font-mono glass-panel rounded-xl">
              No commit history recorded in current snapshot.
            </div>
          ) : (
            commits.map((c) => (
              <div
                key={c.sha}
                className="p-4 rounded-xl bg-vault-surface border border-vault-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-vault-borderHover transition-colors"
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
                      <span className="text-vault-accent">{c.author}</span>
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
            ))
          )}
        </div>
      )}

      {/* SubTab 3: Releases */}
      {activeSubTab === "releases" && (
        <div className="space-y-4">
          {releases.length === 0 ? (
            <div className="p-8 text-center text-vault-muted text-xs font-mono glass-panel rounded-xl">
              No releases tagged in current snapshot.
            </div>
          ) : (
            releases.map((rel) => (
              <div
                key={rel.tagName}
                className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-vault-emerald" />
                    <span className="font-display font-bold text-white text-base">
                      {rel.name || rel.tagName}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-vault-emerald/15 text-vault-emerald border border-vault-emerald/30">
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
