"use client";

import React, { useState } from "react";
import { ProjectDetail, DocSection } from "@/types";
import { 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  GitCommit,
  BookOpen
} from "lucide-react";

interface ReverseDocsProps {
  project: ProjectDetail;
}

export function ReverseDocsView({ project }: ReverseDocsProps) {
  const docs = project.docs;

  // Order sections logically
  const sectionKeys = [
    { key: "overview", label: "Executive Summary", icon: <Sparkles className="w-4 h-4 text-vault-accent" /> },
    { key: "walkthrough", label: "Module Walkthrough", icon: <Layers className="w-4 h-4 text-vault-violet" /> },
    { key: "trade_offs", label: "Decisions & Trade-Offs", icon: <AlertCircle className="w-4 h-4 text-vault-amber" /> },
    { key: "reverse_narrative", label: "Reconstruction Guide", icon: <Terminal className="w-4 h-4 text-vault-emerald" /> },
  ];

  const [activeSection, setActiveSection] = useState<string>("overview");

  const currentDoc = docs.find((d) => d.section === activeSection) || docs[0];

  return (
    <div className="space-y-6">
      {/* Top Section Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sectionKeys.map((sec) => {
          const isSelected = activeSection === sec.key;
          const hasContent = docs.some((d) => d.section === sec.key);
          if (!hasContent) return null;

          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-vault-surface text-white border-vault-accent font-semibold shadow-sm"
                  : "bg-vault-surface/40 border-vault-border text-vault-muted hover:text-white"
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Doc Content Panel */}
      <div className="glass-panel rounded-2xl border border-vault-border p-8 bg-vault-card/80 space-y-6">
        {/* Header with Provenance Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-vault-border/80 gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-vault-accent" />
            <h3 className="font-display font-bold text-lg text-white">
              {sectionKeys.find((s) => s.key === activeSection)?.label || "Deep Documentation"}
            </h3>
          </div>

          {/* Provenance pill */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-vault-subtle">
            {currentDoc?.generatedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-vault-muted" />
                <span>Generated: {new Date(currentDoc.generatedAt).toLocaleDateString()}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-vault-accent" />
              <span>Sha: {currentDoc?.sourceSha?.slice(0, 7) || project.lastSyncedSha?.slice(0, 7) || "HEAD"}</span>
            </span>
          </div>
        </div>

        {/* Markdown Rendered Content */}
        {currentDoc ? (
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-vault-text/90 leading-relaxed font-sans space-y-4">
            {currentDoc.markdown.split("\n\n").map((para, idx) => {
              // Code block
              if (para.startsWith("```")) {
                const codeLines = para.replace(/```[a-z]*/, "").replace(/```$/, "");
                return (
                  <pre
                    key={idx}
                    className="p-4 rounded-xl bg-vault-bg border border-vault-border text-xs font-mono text-vault-accent overflow-x-auto my-4"
                  >
                    <code>{codeLines}</code>
                  </pre>
                );
              }
              // Headers
              if (para.startsWith("### ")) {
                return (
                  <h4 key={idx} className="text-base font-display font-bold text-white mt-6 mb-2">
                    {para.replace("### ", "")}
                  </h4>
                );
              }
              if (para.startsWith("#### ")) {
                return (
                  <h5 key={idx} className="text-sm font-display font-semibold text-vault-accent mt-4 mb-1">
                    {para.replace("#### ", "")}
                  </h5>
                );
              }
              // Normal text with bold highlight
              return (
                <p key={idx} className="leading-relaxed text-vault-muted">
                  {para}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-vault-muted">
            No documentation generated for this section yet.
          </div>
        )}

        {/* Grounding Callout */}
        <div className="p-4 rounded-xl bg-vault-surface/60 border border-vault-border/60 flex items-start gap-3 text-xs text-vault-muted font-mono">
          <CheckCircle2 className="w-4 h-4 text-vault-emerald shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Grounded Verification: </span>
            Every module and architecture claim is extracted from actual repository files and configurations. Items marked <span className="text-vault-amber font-semibold">[Inferred]</span> represent intelligent deductions without direct code assertions.
          </div>
        </div>
      </div>
    </div>
  );
}
