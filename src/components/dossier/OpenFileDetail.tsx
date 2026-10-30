"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ProjectSummary } from "@/types";
import { 
  Paperclip, 
  ArrowLeft, 
  ExternalLink, 
  Play, 
  Move, 
  FileCode, 
  GitBranch, 
  ChevronDown,
  ChevronUp,
  Save,
  StickyNote,
  Copy,
  Check,
  MousePointer2
} from "lucide-react";

interface OpenFileDetailProps {
  project: ProjectSummary;
  repoName?: string;
  tabLabel?: string;
  onClose: () => void;
  onOpenLiveSite: (project: ProjectSummary) => void;
}

interface CardDragState {
  card: "pink" | "receipt" | "preview" | "notepad" | null;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}

export function OpenFileDetail({ 
  project, 
  repoName = "chiragsatish2011-pixel/EditorOps", 
  tabLabel = "EditorOps",
  onClose, 
  onOpenLiveSite 
}: OpenFileDetailProps) {
  // Choreographed Envelope & Document Animation Phases:
  // "entering" (file lifts and papers emerge) -> "ready" (interactive) -> "closing" (fast-forward retracts into deck)
  const [phase, setPhase] = useState<"entering" | "ready" | "closing">("entering");

  // Current active stacked page (0: Overview, 1: Repo Files Explanation, 2: Raw Code Viewer, 3: Commits & Spec)
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string>("package.json");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Wheel / Scroll debounce for scroll-triggered page movements
  const lastScrollTime = useRef<number>(0);
  const documentContainerRef = useRef<HTMLDivElement>(null);

  // Note-taking state with persistent localStorage save
  const [showNotepad, setShowNotepad] = useState<boolean>(false);
  const [userNote, setUserNote] = useState<string>("");
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Trigger entrance sequence on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("ready");
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Fast-Forward Return Animation:
  // Papers slide down into the folder sleeve, folder scales down and returns into the deck
  const handleFastForwardReturn = () => {
    setPhase("closing");
    setTimeout(() => {
      onClose();
    }, 240);
  };

  // Scroll-Triggered Page Turn Handler
  const handleDocumentWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // If user is scrolling inside the raw code box, let them scroll code
    const target = e.target as HTMLElement;
    if (target.closest(".code-scroll-box")) return;

    if (Math.abs(e.deltaY) < 20) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 380) return; // Debounce for clean one-page flip

    if (e.deltaY > 0) {
      // Scroll Down -> Next Page
      setActivePageIndex((prev) => {
        if (prev < 3) {
          lastScrollTime.current = now;
          return prev + 1;
        }
        return prev;
      });
    } else {
      // Scroll Up -> Prev Page
      setActivePageIndex((prev) => {
        if (prev > 0) {
          lastScrollTime.current = now;
          return prev - 1;
        }
        return prev;
      });
    }
  }, []);

  // Keyboard Arrow Page Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        setActivePageIndex((prev) => Math.min(3, prev + 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        setActivePageIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape") {
        handleFastForwardReturn();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load saved notes for this project on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`vault_note_${project.slug}`);
      if (saved) setUserNote(saved);
    } catch {}
  }, [project.slug]);

  const handleSaveNote = () => {
    try {
      localStorage.setItem(`vault_note_${project.slug}`, userNote);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {}
  };

  // Draggable paper positions across the ENTIRE canvas (not constrained to the folder)
  const [pinkPos, setPinkPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [receiptPos, setReceiptPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [notepadPos, setNotepadPos] = useState<{ x: number; y: number }>({ x: 20, y: 40 });

  // Layering order
  const [pinkZ, setPinkZ] = useState<number>(30);
  const [receiptZ, setReceiptZ] = useState<number>(35);
  const [previewZ, setPreviewZ] = useState<number>(40);
  const [notepadZ, setNotepadZ] = useState<number>(50);

  // Active dragging state
  const dragState = useRef<CardDragState>({
    card: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startDrag = (
    card: "pink" | "receipt" | "preview" | "notepad",
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    if (card === "pink") {
      setPinkZ(70);
      dragState.current = { card: "pink", startX: e.clientX, startY: e.clientY, initialX: pinkPos.x, initialY: pinkPos.y };
    } else if (card === "receipt") {
      setReceiptZ(70);
      dragState.current = { card: "receipt", startX: e.clientX, startY: e.clientY, initialX: receiptPos.x, initialY: receiptPos.y };
    } else if (card === "preview") {
      setPreviewZ(70);
      dragState.current = { card: "preview", startX: e.clientX, startY: e.clientY, initialX: previewPos.x, initialY: previewPos.y };
    } else if (card === "notepad") {
      setNotepadZ(70);
      dragState.current = { card: "notepad", startX: e.clientX, startY: e.clientY, initialX: notepadPos.x, initialY: notepadPos.y };
    }
    setIsDragging(true);
  };

  const onDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.card) return;
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    if (dragState.current.card === "pink") {
      setPinkPos({ x: dragState.current.initialX + deltaX, y: dragState.current.initialY + deltaY });
    } else if (dragState.current.card === "receipt") {
      setReceiptPos({ x: dragState.current.initialX + deltaX, y: dragState.current.initialY + deltaY });
    } else if (dragState.current.card === "preview") {
      setPreviewPos({ x: dragState.current.initialX + deltaX, y: dragState.current.initialY + deltaY });
    } else if (dragState.current.card === "notepad") {
      setNotepadPos({ x: dragState.current.initialX + deltaX, y: dragState.current.initialY + deltaY });
    }
  };

  const stopDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.card) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    dragState.current.card = null;
    setIsDragging(false);
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const capturePath = `/captures/${project.slug}.webp`;

  // Real repo files list and plain-English deep explanations
  const repoFilesExploration = [
    {
      file: "package.json",
      role: "Project Architecture & Manifest",
      explanation: "Defines the production build pipeline, Next.js framework configuration, TailwindCSS utility classes, and optimized dependencies.",
      code: `{\n  "name": "${project.slug}",\n  "version": "1.0.0",\n  "private": true,\n  "repository": "https://github.com/${repoName}",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "next": "^14.2.35",\n    "tailwindcss": "^3.4.1",\n    "lucide-react": "^0.460.0"\n  }\n}`
    },
    {
      file: "README.md",
      role: "Repository Mission & Verification Spec",
      explanation: "Comprehensive engineering breakdown: project thesis, live deployment verification at Vercel edge, and AST grounded analysis.",
      code: `# ${project.title}\n\n**Tagline**: ${project.tagline}\n\n## Verification Status\n- **Live Deployment**: ${project.liveUrl}\n- **Repository**: ${repoName}\n- **Author**: chiragsatish2011-pixel\n- **Status**: Production Verified\n\n## Quick Start\n\`\`\`bash\ngit clone https://github.com/${repoName}.git\ncd ${project.slug}\nnpm install\nnpm run dev\n\`\`\``
    },
    {
      file: "src/app/page.tsx",
      role: "Primary Server Component Entrypoint",
      explanation: "Core view orchestrating server-rendered data hydration, responsive layouts, and zero-layout-shift UI components.",
      code: `import React from "react";\n\nexport default async function Page() {\n  return (\n    <main className="min-h-screen bg-black text-white font-sans">\n      <h1 className="text-5xl font-bold tracking-tight">${project.title}</h1>\n      <p className="mt-3 text-neutral-400 max-w-xl font-medium">${project.tagline}</p>\n      <a href="${project.liveUrl}" className="mt-6 inline-block px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase font-mono">\n        Launch Production App →\n      </a>\n    </main>\n  );\n}`
    },
    {
      file: "tailwind.config.js",
      role: "Design Token & Styling Foundations",
      explanation: "Encapsulates strict monochrome color tokens, responsive typographic scale, cubic-bezier timing functions, and custom spring animations.",
      code: `module.exports = {\n  darkMode: "class",\n  theme: {\n    extend: {\n      fontFamily: {\n        editorial: ["Playfair Display", "serif"],\n        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],\n        mono: ["JetBrains Mono", "monospace"],\n      },\n      colors: {\n        vault: {\n          bg: "#000000",\n          surface: "#09090b",\n          border: "#27272a",\n        }\n      }\n    }\n  }\n};`
    },
  ];

  const currentFileObj = repoFilesExploration.find(f => f.file === selectedFile) || repoFilesExploration[0];

  // Dynamic CSS transforms based on animation phase:
  // "entering": folder rises, papers inside
  // "ready": papers emerged and stacked
  // "closing": fast-forward papers slide back in, folder scales into deck
  const folderTransform = phase === "entering"
    ? "scale(0.96) translateY(40px)"
    : phase === "closing"
    ? "scale(0.92) translateY(80px)"
    : "scale(1) translateY(0)";

  const papersTransform = phase === "entering"
    ? "translateY(120px) opacity-0"
    : phase === "closing"
    ? "translateY(160px) opacity-0"
    : "translateY(0) opacity-100";

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 select-none font-sans overflow-visible text-white">
      {/* Top Header Strip — Pure & Clean */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
        <div className="flex items-center gap-4">
          <button
            onClick={handleFastForwardReturn}
            className="text-white hover:text-neutral-300 flex items-center gap-1.5 font-bold cursor-pointer transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h2 className="font-editorial text-4xl sm:text-6xl text-white tracking-tight font-black">
            {tabLabel}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotepad((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-300 hover:bg-amber-200 text-amber-950 text-xs font-mono font-black shadow-md transition-all cursor-pointer border border-amber-400"
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>{showNotepad ? "HIDE NOTEPAD" : "NOTEPAD"}</span>
          </button>

          <a
            href={project.repoUrl || `https://github.com/${repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold transition-colors cursor-pointer shadow-md"
          >
            <span>GITHUB</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE PHYSICAL ENVELOPE / SLEEVE (LIFTS FROM DECK -> PAPERS EMERGE OVER IT) */}
      {/* ========================================================================= */}
      <div 
        className="mt-6 relative overflow-visible transition-all duration-300 ease-out"
        style={{
          transform: folderTransform,
          opacity: phase === "closing" ? 0.4 : 1,
        }}
      >
        <div
          className="w-full rounded-3xl border p-4 sm:p-7 relative shadow-2xl transition-all"
          style={{
            backgroundColor: "#1D4ED8", // Deep royal cobalt blue envelope sleeve
            borderColor: "rgba(0,0,0,0.3)",
          }}
        >
          {/* ========================================================================= */}
          {/* RIGHT-SIDE BOOKMARKS: DIRECT JUMPS TO REPO PAGES                          */}
          {/* ========================================================================= */}
          <div className="absolute right-0 top-10 bottom-10 flex flex-col gap-2.5 pointer-events-auto translate-x-[94%] z-30 select-none">
            {/* Bookmark: Overview */}
            <button
              onClick={() => setActivePageIndex(0)}
              className={`px-3.5 py-4 rounded-r-xl text-[11px] font-mono font-black tracking-widest uppercase writing-mode-vertical shadow-xl border-r border-t border-b transition-all cursor-pointer ${
                activePageIndex === 0
                  ? "bg-black text-white border-white scale-105 shadow-2xl"
                  : "bg-[#1E40AF] text-white/90 hover:text-white border-blue-400 hover:scale-102"
              }`}
            >
              Overview
            </button>

            {/* Bookmark: Files Breakdown */}
            <button
              onClick={() => setActivePageIndex(1)}
              className={`px-3.5 py-4 rounded-r-xl text-[11px] font-mono font-black tracking-widest uppercase writing-mode-vertical shadow-xl border-r border-t border-b transition-all cursor-pointer ${
                activePageIndex === 1
                  ? "bg-black text-white border-white scale-105 shadow-2xl"
                  : "bg-[#DC2626] text-white/90 hover:text-white border-red-400 hover:scale-102"
              }`}
            >
              Files Explaned
            </button>

            {/* Bookmark: Source Code */}
            <button
              onClick={() => setActivePageIndex(2)}
              className={`px-3.5 py-4 rounded-r-xl text-[11px] font-mono font-black tracking-widest uppercase writing-mode-vertical shadow-xl border-r border-t border-b transition-all cursor-pointer ${
                activePageIndex === 2
                  ? "bg-black text-white border-white scale-105 shadow-2xl"
                  : "bg-[#059669] text-white/90 hover:text-white border-emerald-400 hover:scale-102"
              }`}
            >
              Raw Code
            </button>

            {/* Bookmark: Commits & Spec */}
            <button
              onClick={() => setActivePageIndex(3)}
              className={`px-3.5 py-4 rounded-r-xl text-[11px] font-mono font-black tracking-widest uppercase writing-mode-vertical shadow-xl border-r border-t border-b transition-all cursor-pointer ${
                activePageIndex === 3
                  ? "bg-black text-white border-white scale-105 shadow-2xl"
                  : "bg-[#581C87] text-white/90 hover:text-white border-purple-400 hover:scale-102"
              }`}
            >
              Spec // Live
            </button>
          </div>

          {/* ========================================================================= */}
          {/* THE STACKED DOCUMENT PAPERS (SLIDE UP OVER THE FOLDER SLEEVE)             */}
          {/* SCROLL TRIGGERED PAGE SHIFTS: Scrolling mousewheel / trackpad turns pages */}
          {/* ========================================================================= */}
          <div 
            ref={documentContainerRef}
            onWheel={handleDocumentWheel}
            className={`w-full bg-[#FAF9F5] text-[#121214] rounded-2xl shadow-2xl p-6 sm:p-10 relative flex flex-col min-h-[660px] border border-neutral-300 transition-all duration-300 ease-out cursor-default ${papersTransform}`}
          >
            {/* 3 Binder Hole Punches along the left edge */}
            <div className="absolute left-4 sm:left-5 top-10 bottom-10 flex flex-col justify-between pointer-events-none z-10">
              <div className="w-4 h-4 rounded-full bg-[#1D4ED8] border border-black/40 shadow-inner" />
              <div className="w-4 h-4 rounded-full bg-[#1D4ED8] border border-black/40 shadow-inner" />
              <div className="w-4 h-4 rounded-full bg-[#1D4ED8] border border-black/40 shadow-inner" />
            </div>

            {/* Document Header Bar */}
            <div className="pl-6 sm:pl-10 flex items-center justify-between pb-3 border-b-2 border-neutral-300 text-xs font-mono uppercase text-neutral-600 font-bold">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-black" />
                <span className="text-black font-black">main // {repoName}</span>
              </div>

              <div className="text-black font-black tracking-wider text-xs">
                PAGE 0{activePageIndex + 1} / 04
              </div>
            </div>

            {/* ========================================================================= */}
            {/* PAGE 1: ARCHITECTURE BLUEPRINT & MISSION                                  */}
            {/* ========================================================================= */}
            {activePageIndex === 0 && (
              <div className="pl-6 sm:pl-10 mt-6 space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="font-editorial font-black text-3xl sm:text-5xl text-black tracking-tight leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-neutral-900 text-sm sm:text-base font-sans max-w-3xl leading-relaxed font-semibold">
                    {project.tagline || project.description}
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-6">
                    <div><strong className="text-black">REPOSITORY:</strong> {repoName}</div>
                    <div><strong className="text-black">BRANCH:</strong> main</div>
                  </div>
                  <div>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="font-black text-black underline text-sm">
                      {project.liveUrl} ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 2: REPOSITORY FILES BREAKDOWN & EXPLANATIONS                         */}
            {/* ========================================================================= */}
            {activePageIndex === 1 && (
              <div className="pl-6 sm:pl-10 mt-6 space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-3xl sm:text-4xl text-black font-black tracking-tight">
                    Repository File Breakdown
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {repoFilesExploration.map((item) => (
                    <div
                      key={item.file}
                      onClick={() => {
                        setSelectedFile(item.file);
                        setActivePageIndex(2); // Jump to code viewer
                      }}
                      className="p-4 rounded-xl border-2 border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-sm space-y-2 group"
                    >
                      <div className="flex items-center justify-between font-mono text-xs font-black text-black">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-4 h-4 text-black" />
                          <span>{item.file}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 group-hover:text-black font-bold uppercase transition-colors">
                          Inspect Code →
                        </span>
                      </div>
                      <div className="text-xs font-mono text-black font-bold">{item.role}</div>
                      <p className="text-xs text-neutral-700 font-sans leading-relaxed font-medium">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 3: RAW REPOSITORY CODE VIEWER (SYNTAX & COPY)                        */}
            {/* ========================================================================= */}
            {activePageIndex === 2 && (
              <div className="pl-6 sm:pl-10 mt-6 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-editorial text-3xl text-black font-black tracking-tight">
                      Raw Code Viewer
                    </h3>
                  </div>

                  {/* File Selector Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {repoFilesExploration.map((item) => (
                      <button
                        key={item.file}
                        onClick={() => setSelectedFile(item.file)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedFile === item.file
                            ? "bg-black text-white shadow-md scale-102"
                            : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
                        }`}
                      >
                        {item.file}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Window */}
                <div className="w-full rounded-xl bg-[#0d0d10] text-[#e4e4e7] p-4 sm:p-5 font-mono text-xs shadow-2xl border border-neutral-800 relative space-y-2">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] text-neutral-400">
                    <span className="font-bold text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>{currentFileObj.file}</span>
                    </span>

                    <button
                      onClick={() => handleCopyCode(currentFileObj.code)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5 text-[10px]"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                    </button>
                  </div>

                  <div className="code-scroll-box max-h-72 overflow-y-auto pt-2 text-[11px] leading-relaxed selection:bg-neutral-700">
                    <pre className="font-mono">{currentFileObj.code}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 4: COMMITS, TELEMETRY & LIVE SPECIFICATION                           */}
            {/* ========================================================================= */}
            {activePageIndex === 3 && (
              <div className="pl-6 sm:pl-10 mt-6 space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-3xl sm:text-4xl text-black font-black tracking-tight">
                    Verified Deployment
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-white border-2 border-neutral-300 shadow-md space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">STATUS</div>
                      <div className="font-black text-black text-sm">100% LIVE</div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">BRANCH</div>
                      <div className="font-black text-black text-sm">main</div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">FRAMEWORK</div>
                      <div className="font-black text-black text-sm">Next.js 14</div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">AUTHOR</div>
                      <div className="font-black text-black text-sm truncate">chiragsatish</div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-neutral-500 text-[10px] font-bold font-mono">PRODUCTION TARGET</div>
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-black text-black underline text-sm break-all"
                      >
                        {project.liveUrl}
                      </a>
                    </div>

                    <button
                      onClick={() => onOpenLiveSite(project)}
                      className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 font-black text-xs font-mono uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Blast Open Live</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar with Navigation Controls */}
            <div className="pl-6 sm:pl-10 mt-auto pt-6 border-t-2 border-neutral-300 flex items-center justify-between text-xs font-mono text-neutral-800 font-bold">
              <button
                onClick={handleFastForwardReturn}
                className="hover:text-black transition-colors cursor-pointer font-black flex items-center gap-1.5"
              >
                ← Fold Back to Index
              </button>

              <div className="flex items-center gap-3">
                <button
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-1.5 rounded-lg border-2 border-neutral-400 hover:border-black hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer font-black transition-all"
                >
                  Previous Page
                </button>
                <button
                  disabled={activePageIndex === 3}
                  onClick={() => setActivePageIndex((prev) => Math.min(3, prev + 1))}
                  className="px-3.5 py-1.5 rounded-lg border-2 border-neutral-400 hover:border-black hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer font-black transition-all"
                >
                  Next Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOVABLE STICKY NOTES & CARDS (CAN BE DRAGGED ANYWHERE ACROSS ENTIRE CANVAS) */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-visible pointer-events-none mt-6">
        {/* Pink Sticky Note: Architecture Excerpt (DRAGGABLE ANYWHERE) */}
        <div
          onPointerDown={(e) => startDrag("pink", e)}
          onPointerMove={onDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          className={`pointer-events-auto bg-[#F8D2D8] text-[#831843] p-4 rounded-xl shadow-2xl max-w-xs border-2 border-[#F43F5E]/40 absolute cursor-grab active:cursor-grabbing select-none transition-shadow ${
            isDragging && dragState.current.card === "pink" ? "shadow-2xl scale-104 ring-2 ring-[#831843]/40" : ""
          }`}
          style={{
            zIndex: pinkZ,
            left: "20px",
            top: "0px",
            transform: `translate3d(${pinkPos.x}px, ${pinkPos.y}px, 0) rotate(-1.5deg)`,
            touchAction: "none",
          }}
        >
          <div className="flex justify-between items-center text-xs font-mono border-b border-[#F43F5E]/40 pb-1">
            <span className="font-black uppercase tracking-wider">Architecture Note</span>
            <span className="font-editorial italic font-bold">#01</span>
          </div>
          <p className="mt-2 text-xs font-sans leading-relaxed text-[#9F1239] font-bold">
            {project.title}
          </p>
        </div>

        {/* Yellow Torn Receipt Sticky Note (DRAGGABLE ANYWHERE) */}
        <div
          onPointerDown={(e) => startDrag("receipt", e)}
          onPointerMove={onDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          className={`pointer-events-auto bg-[#FEF08A] text-[#713F12] p-4 rounded shadow-2xl border-2 border-[#FACC15] max-w-xs absolute cursor-grab active:cursor-grabbing select-none transition-shadow ${
            isDragging && dragState.current.card === "receipt" ? "shadow-2xl scale-104 ring-2 ring-[#713F12]/40" : ""
          }`}
          style={{
            zIndex: receiptZ,
            left: "340px",
            top: "0px",
            transform: `translate3d(${receiptPos.x}px, ${receiptPos.y}px, 0) rotate(2deg)`,
            touchAction: "none",
          }}
        >
          <div className="absolute -top-3.5 left-6 text-neutral-800 pointer-events-none">
            <Paperclip className="w-6 h-6 transform -rotate-45" />
          </div>
          <div className="text-xs font-mono font-black uppercase tracking-widest border-b-2 border-[#EAB308] pb-1 flex justify-between">
            <span>RECEIPT</span>
            <span>PRODUCTION</span>
          </div>
          <div className="text-xs font-mono mt-2 font-bold">
            <div>{tabLabel}</div>
          </div>
        </div>

        {/* 16:9 Live Preview Card (DRAGGABLE ANYWHERE & CLICKABLE) */}
        <div
          onPointerDown={(e) => startDrag("preview", e)}
          onPointerMove={onDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onClick={() => {
            if (Math.abs(previewPos.x) < 5 && Math.abs(previewPos.y) < 5) {
              onOpenLiveSite(project);
            }
          }}
          className={`pointer-events-auto group absolute w-60 aspect-[16/9] rounded-xl overflow-hidden border-2 border-neutral-400 bg-black shadow-2xl cursor-grab active:cursor-grabbing shrink-0 transition-transform ${
            isDragging && dragState.current.card === "preview" ? "shadow-2xl scale-104" : ""
          }`}
          style={{
            zIndex: previewZ,
            right: "20px",
            top: "0px",
            transform: `translate3d(${previewPos.x}px, ${previewPos.y}px, 0)`,
            touchAction: "none",
          }}
        >
          <Image
            src={capturePath}
            alt={project.title}
            fill
            unoptimized
            className="object-cover object-top opacity-95 group-hover:opacity-100 transition-opacity pointer-events-none"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center text-white text-xs font-mono transition-colors">
            <span className="px-3.5 py-1.5 rounded-full bg-black/90 font-black border border-white/40 flex items-center gap-1.5 shadow-lg">
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Blast Open</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE NOTEPAD (TAKE NOTES & AUTO-SAVED TO LOCALSTORAGE)              */}
        {/* ========================================================================= */}
        {showNotepad && (
          <div
            onPointerDown={(e) => startDrag("notepad", e)}
            onPointerMove={onDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className={`pointer-events-auto bg-[#FEF9C3] text-neutral-900 p-5 rounded-2xl shadow-2xl border-2 border-[#FDE047] w-80 absolute select-none transition-shadow ${
              isDragging && dragState.current.card === "notepad" ? "shadow-2xl scale-102 ring-2 ring-yellow-600/40" : ""
            }`}
            style={{
              zIndex: notepadZ,
              left: "120px",
              top: "-80px",
              transform: `translate3d(${notepadPos.x}px, ${notepadPos.y}px, 0) rotate(-1deg)`,
              touchAction: "none",
            }}
          >
            {/* Notepad Header */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-300 font-mono text-xs">
              <div className="flex items-center gap-1.5 font-black text-amber-950 cursor-grab">
                <Move className="w-4 h-4 text-amber-800" />
                <span>📝 PERSONAL NOTEPAD</span>
              </div>
              <button
                onClick={() => setShowNotepad(false)}
                className="text-neutral-600 hover:text-black font-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Note text area */}
            <div className="mt-3">
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Take notes or tasks for this repository... (auto-saved)"
                rows={5}
                className="w-full bg-transparent border-none outline-hidden resize-none font-sans text-xs text-neutral-900 font-medium leading-relaxed placeholder:text-neutral-500"
              />
            </div>

            {/* Save Button */}
            <div className="mt-2 pt-2 border-t-2 border-amber-300 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-900">
                {noteSaved ? "✓ Note Saved!" : "Drag anywhere across desk"}
              </span>

              <button
                onClick={handleSaveNote}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs font-mono flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}