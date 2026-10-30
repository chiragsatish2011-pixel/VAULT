"use client";

import React, { useState, useMemo } from "react";
import { ProjectSummary } from "@/types";
import { OpenFileDetail } from "@/components/dossier/OpenFileDetail";
import { Grid, List, FolderGit2, ArrowUpRight } from "lucide-react";

interface ArchivalDossierProps {
  projects: ProjectSummary[];
  onOpenLiveSite: (project: ProjectSummary) => void;
}

interface DossierTab {
  id: string;
  label: string;
  repo: string;
  color: string;
  textColor: string;
  leftOffset: string;
  width: string;
  tabType: "left" | "center" | "right";
  fontFamily?: "serif" | "sans";
  branch: string;
  filesCount: number;
  note: string;
  slug: string;
}

interface DossierRow {
  rowId: string;
  tabs: DossierTab[];
  folderColor: string;
}

const REPO_DOSSIER_ROWS: DossierRow[] = [
  {
    rowId: "row-1",
    folderColor: "#7B1143", // Maroon / Plum
    tabs: [
      {
        id: "garts",
        label: "G-Arts Workspace",
        repo: "chiragsatish2011-pixel/G-Arts-Workspace",
        color: "#7B1143",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "25%",
        tabType: "left",
        fontFamily: "serif",
        branch: "main",
        filesCount: 50,
        note: "Official student photography gallery & infinite creative media engine curated for Swaminarayan Gurukul.",
        slug: "garts-workspace",
      },
      {
        id: "nomin-code",
        label: "Nomin Code",
        repo: "chiragsatish2011-pixel/Nomin",
        color: "#581C87", // Deep Purple
        textColor: "#FFFFFF",
        leftOffset: "32%",
        width: "24%",
        tabType: "center",
        fontFamily: "sans",
        branch: "main",
        filesCount: 101,
        note: "Advanced autonomous coding agent that plans, builds, tests, and verifies code with real evidence.",
        slug: "nomin-ai-nine",
      },
      {
        id: "portfolio",
        label: "Portfolio",
        repo: "chiragsatish2011-pixel/Portfolio",
        color: "#18181B", // Black obsidian
        textColor: "#FFFFFF",
        leftOffset: "62%",
        width: "24%",
        tabType: "right",
        fontFamily: "serif",
        branch: "main",
        filesCount: 50,
        note: "Personal developer portfolio and cinematic software engineering showcase.",
        slug: "chirag-sandy",
      },
    ],
  },
  {
    rowId: "row-2",
    folderColor: "#EA580C", // Saturated Orange
    tabs: [
      {
        id: "vaayu-ws",
        label: "Vaayu Workspace",
        repo: "chiragsatish2011-pixel/Vaayu-Workspace",
        color: "#EA580C",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "28%",
        tabType: "left",
        fontFamily: "sans",
        branch: "main",
        filesCount: 50,
        note: "Unified collaborative workspace engine integrating cloud files, real-time channels, and audio calls.",
        slug: "vaayu-workspace",
      },
    ],
  },
  {
    rowId: "row-3",
    folderColor: "#059669", // Emerald / Green
    tabs: [
      {
        id: "editorops",
        label: "EditorOps Alpha",
        repo: "chiragsatish2011-pixel/EditorOps",
        color: "#059669",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "28%",
        tabType: "left",
        fontFamily: "sans",
        branch: "main",
        filesCount: 42,
        note: "Automated video revision operating system & UPI billing portal for freelance video editors in India.",
        slug: "editor-ops-alpha",
      },
    ],
  },
  {
    rowId: "row-4",
    folderColor: "#DC2626", // Red / Crimson
    tabs: [
      {
        id: "ncstudio",
        label: "N-C Studio",
        repo: "chiragsatish2011-pixel/N-C-Studio",
        color: "#DC2626",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "24%",
        tabType: "left",
        fontFamily: "serif",
        branch: "main",
        filesCount: 40,
        note: "Digital studio portfolio showcasing bespoke high-converting brand experiences and apps.",
        slug: "nc-studio",
      },
      {
        id: "showbook",
        label: "Showbook",
        repo: "chiragsatish2011-pixel/Showbook",
        color: "#1D4ED8", // Blue
        textColor: "#FFFFFF",
        leftOffset: "30%",
        width: "26%",
        tabType: "center",
        fontFamily: "sans",
        branch: "main",
        filesCount: 35,
        note: "Curated 06 production demo website concepts for high-growth modern brands and studios.",
        slug: "showbook",
      },
    ],
  },
  {
    rowId: "row-5",
    folderColor: "#581C87", // Deep Violet / Indigo
    tabs: [
      {
        id: "nomin-ws",
        label: "Nomin Workspace",
        repo: "chiragsatish2011-pixel/Nomin-Workspace",
        color: "#581C87",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "24%",
        tabType: "left",
        fontFamily: "serif",
        branch: "main",
        filesCount: 50,
        note: "Collaborative multi-agent engineering suite for team project orchestration and agent telemetry.",
        slug: "nomin-spacelab",
      },
      {
        id: "html-work",
        label: "HTML Work",
        repo: "chiragsatish2011-pixel/HTML-work",
        color: "#E11D48", // Rose Red
        textColor: "#FFFFFF",
        leftOffset: "29%",
        width: "26%",
        tabType: "center",
        fontFamily: "sans",
        branch: "main",
        filesCount: 2,
        note: "Interactive web fundamentals and reactive stylesheet sandbox.",
        slug: "tag-along-html",
      },
      {
        id: "website1",
        label: "Website-1",
        repo: "chiragsatish2011-pixel/webiste1",
        color: "#FACC15", // Saturated Yellow
        textColor: "#000000",
        leftOffset: "58%",
        width: "26%",
        tabType: "right",
        fontFamily: "serif",
        branch: "main",
        filesCount: 26,
        note: "High-impact brand launch experience with responsive layouts and scroll animations.",
        slug: "website1-brand",
      },
    ],
  },
  {
    rowId: "row-6",
    folderColor: "#2563EB", // Cobalt Blue
    tabs: [
      {
        id: "n8n-setup",
        label: "n8n Local Setup",
        repo: "chiragsatish2011-pixel/n8n-local-setup",
        color: "#2563EB",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "28%",
        tabType: "left",
        fontFamily: "sans",
        branch: "main",
        filesCount: 6,
        note: "Step-by-step local workflow automation deployment and setup handbook.",
        slug: "n8n-local-setup",
      },
    ],
  },
  {
    rowId: "row-7",
    folderColor: "#BE185D", // Magenta / Pink
    tabs: [
      {
        id: "vastra",
        label: "vastraabharana",
        repo: "chiragsatish2011-pixel/vastraabharana",
        color: "#BE185D",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "26%",
        tabType: "left",
        fontFamily: "serif",
        branch: "main",
        filesCount: 858,
        note: "Luxury heritage apparel e-commerce platform and bespoke catalog engine.",
        slug: "vastraabharana",
      },
      {
        id: "trion",
        label: "Trion Assets",
        repo: "chiragsatish2011-pixel/Trion-Website-with-assets",
        color: "#FDE047", // Yellow
        textColor: "#000000",
        leftOffset: "30%",
        width: "28%",
        tabType: "center",
        fontFamily: "serif",
        branch: "main",
        filesCount: 15,
        note: "Browser-based coding workspace client assets and generative design tools.",
        slug: "nomin-code-trion",
      },
    ],
  },
  {
    rowId: "row-8",
    folderColor: "#1E40AF", // Royal Blue Base Folder
    tabs: [
      {
        id: "nomin-showcase",
        label: "Nomin Showcase",
        repo: "chiragsatish2011-pixel/Nomin-showcase",
        color: "#1E40AF",
        textColor: "#FFFFFF",
        leftOffset: "2%",
        width: "26%",
        tabType: "left",
        fontFamily: "serif",
        branch: "main",
        filesCount: 14,
        note: "Verified autonomous engineering showcase and interactive demo environment.",
        slug: "nomin-webshow",
      },
    ],
  },
];

