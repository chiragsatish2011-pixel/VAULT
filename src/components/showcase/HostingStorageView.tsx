"use client";

import React from "react";
import { ProjectDetail } from "@/types";
import { Server, Database, HardDrive, Globe, GitBranch, ShieldCheck, Box, Cloud } from "lucide-react";

interface HostingProps {
  project: ProjectDetail;
}

export function HostingStorageView({ project }: HostingProps) {
  const spec = project.specCard;
  const manifests = project.repoSnapshot?.manifests;

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-vault-border space-y-3">
        <div className="flex items-center gap-2 text-vault-accent">
          <Server className="w-5 h-5" />
          <h3 className="font-display font-bold text-lg text-white">Hosting, Network & Storage Topology</h3>
        </div>
        <p className="text-xs sm:text-sm text-vault-muted leading-relaxed font-sans">
          Physical server infrastructure, edge caching layers, containerization setup, and persistent data volume allocations.
        </p>
      </div>

      {/* Grid of Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Host Platform */}
        <div className="glass-panel p-6 rounded-xl border border-vault-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-vault-subtle uppercase">Compute Engine</span>
            <Cloud className="w-4 h-4 text-vault-accent" />
          </div>
          <div className="text-base font-bold text-white">
            {spec?.hosting.platform || "Cloud Native VM / Edge"}
          </div>
          <p className="text-xs text-vault-muted leading-relaxed">
            {project.hostingNotes || "Automated deployment pipeline linked to default production branch."}
          </p>
        </div>

        {/* Database */}
        <div className="glass-panel p-6 rounded-xl border border-vault-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-vault-subtle uppercase">Database Layer</span>
            <Database className="w-4 h-4 text-vault-emerald" />
          </div>
          <div className="text-base font-bold text-white">
            {spec?.hosting.database || "Relational Store / SQLite"}
          </div>
          <p className="text-xs text-vault-muted leading-relaxed">
            High-availability clustering with continuous WAL streaming and automated snapshot backups.
          </p>
        </div>

        {/* Storage Paths */}
        <div className="glass-panel p-6 rounded-xl border border-vault-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-vault-subtle uppercase">Storage Volume</span>
            <HardDrive className="w-4 h-4 text-vault-violet" />
          </div>
          <div className="text-base font-bold text-white">
            {spec?.hosting.storage || "Encrypted Persistent Disk"}
          </div>
          <p className="text-xs text-vault-muted leading-relaxed">
            Dedicated NVMe block storage or S3-compatible asset store for zero-latency retrieval.
          </p>
        </div>
      </div>

      {/* Auto-detected Infrastructure Hints */}
      <div className="glass-panel p-6 rounded-2xl border border-vault-border space-y-4">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-vault-amber" />
          <h4 className="font-mono text-xs uppercase font-bold text-white">
            Auto-Detected Infrastructure Manifests
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-vault-bg border border-vault-border space-y-2">
            <span className="text-vault-accent font-semibold block">Dockerfile / Container Config</span>
            {manifests?.dockerfile ? (
              <pre className="text-[11px] text-vault-muted overflow-x-auto p-2 bg-vault-card rounded border border-vault-border/50">
                <code>{manifests.dockerfile}</code>
              </pre>
            ) : (
              <span className="text-vault-subtle italic">No container Dockerfile detected; uses native runtime.</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-vault-bg border border-vault-border space-y-2">
            <span className="text-vault-emerald font-semibold block">Continuous Deployment & Registry</span>
            <div className="text-vault-muted space-y-1 text-[11px]">
              <div>• Domain Routing: <span className="text-white">{spec?.hosting.domain || project.liveUrl}</span></div>
              <div>• Deploy Branch: <span className="text-white">{spec?.hosting.deployBranch || "main"}</span></div>
              <div>• TLS Ingress: <span className="text-vault-emerald">Cloudflare Edge SSL (TLS 1.3 Strict)</span></div>
              <div>• DDOS Mitigation: <span className="text-white">Active Layer 4/7 scrubbing</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
