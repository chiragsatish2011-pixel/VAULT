"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProjectDetail } from "@/types";
import { OverviewSection } from "@/components/showcase/OverviewSection";
import { LivePreviewFrame } from "@/components/showcase/LivePreviewFrame";
import { CodeBrowser } from "@/components/showcase/CodeBrowser";
import { FolderDossierBrowser } from "@/components/showcase/FolderDossierBrowser";
import { ArchitectureView } from "@/components/showcase/ArchitectureView";
import { ReverseDocsView } from "@/components/showcase/ReverseDocsView";
import { SpecCardSheet } from "@/components/showcase/SpecCardSheet";
import { HostingStorageView } from "@/components/showcase/HostingStorageView";
import { TimelineView } from "@/components/showcase/TimelineView";
import { 
  ArrowLeft, 
  Layers, 
  MonitorPlay, 
  Code2, 
  Cpu, 
  BookOpen, 
  FileText, 
  Server, 
  Clock, 
  ExternalLink,
  Github
} from "lucide-react";

interface ShowcaseClientProps {
  project: ProjectDetail;
  initialTab?: string;
}

export function ProjectShowcaseClient({ project, initialTab = "overview" }: ShowcaseClientProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" /> },
    { id: "preview", label: "Live Preview", icon: <MonitorPlay className="w-4 h-4" /> },
    { id: "code", label: "Code", icon: <Code2 className="w-4 h-4" /> },
    { id: "architecture", label: "Architecture", icon: <Cpu className="w-4 h-4" /> },
    { id: "docs", label: "Reverse Docs", icon: <BookOpen className="w-4 h-4" /> },
    { id: "spec", label: "Spec Card", icon: <FileText className="w-4 h-4" /> },
    { id: "hosting", label: "Hosting", icon: <Server className="w-4 h-4" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen relative pb-24">
      {/* Dynamic Project Ambient Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] blur-[150px] pointer-events-none -z-10 opacity-20"
        style={{ backgroundColor: project.accentColor }}
      />

      {/* Top Breadcrumb & Project Header */}
      <div className="border-b border-[#E5E4DE] bg-[#F9F8F6]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5D4CD] text-xs font-mono text-neutral-700 hover:text-black transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Index</span>
            </Link>

            <span className="text-neutral-400">/</span>
            <span className="text-xs font-mono text-neutral-900 font-bold">{project.title}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-black font-semibold hover:underline"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-neutral-300">•</span>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-600 hover:text-black"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Repository</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Cinematic Sub-Navigation Bar */}
      <div className="sticky top-[69px] z-40 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#E5E4DE] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#111113] text-white font-bold shadow-xs"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-200/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Viewport wrapped in Archival Folder Frame (Video 1 Detail) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Physical Archival Folder Container */}
        <div
          className="rounded-2xl border p-4 sm:p-8 relative shadow-2xl transition-all"
          style={{
            backgroundColor: project.accentColor === "#00F0FF" ? "#1D4ED8" : project.accentColor === "#9D4EDD" ? "#581C87" : "#065F46",
            borderColor: "rgba(255,255,255,0.25)",
          }}
        >
          {/* Vertical Bookmark Tabs on Right Edge (Video 1) */}
          <div className="absolute right-0 top-12 bottom-12 flex flex-col gap-2 pointer-events-none translate-x-[90%] z-20 hidden lg:flex">
            <div className="px-3 py-6 rounded-r-lg bg-[#DC2626] text-white text-[10px] font-mono tracking-widest uppercase writing-mode-vertical shadow-md border-r border-t border-b border-red-400">
              Varnell Collection
            </div>
            <div className="px-3 py-6 rounded-r-lg bg-[#1D4ED8] text-white text-[10px] font-mono tracking-widest uppercase writing-mode-vertical shadow-md border-r border-t border-b border-blue-400">
              Peripheral Entry
            </div>
          </div>

          {/* White Paper Sheet Inside with Binder Holes */}
          <div className="w-full bg-[#FAF9F5] text-[#121214] rounded-xl shadow-2xl p-6 sm:p-10 relative flex flex-col font-mono min-h-[600px] overflow-hidden">
            {/* 3 Binder Hole Punches on left edge */}
            <div className="absolute left-4 top-10 bottom-10 flex flex-col justify-between pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-[#0c0c0e] border border-black/30 shadow-inner" />
              <div className="w-4 h-4 rounded-full bg-[#0c0c0e] border border-black/30 shadow-inner" />
              <div className="w-4 h-4 rounded-full bg-[#0c0c0e] border border-black/30 shadow-inner" />
            </div>

            {/* Inner Content Area */}
            <div className="pl-6 sm:pl-10">
              {activeTab === "overview" && (
                <OverviewSection project={project} onSelectTab={handleTabChange} />
              )}
              {activeTab === "preview" && <LivePreviewFrame project={project} />}
              {activeTab === "code" && <FolderDossierBrowser project={project} />}
              {activeTab === "architecture" && <ArchitectureView project={project} />}
              {activeTab === "docs" && <ReverseDocsView project={project} />}
              {activeTab === "spec" && <SpecCardSheet project={project} />}
              {activeTab === "hosting" && <HostingStorageView project={project} />}
              {activeTab === "timeline" && <TimelineView project={project} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