export function ArchivalDossierView({ projects, onOpenLiveSite }: ArchivalDossierProps) {
  // Currently opened tab
  const [openedTab, setOpenedTab] = useState<DossierTab | null>(null);
  // Hovered row index (0 to 7). Null means idle (base folder shows default)
  const [hoveredRowIdx, setHoveredRowIdx] = useState<number | null>(null);
  const [hoveredTab, setHoveredTab] = useState<DossierTab | null>(null);
  // Pull-up envelope animation state
  const [animatingTab, setAnimatingTab] = useState<DossierTab | null>(null);

  // Target project for the opened tab
  const targetProject = useMemo(() => {
    if (!openedTab) return null;
    return (
      projects.find((p) => p.slug === openedTab.slug) ||
      projects.find((p) => p.title.toLowerCase().includes(openedTab.label.toLowerCase())) ||
      projects[0]
    );
  }, [openedTab, projects]);

  const handleOpenTab = (tab: DossierTab) => {
    // Physical envelope pull-up animation: folder pulls up out of the stack, becomes bigger in front
    setAnimatingTab(tab);
    setTimeout(() => {
      setOpenedTab(tab);
      setAnimatingTab(null);
    }, 240);
  };

  const handleClose = () => {
    setOpenedTab(null);
  };

  // Base folder tab (Row 8)
  const baseTab = REPO_DOSSIER_ROWS[7].tabs[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 select-none font-sans relative">
      {/* If opened, show the Physical Open Folder Detail View with Stacked Document Pages */}
      {openedTab && targetProject ? (
        <OpenFileDetail
          project={targetProject}
          repoName={openedTab.repo}
          tabLabel={openedTab.label}
          onClose={handleClose}
          onOpenLiveSite={onOpenLiveSite}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Heading Bar — Pure & Clean (No Small Static Text) */}
          <div className="flex items-center justify-between pb-5 border-b-2 border-neutral-900">
            <h2 className="font-editorial text-5xl sm:text-7xl text-white tracking-tighter font-black">
              Repository File Stack
            </h2>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded bg-neutral-900 text-white font-black cursor-pointer border border-neutral-700 shadow-md"
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenTab(REPO_DOSSIER_ROWS[2].tabs[0])}
                className="p-2 rounded hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800"
                title="Open EditorOps File"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE PHYSICAL DIE-CUT FOLDER STACK (VIDEO 1 EXACT REPLICA) */}
          {/* ======================================================== */}
          <div 
            onMouseLeave={() => {
              setHoveredRowIdx(null);
              setHoveredTab(null);
            }}
            className="relative w-full flex flex-col justify-start select-none pt-2"
          >
            {REPO_DOSSIER_ROWS.map((row, rowIdx) => {
              const isHovered = hoveredRowIdx === rowIdx;
              const isBaseFolder = rowIdx === 7; // Bottom Royal Blue Folder
              const isBeingPulled = animatingTab?.id === hoveredTab?.id && isHovered;

              // Expansion height:
              // When hovered, the hovered row expands to 140px.
              // When idle (no row hovered), the base folder (row 7) is expanded to 170px.
              // When another row is hovered, the base folder collapses to 20px.
              let folderBodyHeight = "12px";
              if (isHovered) {
                folderBodyHeight = "140px";
              } else if (isBaseFolder) {
                folderBodyHeight = hoveredRowIdx === null ? "170px" : "18px";
              }

              // Active tab data to show in this folder's revealed body
              const activeRowTab = (isHovered && hoveredTab && row.tabs.some(t => t.id === hoveredTab.id))
                ? hoveredTab
                : row.tabs[0];

              // Envelope pull-up transform
              let translateY = 0;
              let scale = 1;
              let zIndex = 10 + rowIdx;

              if (isBeingPulled) {
                translateY = -80;
                scale = 1.05;
                zIndex = 100;
              } else if (isHovered) {
                zIndex = 50;
              }

              return (
                <div
                  key={row.rowId}
                  style={{
                    zIndex: zIndex,
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), z-index 0ms",
                  }}
                  className="relative w-full -mt-0.5"
                >
                  {/* The Die-Cut Tabs Row */}
                  <div className="relative h-9 sm:h-10 w-full flex items-end">
                    {row.tabs.map((tab) => {
                      const isThisTabHovered = hoveredTab?.id === tab.id;

                      // Exact die-cut geometry per tab position
                      let clipPathStyle = "polygon(0 0, calc(100% - 22px) 0, 100% 100%, 0 100%)";
                      let borderRad = "10px 0 0 0";

                      if (tab.tabType === "center") {
                        clipPathStyle = "polygon(22px 0, calc(100% - 22px) 0, 100% 100%, 0 100%)";
                        borderRad = "6px 6px 0 0";
                      } else if (tab.tabType === "right") {
                        clipPathStyle = "polygon(22px 0, 100% 0, 100% 100%, 0 100%)";
                        borderRad = "0 10px 0 0";
                      }

                      return (
                        <div
                          key={tab.id}
                          onMouseEnter={() => {
                            setHoveredRowIdx(rowIdx);
                            setHoveredTab(tab);
                          }}
                          onClick={() => handleOpenTab(tab)}
                          className={`absolute bottom-0 h-9 sm:h-10 flex items-center px-4 sm:px-5 cursor-pointer shadow-md select-none transition-transform duration-150 ${
                            tab.fontFamily === "serif"
                              ? "font-editorial text-sm sm:text-base font-bold tracking-tight"
                              : "font-sans text-xs sm:text-sm font-black tracking-tight"
                          }`}
                          style={{
                            left: tab.leftOffset,
                            width: tab.width,
                            backgroundColor: tab.color,
                            color: tab.textColor,
                            borderRadius: borderRad,
                            clipPath: clipPathStyle,
                            boxShadow: "0 -4px 10px rgba(0,0,0,0.5)",
                            transform: isThisTabHovered ? "translateY(-4px)" : "translateY(0)",
                          }}
                        >
                          <span className="truncate">{tab.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* The Full-Width Horizontal Folder Bar & Revealed Body */}
                  <div
                    onMouseEnter={() => {
                      setHoveredRowIdx(rowIdx);
                      if (!row.tabs.some((t) => t.id === hoveredTab?.id)) {
                        setHoveredTab(row.tabs[0]);
                      }
                    }}
                    onClick={() => handleOpenTab(hoveredTab || row.tabs[0])}
                    className={`w-full cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      isBaseFolder ? "rounded-b-2xl" : ""
                    }`}
                    style={{
                      backgroundColor: row.folderColor,
                      height: folderBodyHeight,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                      transition: "height 280ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Revealed Body Content */}
                    {(isHovered || (isBaseFolder && hoveredRowIdx === null)) && (
                      <div className="h-full p-6 sm:p-8 flex items-center justify-between text-white select-none animate-fadeIn">
                        {/* Title & Note */}
                        <div className="space-y-2 max-w-2xl">
                          <div className="font-black text-white text-2xl sm:text-3xl font-editorial tracking-tight">
                            {(isHovered ? activeRowTab : baseTab).label}
                          </div>
                          <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-xl font-sans font-medium">
                            {(isHovered ? activeRowTab : baseTab).note}
                          </p>
                        </div>

                        {/* Direct Action Button */}
                        <div className="shrink-0 flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTab(isHovered ? activeRowTab : baseTab);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-black text-xs uppercase font-mono shadow-xl hover:bg-neutral-100 transition-all cursor-pointer hover:scale-105"
                          >
                            <span>Open Dossier</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}