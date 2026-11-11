"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  LogOut,
  ChevronUp,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  Edit2,
  Camera,
  Sparkles,
  Layers,
  Copy,
  Download,
  Upload,
  Search,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ImagePlus,
  X,
} from "lucide-react";
import type { SiteItem } from "@/lib/sites-store";
import { INITIAL_VAULT_SITES } from "@/lib/initial-sites";
import { normalizeUrl } from "@/lib/url-utils";

export function AdminDashboard() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New site capture state & Settle Wait Timer
  const [inputUrl, setInputUrl] = useState("");
  const [settleDelay, setSettleDelay] = useState<number>(5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<{
    url: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    thumbnail800?: string;
    thumbnail400?: string;
    blurDataURL: string;
  } | null>(null);
  const [previewImgError, setPreviewImgError] = useState(false);

  // Custom thumbnail upload states (before and after push)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [targetSiteForUpload, setTargetSiteForUpload] = useState<SiteItem | null>(null);
  const customImageInputRef = useRef<HTMLInputElement>(null);
  const siteImageInputRef = useRef<HTMLInputElement>(null);
  const standaloneUploadRef = useRef<HTMLInputElement>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Full site editing modal state
  const [editingSite, setEditingSite] = useState<SiteItem | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    thumbnail800?: string;
    thumbnail400?: string;
    blurDataURL?: string;
    hidden: boolean;
    order: number;
  }>({
    name: "",
    description: "",
    url: "",
    thumbnailUrl: "",
    hidden: false,
    order: 0,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isModalCapturing, setIsModalCapturing] = useState(false);
  const editModalImageInputRef = useRef<HTMLInputElement>(null);

  // Action status notification & copy feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/admin/sites");
      if (!res.ok) throw new Error("Failed to load sites.");
      const data = await res.json();
      const serverSites: SiteItem[] = data.sites || [];

      // Check localStorage for offline / multi-container resilience
      let localSaved: SiteItem[] = [];
      try {
        const raw = localStorage.getItem("vault_curated_sites");
        if (raw) localSaved = JSON.parse(raw);
      } catch {}

      // Smart Reconciliation: merge server sites and local client edits without data loss
      let finalSites = serverSites;
      if (localSaved.length > 0 && serverSites.length > 0) {
        const serverMap = new Map(serverSites.map((s) => [s.id, s]));
        const serverUrlMap = new Map(serverSites.map((s) => [normalizeUrl(s.url), s]));

        let hasNewerLocalEdits = false;
        const merged = localSaved.map((localItem) => {
          const matchingServer = serverMap.get(localItem.id) || serverUrlMap.get(normalizeUrl(localItem.url));
          if (!matchingServer) {
            hasNewerLocalEdits = true;
            return localItem;
          }
          const localTime = new Date(localItem.updatedAt || 0).getTime();
          const serverTime = new Date(matchingServer.updatedAt || 0).getTime();
          if (localTime > serverTime) {
            hasNewerLocalEdits = true;
            return { ...matchingServer, ...localItem };
          }
          return matchingServer;
        });

        // Include any new server sites
        const localIdSet = new Set(localSaved.map((s) => s.id));
        const localUrlSet = new Set(localSaved.map((s) => normalizeUrl(s.url)));
        serverSites.forEach((s) => {
          if (!localIdSet.has(s.id) && !localUrlSet.has(normalizeUrl(s.url))) {
            merged.push(s);
          }
        });

        if (hasNewerLocalEdits) {
          finalSites = merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          fetch("/api/admin/sites/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sites: finalSites }),
          }).catch(() => {});
        } else {
          finalSites = serverSites;
        }
      } else if (serverSites.length > 0) {
        finalSites = serverSites;
      } else if (localSaved.length > 0) {
        finalSites = localSaved;
        fetch("/api/admin/sites/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sites: localSaved }),
        }).catch(() => {});
      } else {
        finalSites = INITIAL_VAULT_SITES;
        fetch("/api/admin/sites/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sites: INITIAL_VAULT_SITES }),
        }).catch(() => {});
      }

      setSites(finalSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(finalSites));
      } catch {}
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  // 1. Capture site by URL (with configurable settle timer)
  const handleStartCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isCapturing) return;

    setIsCapturing(true);
    setPreviewImgError(false);
    setCaptureStatus(`Analyzing site & waiting ${settleDelay}s for shaders, fonts & animations to settle...`);
    setError(null);

    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputUrl.trim(),
          settleSeconds: settleDelay,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Capture failed. Check URL accessibility or retry.");
      }

      const cap = data.capture;
      setCapturedPreview({
        url: inputUrl.trim(),
        name: cap.title || "Untitled Project",
        description: cap.description || "",
        thumbnailUrl: cap.thumbnailUrl,
        thumbnail800: cap.thumbnail800,
        thumbnail400: cap.thumbnail400,
        blurDataURL: cap.blurDataURL,
      });
      setCaptureStatus(null);
    } catch (err: any) {
      setError(err.message);
      setCaptureStatus(null);
    } finally {
      setIsCapturing(false);
    }
  };

  // Upload custom thumbnail BEFORE push (in Review Snapshot card)
  const handlePreviewCustomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setActionNotice("Optimizing custom thumbnail with Sharp...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", capturedPreview?.name || "custom-preview");

      const res = await fetch("/api/admin/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process custom image.");
      }

      const cap = data.capture;
      if (capturedPreview) {
        setCapturedPreview({
          ...capturedPreview,
          thumbnailUrl: cap.thumbnailUrl,
          thumbnail800: cap.thumbnail800,
          thumbnail400: cap.thumbnail400,
          blurDataURL: cap.blurDataURL,
        });
      } else {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setCapturedPreview({
          url: inputUrl.trim() || "https://",
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          description: "Custom project thumbnail",
          thumbnailUrl: cap.thumbnailUrl,
          thumbnail800: cap.thumbnail800,
          thumbnail400: cap.thumbnail400,
          blurDataURL: cap.blurDataURL,
        });
      }

      setPreviewImgError(false);
      setActionNotice("✓ Custom thumbnail applied! Ready to publish.");
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploadingImage(false);
      if (customImageInputRef.current) customImageInputRef.current.value = "";
      if (standaloneUploadRef.current) standaloneUploadRef.current.value = "";
    }
  };

  // Upload custom thumbnail AFTER push (on any site in archive)
  const handleSiteCustomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSiteForUpload) return;

    const siteId = targetSiteForUpload.id;
    const siteName = targetSiteForUpload.name;
    setIsUploadingImage(true);
    setActionNotice(`Uploading & applying custom thumbnail to "${siteName}"...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);
      formData.append("slug", siteName);

      const res = await fetch("/api/admin/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update site thumbnail.");
      }

      const updatedSite = data.site || {
        ...targetSiteForUpload,
        thumbnailUrl: data.capture.thumbnailUrl,
        thumbnail800: data.capture.thumbnail800,
        thumbnail400: data.capture.thumbnail400,
        blurDataURL: data.capture.blurDataURL,
      };

      const nextSites = sites.map((s) => (s.id === siteId ? updatedSite : s));
      setSites(nextSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(nextSites));
      } catch {}

      setActionNotice(`✓ Custom thumbnail applied to "${siteName}" in VAULT.`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploadingImage(false);
      setTargetSiteForUpload(null);
      if (siteImageInputRef.current) siteImageInputRef.current.value = "";
    }
  };

  // Check if typed inputUrl already exists in archive
  const inputUrlMatch = useMemo(() => {
    if (!inputUrl || inputUrl.trim().length < 5) return null;
    try {
      const incomingNorm = normalizeUrl(inputUrl.trim());
      return sites.find((s) => normalizeUrl(s.url) === incomingNorm) || null;
    } catch {
      return null;
    }
  }, [inputUrl, sites]);

  // Check if current capturedPreview already exists in archive
  const existingSiteMatch = useMemo(() => {
    if (!capturedPreview) return null;
    const incomingNorm = normalizeUrl(capturedPreview.url);
    return sites.find((s) => normalizeUrl(s.url) === incomingNorm) || null;
  }, [capturedPreview, sites]);

  // 2. Save / Publish captured site to store
  const handleConfirmAddSite = async () => {
    if (!capturedPreview) return;

    try {
      const res = await fetch("/api/admin/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capturedPreview),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save site.");

      const isUpdate = Boolean(existingSiteMatch);
      const savedSite = data.site;

      setCapturedPreview(null);
      setInputUrl("");
      setActionNotice(
        isUpdate
          ? `Updated "${savedSite.name}" in VAULT and refreshed search index.`
          : `Published "${savedSite.name}" to VAULT.`
      );
      setTimeout(() => setActionNotice(null), 3500);

      // Immediately persist to local state & localStorage, replacing matched site by id or url
      const existsIndex = sites.findIndex(
        (s) => s.id === savedSite.id || normalizeUrl(s.url) === normalizeUrl(savedSite.url)
      );
      let newSites: SiteItem[];
      if (existsIndex >= 0) {
        newSites = [...sites];
        newSites[existsIndex] = savedSite;
      } else {
        newSites = [savedSite, ...sites];
      }
      setSites(newSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(newSites));
      } catch {}
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 3. Re-capture single existing site (with configurable settle timer)
  const handleRecapture = async (site: SiteItem) => {
    setActionNotice(`Re-capturing "${site.name}" (waiting ${settleDelay}s for settle)...`);
    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: site.url,
          settleSeconds: settleDelay,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recapture failed.");

      const cap = data.capture;
      const updatedRes = await fetch(`/api/admin/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbnailUrl: cap.thumbnailUrl,
          thumbnail800: cap.thumbnail800,
          thumbnail400: cap.thumbnail400,
          blurDataURL: cap.blurDataURL,
          name: cap.title || site.name,
        }),
      });

      const updatedData = await updatedRes.json();
      if (updatedData.site) {
        const nextSites = sites.map((s) => (s.id === site.id ? updatedData.site : s));
        setSites(nextSites);
        try {
          localStorage.setItem("vault_curated_sites", JSON.stringify(nextSites));
        } catch {}
      }

      setActionNotice(`Updated snapshot for "${site.name}".`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 4. Toggle Visibility
  const handleToggleHide = async (site: SiteItem) => {
    try {
      const res = await fetch(`/api/admin/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !site.hidden }),
      });
      const data = await res.json();
      if (data.site) {
        const nextSites = sites.map((s) => (s.id === site.id ? data.site : s));
        setSites(nextSites);
        try {
          localStorage.setItem("vault_curated_sites", JSON.stringify(nextSites));
        } catch {}
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 5. Delete Site
  const handleDelete = async (site: SiteItem) => {
    if (!window.confirm(`Are you sure you want to remove "${site.name}" from VAULT?`)) return;
    try {
      await fetch(`/api/admin/sites/${site.id}`, { method: "DELETE" });
      const nextSites = sites.filter((s) => s.id !== site.id);
      setSites(nextSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(nextSites));
      } catch {}

      setActionNotice(`Removed "${site.name}".`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 6. Reorder Sites
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sites.length) return;

    const newSites = [...sites];
    const temp = newSites[index];
    newSites[index] = newSites[targetIndex];
    newSites[targetIndex] = temp;

    const orderedIds = newSites.map((s) => s.id);
    setSites(newSites);
    try {
      localStorage.setItem("vault_curated_sites", JSON.stringify(newSites));
    } catch {}

    try {
      await fetch("/api/admin/sites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err: any) {
      setError(err.message);
      fetchSites();
    }
  };

  // 7. Full site editing console
  const handleOpenEdit = (site: SiteItem) => {
    setEditingSite(site);
    setEditForm({
      name: site.name,
      description: site.description || "",
      url: site.url,
      thumbnailUrl: site.thumbnailUrl,
      thumbnail800: site.thumbnail800,
      thumbnail400: site.thumbnail400,
      blurDataURL: site.blurDataURL,
      hidden: Boolean(site.hidden),
      order: site.order ?? 0,
    });
  };

  const handleEditModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSite) return;

    setIsUploadingImage(true);
    setActionNotice("Optimizing replacement thumbnail with Sharp...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", editingSite.id);
      formData.append("slug", editForm.name || "custom");

      const res = await fetch("/api/admin/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process thumbnail.");
      }

      const cap = data.capture;
      setEditForm((prev) => ({
        ...prev,
        thumbnailUrl: cap.thumbnailUrl,
        thumbnail800: cap.thumbnail800,
        thumbnail400: cap.thumbnail400,
        blurDataURL: cap.blurDataURL,
      }));

      setActionNotice("✓ New thumbnail applied to edit draft.");
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploadingImage(false);
      if (editModalImageInputRef.current) editModalImageInputRef.current.value = "";
    }
  };

  const handleModalRecapture = async () => {
    if (!editForm.url.trim() || isModalCapturing) return;

    setIsModalCapturing(true);
    setActionNotice(`Re-capturing ${editForm.url} (waiting ${settleDelay}s for shaders to settle)...`);

    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: editForm.url.trim(),
          settleSeconds: settleDelay,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to recapture URL.");
      }

      const cap = data.capture;
      setEditForm((prev) => ({
        ...prev,
        name: prev.name || cap.title,
        description: prev.description || cap.description,
        thumbnailUrl: cap.thumbnailUrl,
        thumbnail800: cap.thumbnail800,
        thumbnail400: cap.thumbnail400,
        blurDataURL: cap.blurDataURL,
      }));

      setActionNotice("✓ Fresh screenshot captured and applied!");
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsModalCapturing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSite) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/sites/${editingSite.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      const updatedSite: SiteItem = data.site || {
        ...editingSite,
        ...editForm,
        updatedAt: new Date().toISOString(),
      };

      const nextSites = sites
        .map((s) => (s.id === editingSite.id ? updatedSite : s))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      setSites(nextSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(nextSites));
      } catch {}

      // Synchronize with server store
      fetch("/api/admin/sites/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sites: nextSites }),
      }).catch(() => {});

      setActionNotice(`✓ Saved changes for "${editForm.name}". Live gallery updated.`);
      setTimeout(() => setActionNotice(null), 3500);
      setEditingSite(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingSite) return;
    if (!window.confirm(`Are you sure you want to remove "${editingSite.name}" from VAULT?`)) return;

    try {
      await fetch(`/api/admin/sites/${editingSite.id}`, { method: "DELETE" });
      const nextSites = sites.filter((s) => s.id !== editingSite.id);
      setSites(nextSites);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(nextSites));
      } catch {}

      fetch("/api/admin/sites/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sites: nextSites }),
      }).catch(() => {});

      setActionNotice(`Removed "${editingSite.name}".`);
      setTimeout(() => setActionNotice(null), 3000);
      setEditingSite(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 8. Copy URL with tactile feedback
  const handleCopyUrl = (site: SiteItem) => {
    navigator.clipboard.writeText(site.url);
    setCopiedId(site.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 9. Download archive backup JSON
  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(sites, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActionNotice("Exported VAULT archive backup.");
    setTimeout(() => setActionNotice(null), 3000);
  };

  // 10. Restore archive backup JSON
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid backup file. Expected a JSON array of sites.");
      }

      setSites(parsed);
      try {
        localStorage.setItem("vault_curated_sites", JSON.stringify(parsed));
      } catch {}

      await fetch("/api/admin/sites/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sites: parsed }),
      });

      setActionNotice(`Successfully restored ${parsed.length} projects from backup.`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      setError(`Failed to restore backup: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const liveSitesCount = sites.filter((s) => !s.hidden).length;

  // Filtered sites based on search
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const q = searchQuery.toLowerCase().trim();
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [sites, searchQuery]);

  // Preview thumbnail fallback
  const previewImgSrc = capturedPreview
    ? previewImgError
      ? capturedPreview.blurDataURL || "/captures/default-fallback.webp"
      : capturedPreview.thumbnailUrl || capturedPreview.blurDataURL || "/captures/default-fallback.webp"
    : "";

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-[#0071e3] selection:text-white transition-colors duration-300">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#fbfbfd]/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/[0.08] dark:border-white/[0.1] shadow-[0_1px_0_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg font-semibold tracking-[-0.03em] bg-gradient-to-b from-neutral-950 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              VAULT
            </Link>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-mono tracking-widest uppercase border border-black/10 dark:border-white/15">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleExportBackup}
              title="Download JSON archive backup"
              className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore archive from JSON backup"
              className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restore</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/json"
              onChange={handleImportBackup}
              className="hidden"
            />

            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View Gallery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="relative p-6 rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-[#0c0c0e] shadow-sm overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Total Sites</span>
            <div className="text-3xl font-semibold mt-1 tracking-tight text-neutral-900 dark:text-white">{sites.length}</div>
          </div>
          <div className="relative p-6 rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-[#0c0c0e] shadow-sm overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Publicly Visible</span>
            <div className="text-3xl font-semibold mt-1 tracking-tight text-emerald-600 dark:text-emerald-400">{liveSitesCount}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 relative p-6 rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-[#0c0c0e] shadow-sm overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Hidden / Staged</span>
            <div className="text-3xl font-semibold mt-1 tracking-tight text-neutral-400 dark:text-neutral-500">{sites.length - liveSitesCount}</div>
          </div>
        </div>

        {/* Notifications */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADD SITE BY URL (CORE FEATURE)                           */}
        {/* ======================================================== */}
        <section className="relative p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0c0c0f] border-2 border-black/15 dark:border-white/20 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.18)] space-y-6 overflow-hidden">
          {/* Top specular edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 dark:bg-[#2997ff]/10 border border-[#0071e3]/20 dark:border-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] text-xs font-mono uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>Automated Headless Capture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Capture & Add Project by URL
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-normal leading-relaxed">
              Enter any public web deployment URL or GitHub repository URL. The serverless capture engine analyzes live sites or Git repositories, extracts metadata, renders a 1440×900 WebP thumbnail, and indexes it into your gallery.
            </p>
          </div>

          <form onSubmit={handleStartCapture} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://my-deployment.vercel.app or https://github.com/user/repo"
                required
                disabled={isCapturing}
                className="w-full h-14 px-5 rounded-2xl bg-neutral-100 dark:bg-[#15151b] border-2 border-black/10 dark:border-white/15 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-4 focus:ring-[#0071e3]/20 transition-all font-mono shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isCapturing || !inputUrl.trim()}
              className="h-14 px-8 rounded-2xl bg-gradient-to-b from-[#0077ed] to-[#0062c4] hover:from-[#0071e3] hover:to-[#005bb5] active:scale-98 text-white font-medium text-sm flex items-center justify-center gap-2.5 disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-[0_4px_20px_rgba(0,113,227,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] border border-white/20"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Capture Site</span>
                </>
              )}
            </button>
          </form>

          {/* Screenshot Timer & Settle Wait Controls */}
          <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#121217] border-2 border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Clock className="w-4 h-4 text-apple-blue shrink-0" />
              <span className="font-semibold">Capture Settle Timer:</span>
              <span className="font-mono text-apple-blue font-bold px-2 py-0.5 rounded bg-apple-blue/10 border border-apple-blue/20">
                {settleDelay}s
              </span>
              <span className="text-neutral-500 text-[11px] hidden sm:inline">
                (controls wait delay for 3D shaders, WebGL, animations & fonts)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "3s Fast", val: 3 },
                { label: "5s Standard", val: 5 },
                { label: "8s Motion", val: 8 },
                { label: "12s Heavy 3D", val: 12 },
                { label: "16s WebGL", val: 16 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setSettleDelay(preset.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    settleDelay === preset.val
                      ? "bg-apple-blue text-white shadow-xs"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-black/10 dark:border-white/10">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={settleDelay}
                  onChange={(e) => setSettleDelay(Math.max(1, Math.min(25, Number(e.target.value) || 5)))}
                  className="w-12 h-6 px-1.5 rounded bg-black/5 dark:bg-white/10 text-center font-mono text-xs text-neutral-900 dark:text-white border border-black/10 dark:border-white/15 focus:outline-none focus:border-apple-blue"
                />
                <span className="text-[10px] text-neutral-400">sec</span>
              </div>

              <button
                type="button"
                onClick={() => standaloneUploadRef.current?.click()}
                title="Bypass automated capture and upload custom image directly"
                className="ml-2 px-3 py-1 rounded-lg border border-apple-blue/30 bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Upload Image Directly</span>
              </button>
            </div>
          </div>

          {inputUrlMatch && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                    Already in VAULT · Up to Date:
                  </span>{" "}
                  <span>
                    &ldquo;{inputUrlMatch.name}&rdquo; is already indexed. No need to update — you&apos;re completely up to date!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery(inputUrlMatch.name)}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 font-semibold transition-colors text-emerald-950 dark:text-emerald-100 shrink-0"
              >
                Find in Search
              </button>
            </div>
          )}

          {isCapturing && captureStatus && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-medium flex items-center gap-3 animate-fadeIn">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
              <span>{captureStatus}</span>
            </div>
          )}

          {/* Captured Preview Card */}
          {capturedPreview && (
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-100 dark:bg-[#15151a] border-2 border-black/15 dark:border-white/20 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-apple-blue" />
                  <span>Review Captured Snapshot</span>
                </h3>
                {existingSiteMatch ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/30 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Already in VAULT · Up to Date</span>
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                    Ready to Publish
                  </span>
                )}
              </div>

              {existingSiteMatch && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                        Already in VAULT · You are completely up to date!
                      </p>
                      <p className="text-emerald-800/90 dark:text-emerald-300/80 mt-0.5">
                        This site is already indexed in your gallery as <strong>&ldquo;{existingSiteMatch.name}&rdquo;</strong>. No update is needed unless you wish to overwrite the snapshot or metadata.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPreview(null);
                      setInputUrl("");
                      setActionNotice(`&ldquo;${existingSiteMatch.name}&rdquo; is already up to date in VAULT.`);
                      setTimeout(() => setActionNotice(null), 3500);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-semibold transition-colors shrink-0"
                  >
                    Keep Existing (Cancel)
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden border-2 border-black/20 dark:border-white/25 bg-black shadow-md group">
                  <Image
                    src={previewImgSrc}
                    alt={capturedPreview.name}
                    fill
                    unoptimized
                    onError={() => setPreviewImgError(true)}
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                    <button
                      type="button"
                      onClick={() => customImageInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-black/85 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <ImagePlus className="w-4 h-4 text-apple-blue" />
                      <span>Upload Custom Image</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => customImageInputRef.current?.click()}
                    title="Upload custom image to replace this snapshot before publishing"
                    className="sm:hidden absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-medium border border-white/20 flex items-center gap-1.5"
                  >
                    <ImagePlus className="w-3 h-3" />
                    <span>Upload Image</span>
                  </button>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={capturedPreview.name}
                      onChange={(e) =>
                        setCapturedPreview({ ...capturedPreview, name: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0c0c0e] border-2 border-black/10 dark:border-white/15 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-apple-blue"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1">
                      Tagline / Description
                    </label>
                    <input
                      type="text"
                      value={capturedPreview.description}
                      onChange={(e) =>
                        setCapturedPreview({ ...capturedPreview, description: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0c0c0e] border-2 border-black/10 dark:border-white/15 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-apple-blue"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleConfirmAddSite}
                      className="px-6 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-98 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{existingSiteMatch ? "Update / Overwrite in VAULT" : "Publish to VAULT"}</span>
                    </button>
                    <button
                      onClick={() => setCapturedPreview(null)}
                      className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* SITE LIST & MANAGEMENT                                   */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                Archived Sites ({sites.length})
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Drag or reorder cards, edit metadata, refresh screenshots, or toggle live status.
              </p>
            </div>

            {/* Quick Filter Search Bar */}
            {sites.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter sites..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-neutral-100 dark:bg-[#121216] border border-black/10 dark:border-white/15 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-apple-blue"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-24 flex flex-col justify-center items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-apple-blue" />
              <span className="text-xs text-neutral-500">Loading archive...</span>
            </div>
          ) : sites.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border-2 border-dashed border-black/15 dark:border-white/20 bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                No Sites in VAULT
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Paste any live URL into the capture field above to screenshot and index your first project.
              </p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              No archived sites matched &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSites.map((site, idx) => {
                const isCopied = copiedId === site.id;

                return (
                  <div
                    key={site.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0d0d10] border-2 transition-all shadow-sm ${
                      site.hidden
                        ? "border-black/10 dark:border-white/10 opacity-60"
                        : "border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/35"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === sites.length - 1}
                            title="Move Down"
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Thumbnail with inline Data URI support & click-to-upload */}
                        <div
                          onClick={() => {
                            setTargetSiteForUpload(site);
                            siteImageInputRef.current?.click();
                          }}
                          title="Click to upload custom thumbnail"
                          className="relative w-24 h-15 sm:w-28 sm:h-17 rounded-xl overflow-hidden border-2 border-black/10 dark:border-white/15 bg-black shrink-0 shadow-xs group/thumb cursor-pointer"
                        >
                          <Image
                            src={site.thumbnailUrl || site.thumbnail800 || site.blurDataURL || "/captures/default-fallback.webp"}
                            alt={site.name}
                            fill
                            unoptimized
                            className="object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <ImagePlus className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                                {site.name}
                              </h3>
                              {site.hidden ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                                  Hidden
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                                  Live
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                              {site.description || "No description"}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-[11px]">
                              <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-apple-blue hover:underline font-mono"
                              >
                                <span>{site.url}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                              <span className="text-neutral-400 font-mono text-[10px]">Rank #{idx + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Copy URL */}
                        <button
                          onClick={() => handleCopyUrl(site)}
                          title={isCopied ? "Copied!" : "Copy URL"}
                          className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                        >
                          {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Recapture */}
                        <button
                          type="button"
                          onClick={() => handleRecapture(site)}
                          title="Re-capture fresh thumbnail"
                          className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Upload Custom Thumbnail (AFTER push) */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetSiteForUpload(site);
                            siteImageInputRef.current?.click();
                          }}
                          title="Upload custom thumbnail image"
                          className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-500 hover:text-apple-blue dark:hover:text-apple-blue transition-all cursor-pointer"
                        >
                          <ImagePlus className="w-4 h-4 text-apple-blue" />
                        </button>

                        {/* Full Edit & Control Console */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(site)}
                          title="Open full control & edit console"
                          className="p-2 rounded-xl border border-apple-blue/30 bg-apple-blue/5 hover:bg-apple-blue/15 text-apple-blue transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 text-apple-blue" />
                        </button>

                        {/* Toggle Visibility */}
                        <button
                          onClick={() => handleToggleHide(site)}
                          title={site.hidden ? "Unhide from gallery" : "Hide from public gallery"}
                          className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                        >
                          {site.hidden ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(site)}
                          title="Remove project"
                          className="p-2 rounded-xl border border-red-500/20 hover:border-red-500/40 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Full Dedicated Site Editor Modal */}
        {editingSite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0d0d12] border border-white/20 text-white shadow-[0_32px_96px_-12px_rgba(0,0,0,0.95)] p-6 sm:p-8 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-apple-blue font-semibold">
                    SITE CONTROL CONSOLE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                    Edit &ldquo;{editingSite.name}&rdquo;
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnail Preview & Management */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-300 tracking-wider uppercase font-mono">
                  Project Thumbnail Snapshot
                </label>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white/20 bg-black shadow-lg group">
                  <Image
                    src={editForm.thumbnailUrl || editForm.thumbnail800 || editForm.blurDataURL || "/captures/default-fallback.webp"}
                    alt={editForm.name}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => editModalImageInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4 text-apple-blue" />
                      <span>Upload Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleModalRecapture}
                      disabled={isModalCapturing}
                      className="px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-semibold hover:bg-black border border-white/20 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${isModalCapturing ? "animate-spin" : ""}`} />
                      <span>{isModalCapturing ? "Capturing..." : "Re-capture"}</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>16:10 aspect ratio · High-res WebP</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => editModalImageInputRef.current?.click()}
                      className="text-apple-blue hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Replace Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleModalRecapture}
                      disabled={isModalCapturing}
                      className="text-apple-blue hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isModalCapturing ? "animate-spin" : ""}`} />
                      <span>Re-capture URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono">
                    PROJECT TITLE
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20"
                    placeholder="e.g. Nomin Code"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono">
                    DESCRIPTION / TAGLINE
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 resize-none"
                    placeholder="Short tagline or summary of the project..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-neutral-300 font-mono">
                        TARGET URL
                      </label>
                      {editForm.url && (
                        <a
                          href={editForm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-apple-blue hover:underline inline-flex items-center gap-0.5 font-medium"
                        >
                          <span>Test Link</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono">
                      GALLERY ORDER RANK
                    </label>
                    <input
                      type="number"
                      value={editForm.order}
                      onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) || 0 })}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Visibility Switch */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Public Visibility</p>
                    <p className="text-[11px] text-neutral-400">
                      {editForm.hidden
                        ? "Hidden — This site is hidden from the public showcase."
                        : "Public — This site is visible to everyone on the gallery."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, hidden: !editForm.hidden })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      editForm.hidden
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {editForm.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{editForm.hidden ? "Hidden" : "Public"}</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleDeleteFromModal}
                  className="px-3.5 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Site</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingSite(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-apple-blue hover:bg-[#0077ed] text-white text-xs font-semibold shadow-lg shadow-apple-blue/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSavingEdit ? "Saving Changes..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input for Edit Modal Thumbnail Replacement */}
        <input
          ref={editModalImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleEditModalImageUpload}
        />

        {/* Hidden file input for Review Snapshot (BEFORE publish) */}
        <input
          ref={customImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePreviewCustomImageUpload}
        />

        {/* Hidden file input for Existing Site (AFTER publish) */}
        <input
          ref={siteImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSiteCustomImageUpload}
        />

        {/* Hidden file input for Standalone Direct Upload */}
        <input
          ref={standaloneUploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePreviewCustomImageUpload}
        />
      </main>
    </div>
  );
}
