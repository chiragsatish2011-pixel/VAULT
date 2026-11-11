"use client";

import React, { useState, useEffect } from "react";
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
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { SiteItem } from "@/lib/sites-store";

export function AdminDashboard() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New site capture state
  const [inputUrl, setInputUrl] = useState("");
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

  // Editing state
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string; url: string }>({
    name: "",
    description: "",
    url: "",
  });

  // Action status notification
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/admin/sites");
      if (!res.ok) throw new Error("Failed to load sites.");
      const data = await res.json();
      setSites(data.sites || []);
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

  // 1. Capture site by URL
  const handleStartCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isCapturing) return;

    setIsCapturing(true);
    setCaptureStatus("Launching Chromium, navigating, and settling for 5s...");
    setError(null);

    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Capture failed. Check URL or try local capture CLI.");
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

  // 2. Save captured site to store
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

      setCapturedPreview(null);
      setInputUrl("");
      setActionNotice(`Published "${data.site.name}" to VAULT.`);
      setTimeout(() => setActionNotice(null), 3500);
      fetchSites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 3. Re-capture single existing site
  const handleRecapture = async (site: SiteItem) => {
    setActionNotice(`Re-capturing ${site.name} (5s settle wait)...`);
    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: site.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recapture failed.");

      const cap = data.capture;
      await fetch(`/api/admin/sites/${site.id}`, {
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

      setActionNotice(`Updated thumbnail for "${site.name}".`);
      setTimeout(() => setActionNotice(null), 3500);
      fetchSites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 4. Toggle Visibility
  const handleToggleHide = async (site: SiteItem) => {
    try {
      await fetch(`/api/admin/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !site.hidden }),
      });
      fetchSites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 5. Delete Site
  const handleDelete = async (site: SiteItem) => {
    if (!window.confirm(`Are you sure you want to remove "${site.name}" from VAULT?`)) return;
    try {
      await fetch(`/api/admin/sites/${site.id}`, { method: "DELETE" });
      setActionNotice(`Removed "${site.name}".`);
      setTimeout(() => setActionNotice(null), 3000);
      fetchSites();
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

  // 7. Edit details
  const handleSaveEdit = async (id: string) => {
    try {
      await fetch(`/api/admin/sites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingSiteId(null);
      fetchSites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const liveSitesCount = sites.filter((s) => !s.hidden).length;

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-[#0071e3] selection:text-white transition-colors duration-300">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#fbfbfd]/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/[0.08] dark:border-white/[0.1]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-[-0.03em] text-black dark:text-white hover:opacity-80 transition-opacity">
              VAULT
            </Link>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium tracking-wide uppercase">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View Live Gallery</span>
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
          <div className="p-5 rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-[#0c0c0e] shadow-sm">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Sites</span>
            <div className="text-3xl font-semibold mt-1 tracking-tight text-neutral-900 dark:text-white">{sites.length}</div>
          </div>
          <div className="p-5 rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-[#0c0c0e] shadow-sm">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Publicly Visible</span>
            <div className="text-3xl font-semibold mt-1 tracking-tight text-emerald-600 dark:text-emerald-400">{liveSitesCount}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl border-2 border-black/10 dark:border-white/15 bg-white dark:bg-[#0c0c0e] shadow-sm">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Hidden / Staged</span>
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
        <section className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0d0d10] border-2 border-black/15 dark:border-white/20 shadow-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.15)] space-y-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-apple-blue text-xs font-semibold uppercase tracking-wider mb-2">
              <Camera className="w-4 h-4" />
              <span>Automated Headless Capture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Capture & Add Project by URL
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-normal leading-relaxed">
              Enter any public web deployment URL. The serverless capture engine loads the site in headless Chromium, waits 5 seconds for typography, videos, and entrance animations to settle, renders a 1440×900 WebP thumbnail, and indexes it into your gallery.
            </p>
          </div>

          <form onSubmit={handleStartCapture} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://my-awesome-website.vercel.app"
                required
                disabled={isCapturing}
                className="w-full h-14 px-5 rounded-2xl bg-neutral-100 dark:bg-[#15151a] border-2 border-black/10 dark:border-white/15 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-4 focus:ring-[#0071e3]/20 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isCapturing || !inputUrl.trim()}
              className="h-14 px-8 rounded-2xl bg-[#0071e3] dark:bg-[#2997ff] text-white font-medium text-sm flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-98 disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-md hover:shadow-lg"
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
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  Ready to Publish
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden border-2 border-black/20 dark:border-white/25 bg-black shadow-md">
                  <Image
                    src={capturedPreview.thumbnailUrl}
                    alt={capturedPreview.name}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
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

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleConfirmAddSite}
                      className="px-6 py-2.5 rounded-xl bg-[#0071e3] dark:bg-[#2997ff] text-white text-xs font-semibold hover:opacity-95 cursor-pointer shadow-md"
                    >
                      Publish to VAULT
                    </button>
                    <button
                      onClick={() => setCapturedPreview(null)}
                      className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      Discard
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                Archived Sites ({sites.length})
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Drag or reorder cards, edit metadata, refresh screenshots, or toggle live status.
              </p>
            </div>
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
          ) : (
            <div className="space-y-4">
              {sites.map((site, idx) => {
                const isEditing = editingSiteId === site.id;

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

                        {/* Thumbnail */}
                        <div className="relative w-24 h-15 sm:w-28 sm:h-17 rounded-xl overflow-hidden border-2 border-black/10 dark:border-white/15 bg-black shrink-0 shadow-xs">
                          <Image
                            src={site.thumbnailUrl || site.thumbnail800 || "/captures/default-fallback.webp"}
                            alt={site.name}
                            fill
                            unoptimized
                            className="object-cover object-top"
                          />
                        </div>

                        {/* Title & Description */}
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full h-8 px-2.5 rounded-lg bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white"
                                placeholder="Site Name"
                              />
                              <input
                                type="text"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full h-8 px-2.5 rounded-lg bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300"
                                placeholder="Description"
                              />
                              <input
                                type="url"
                                value={editForm.url}
                                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                className="w-full h-8 px-2.5 rounded-lg bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 font-mono"
                                placeholder="URL"
                              />
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleSaveEdit(site.id)}
                                  className="px-3 py-1 rounded-md bg-apple-blue text-white text-xs font-medium cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingSiteId(null)}
                                  className="px-2.5 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                                  {site.name}
                                </h3>
                                {site.hidden && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-medium">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 truncate mt-0.5">
                                {site.description || "No description"}
                              </p>
                              <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-apple-blue hover:underline font-mono mt-1"
                              >
                                <span>{site.url}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Recapture */}
                          <button
                            onClick={() => handleRecapture(site)}
                            title="Re-capture fresh 1440w WebP thumbnail"
                            className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditingSiteId(site.id);
                              setEditForm({ name: site.name, description: site.description, url: site.url });
                            }}
                            title="Edit metadata"
                            className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
