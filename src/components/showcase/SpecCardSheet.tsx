"use client";

import React, { useState } from "react";
import { ProjectDetail, SpecCardData } from "@/types";
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Server, 
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Share2
} from "lucide-react";

interface SpecCardProps {
  project: ProjectDetail;
}

export function SpecCardSheet({ project }: SpecCardProps) {
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const spec: SpecCardData | null = project.specCard;

  if (!spec) {
    return (
      <div className="p-12 text-center text-vault-muted text-xs font-mono glass-panel rounded-xl">
        No specification sheet generated for this project.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const md = `# SPECIFICATION CARD: ${spec.projectName}
**Version:** ${spec.version} | **Status:** ${spec.status} | **License:** ${spec.license}
**Last Verified:** ${spec.lastVerified}

## 1. Overview
- **Category:** ${spec.category}
- **Type:** ${spec.type}
- **Intended Use:** ${spec.intendedUse}
- **Target Users:** ${spec.targetUsers}

## 2. Architecture & Runtime
- **Summary:** ${spec.architectureSummary}
- **Languages:** ${spec.languages.join(", ")}
- **Frameworks:** ${spec.frameworks.join(", ")}
- **Key Dependencies:** ${spec.keyDependencies.join(", ")}
- **Runtime:** ${spec.requirements.runtime}
- **Hardware Notes:** ${spec.requirements.hardwareNotes}

## 3. Infrastructure & Hosting
- **Platform:** ${spec.hosting.platform}
- **Domain:** ${spec.hosting.domain}
- **Storage:** ${spec.hosting.storage}
- **Database:** ${spec.hosting.database}

## 4. Limitations & Known Issues
${spec.limitations.map((l) => `- ${l}`).join("\n")}

## Citation
\`\`\`
${spec.citation}
\`\`\`
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.slug}-spec-card.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(spec.citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-vault-surface border border-vault-border print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-vault-accent" />
          <span className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
            SYSTEM SPECIFICATION & MODEL CARD
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-vault-accent/15 text-vault-accent border border-vault-accent/30">
            NVIDIA FORMAT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-bg hover:bg-vault-border border border-vault-border text-white text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-vault-accent" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-bg hover:bg-vault-border border border-vault-border text-white text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-vault-violet" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Spec Sheet */}
      <div className="glass-panel rounded-2xl border border-vault-border p-8 bg-vault-card shadow-2xl space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Spec Header */}
        <div className="border-b border-vault-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-vault-accent uppercase">
              <span>VAULT SPECIFICATION CARD</span>
              <span>•</span>
              <span>{spec.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1 print:text-black">
              {spec.projectName}
            </h1>
            <p className="text-xs text-vault-muted mt-1 font-mono">
              Version: {spec.version} | License: {spec.license} | Verified: {new Date(spec.lastVerified).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-xs font-mono text-vault-subtle">
            <div>First Commit: {spec.dates.firstCommit ? new Date(spec.dates.firstCommit).toLocaleDateString() : "N/A"}</div>
            <div>Last Commit: {new Date(spec.dates.lastCommit).toLocaleDateString()}</div>
            <div className="text-vault-emerald">Last Deployed: {new Date(spec.dates.lastDeployed).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Overview & Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-vault-surface/60 border border-vault-border space-y-2 print:border-gray-200">
            <h4 className="text-xs font-mono uppercase text-vault-accent font-bold">Intended Use</h4>
            <p className="text-xs text-vault-text/90 leading-relaxed font-sans">{spec.intendedUse}</p>
          </div>
          <div className="p-4 rounded-xl bg-vault-surface/60 border border-vault-border space-y-2 print:border-gray-200">
            <h4 className="text-xs font-mono uppercase text-vault-violet font-bold">Target Users</h4>
            <p className="text-xs text-vault-text/90 leading-relaxed font-sans">{spec.targetUsers}</p>
          </div>
        </div>

        {/* Section 2: Architecture & Stacks */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase text-vault-subtle tracking-widest font-bold">
            02. ARCHITECTURE & DEPENDENCIES
          </h3>
          <div className="p-4 rounded-xl bg-vault-surface/60 border border-vault-border space-y-3 print:border-gray-200">
            <p className="text-xs text-vault-text/90 leading-relaxed font-sans">
              {spec.architectureSummary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-vault-border/50 text-xs font-mono">
              <div>
                <span className="text-vault-subtle block mb-1">Languages:</span>
                <div className="flex flex-wrap gap-1">
                  {spec.languages.map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded bg-vault-bg border border-vault-border text-white text-[11px]">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-vault-subtle block mb-1">Frameworks:</span>
                <div className="flex flex-wrap gap-1">
                  {spec.frameworks.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded bg-vault-bg border border-vault-border text-white text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-vault-subtle block mb-1">Key Libraries:</span>
                <div className="flex flex-wrap gap-1">
                  {spec.keyDependencies.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded bg-vault-bg border border-vault-border text-white text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Inputs, Outputs & Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-vault-surface/60 border border-vault-border space-y-3 print:border-gray-200">
            <h4 className="text-xs font-mono uppercase text-vault-emerald font-bold">Inputs & Outputs</h4>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-vault-subtle block">Accepted Inputs:</span>
                <ul className="list-disc list-inside text-vault-text mt-0.5">
                  {spec.inputsAndOutputs.inputs.map((inp, idx) => (
                    <li key={idx}>{inp}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2">
                <span className="text-vault-subtle block">Produced Outputs:</span>
                <ul className="list-disc list-inside text-vault-text mt-0.5">
                  {spec.inputsAndOutputs.outputs.map((out, idx) => (
                    <li key={idx}>{out}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface/60 border border-vault-border space-y-3 print:border-gray-200">
            <h4 className="text-xs font-mono uppercase text-vault-accent font-bold">Runtime & Hardware Constraints</h4>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-vault-subtle block">Target Runtime:</span>
                <span className="text-white">{spec.requirements.runtime}</span>
              </div>
              <div>
                <span className="text-vault-subtle block">Hardware Notes:</span>
                <span className="text-vault-muted leading-relaxed font-sans block">{spec.requirements.hardwareNotes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Hosting & Storage */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase text-vault-subtle tracking-widest font-bold">
            04. INFRASTRUCTURE & TOPOLOGY
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-vault-surface/60 border border-vault-border">
              <span className="text-vault-subtle block text-[10px]">HOSTING</span>
              <span className="text-white font-semibold mt-1 block truncate">{spec.hosting.platform}</span>
            </div>
            <div className="p-3 rounded-lg bg-vault-surface/60 border border-vault-border">
              <span className="text-vault-subtle block text-[10px]">STORAGE</span>
              <span className="text-white font-semibold mt-1 block truncate">{spec.hosting.storage}</span>
            </div>
            <div className="p-3 rounded-lg bg-vault-surface/60 border border-vault-border">
              <span className="text-vault-subtle block text-[10px]">DATABASE</span>
              <span className="text-white font-semibold mt-1 block truncate">{spec.hosting.database}</span>
            </div>
            <div className="p-3 rounded-lg bg-vault-surface/60 border border-vault-border">
              <span className="text-vault-subtle block text-[10px]">CDN / PROXY</span>
              <span className="text-white font-semibold mt-1 block truncate">{spec.hosting.cdn || "Global Anycast"}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Limitations & Ethical Notes */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase text-vault-subtle tracking-widest font-bold">
            05. KNOWN LIMITATIONS & ETHICAL NOTES
          </h3>
          <div className="p-4 rounded-xl bg-vault-amber/10 border border-vault-amber/30 space-y-2 text-xs font-mono text-vault-amber">
            <ul className="list-disc list-inside space-y-1">
              {spec.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
            {spec.ethicalNotes && (
              <p className="pt-2 border-t border-vault-amber/20 text-[11px] text-vault-muted font-sans">
                <span className="font-semibold text-white">Ethical & Safety Statement: </span>
                {spec.ethicalNotes}
              </p>
            )}
          </div>
        </div>

        {/* Section 6: Citation & Attribution */}
        <div className="pt-4 border-t border-vault-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase text-vault-subtle font-bold">Citation & Attribution</h4>
            <button
              onClick={handleCopyCitation}
              className="flex items-center gap-1 text-[11px] font-mono text-vault-accent hover:underline print:hidden"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3 h-3 text-vault-emerald" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 rounded-lg bg-vault-bg border border-vault-border text-xs font-mono text-vault-muted break-all">
            {spec.citation}
          </div>
        </div>
      </div>
    </div>
  );
}
