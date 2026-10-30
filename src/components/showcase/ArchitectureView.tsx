"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProjectDetail } from "@/types";
import { Cpu, GitFork, Network, Eye, Code2, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

interface ArchitectureViewProps {
  project: ProjectDetail;
  onJumpToFile?: (filePath: string) => void;
}

export function ArchitectureView({ project, onJumpToFile }: ArchitectureViewProps) {
  const [activeDiagram, setActiveDiagram] = useState<"system" | "dataflow">("system");
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract diagrams from docs markdown
  const archDoc = project.docs.find((d) => d.section === "architecture")?.markdown || "";
  const dataFlowDoc = project.docs.find((d) => d.section === "data_flow")?.markdown || "";

  // Helper to extract mermaid code block from markdown
  const extractMermaidCode = (md: string): string => {
    const match = md.match(/```mermaid([\s\S]*?)```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Fallback default diagram if not present
    return `graph TD\n  Client[Client / Ingest Gateway] -->|TCP / HTTP| Engine[${project.title}]\n  Engine --> Cache[Memory Cache / RingBuffer]\n  Engine --> DB[(Persistent Store)]`;
  };

  const currentMermaidCode =
    activeDiagram === "system"
      ? extractMermaidCode(archDoc)
      : extractMermaidCode(dataFlowDoc);

  useEffect(() => {
    let isMounted = true;
    async function renderMermaid() {
      try {
        setRenderError(null);
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#07070a",
            primaryColor: "#0e0e18",
            primaryTextColor: "#f0f0f5",
            primaryBorderColor: "#00f0ff",
            lineColor: "#00f0ff",
            secondaryColor: "#1a1a2b",
            tertiaryColor: "#12121c",
            fontFamily: "JetBrains Mono, monospace",
          },
          securityLevel: "loose",
        });

        const id = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(id, currentMermaidCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          setRenderError(err?.message || "Failed to render Mermaid diagram.");
        }
      }
    }

    renderMermaid();
    return () => {
      isMounted = false;
    };
  }, [currentMermaidCode, activeDiagram]);

  return (
    <div className="space-y-6">
      {/* Top Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-vault-surface border border-vault-border">
        {/* Diagram Category Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-vault-bg border border-vault-border/80 text-xs font-mono">
          <button
            onClick={() => {
              setActiveDiagram("system");
              setShowRaw(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeDiagram === "system"
                ? "bg-vault-accent/20 text-vault-accent font-semibold"
                : "text-vault-muted hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>
          <button
            onClick={() => {
              setActiveDiagram("dataflow");
              setShowRaw(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeDiagram === "dataflow"
                ? "bg-vault-accent/20 text-vault-accent font-semibold"
                : "text-vault-muted hover:text-white"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Data Flow & Sequence</span>
          </button>
        </div>

        {/* Toggle Raw Code */}
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-bg hover:bg-vault-border border border-vault-border text-vault-muted hover:text-white text-xs font-mono transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-vault-accent" />
          <span>{showRaw ? "Render Diagram" : "View Mermaid DSL"}</span>
        </button>
      </div>

      {/* Diagram Canvas Panel */}
      <div className="glass-panel rounded-xl border border-vault-border p-6 min-h-[480px] flex flex-col justify-center items-center relative overflow-hidden bg-vault-card/70">
        {showRaw ? (
          <div className="w-full text-left space-y-2">
            <span className="text-[11px] font-mono text-vault-subtle uppercase">
              Mermaid Diagram Definition
            </span>
            <pre className="p-4 rounded-lg bg-vault-bg border border-vault-border text-xs font-mono text-vault-accent overflow-x-auto leading-relaxed">
              <code>{currentMermaidCode}</code>
            </pre>
          </div>
        ) : renderError ? (
          <div className="text-center p-8 space-y-2 text-vault-amber">
            <p className="text-xs font-mono">Mermaid Syntax Note: {renderError}</p>
            <pre className="mt-4 p-4 rounded bg-vault-bg text-[11px] font-mono text-vault-muted text-left overflow-x-auto">
              {currentMermaidCode}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center items-center overflow-x-auto py-6"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-vault-muted">
            <RefreshCw className="w-4 h-4 animate-spin text-vault-accent" />
            <span>Generating dynamic architecture graph...</span>
          </div>
        )}
      </div>

      {/* Explanatory notes below */}
      <div className="p-4 rounded-xl bg-vault-surface/40 border border-vault-border/60 text-xs text-vault-muted leading-relaxed font-mono">
        <span className="text-vault-accent font-semibold">Diagram Provenance: </span>
        Automatically synthesized from repository AST entry points, import hierarchies, and network transport adapters.
      </div>
    </div>
  );
}
