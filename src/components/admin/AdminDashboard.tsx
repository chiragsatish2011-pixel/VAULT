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

  // Action status message
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
    setCaptureStatus("Loading headless browser & waiting 5 seconds for page settle...");
    setError(null);

    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Capture failed. Check URL or try local capture.");
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
      setActionNotice(`Added "${data.site.name}" to VAULT.`);
      setTimeout(() => setActionNotice(null), 3000);
      fetchSites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 3. Re-capture single existing site
  const handleRecapture = async (site: SiteItem) => {
    setActionNotice(`Recapturing ${site.name}...`);
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
      setTimeout(() => setActionNotice(null), 3000);
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
      setActionNotice(`Deleted "${site.name}".`);
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

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans selection:bg-[#0071e3] selection:text-white transition-colors duration-300">
      {/* Top Admin Nav */}
      <header className="sticky top-0 z-40 w-full bg-[#fbfbfd]/80 dark:bg-black/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              VAULT
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Gallery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Notifications */}
        {actionNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADD SITE BY URL (CORE FEATURE)                           */}
        {/* ======================================================== */}
        <section className="p-8 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Add a Site by URL
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Enter any public web URL. The system will load it in a headless browser, wait 5 seconds for animations and fonts to settle, capture a crisp thumbnail, and publish it to the gallery.
            </p>
          </div>

          <form onSubmit={handleStartCapture} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={isCapturing}
                className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isCapturing || !inputUrl.trim()}
              className="h-12 px-6 rounded-xl bg-[#0071e3] dark:bg-[#2997ff] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Capture Site</span>
                </>
              )}
            </button>
          </form>

          {isCapturing && captureStatus && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span>{captureStatus}</span>
            </div>
          )}

          {/* Captured Preview Card before confirming */}
          {capturedPreview && (
            <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Review & Confirm Site
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-black">
                  <Image
                    src={capturedPreview.thumbnailUrl}
                    alt={capturedPreview.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-500">Site Name / Title</label>
                    <input
                      type="text"
                      value={capturedPreview.name}
                      onChange={(e) =>
                        setCapturedPreview({ ...capturedPreview, name: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-500">Short Description</label>
                    <input
                      type="text"
                      value={capturedPreview.description}
                      onChange={(e) =>
                        setCapturedPreview({ ...capturedPreview, description: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleConfirmAddSite}
                      className="px-5 py-2 rounded-lg bg-[#0071e3] dark:bg-[#2997ff] text-white text-xs font-medium hover:opacity-95 cursor-pointer"
                    >
                      Publish to VAULT
                    </button>
                    <button
                      onClick={() => setCapturedPreview(null)}
                      className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
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
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                Gallery Sites ({sites.length})
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Manage order, update descriptions, re-capture thumbnails, or toggle visibility.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : sites.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-500 text-sm">
              No sites added to VAULT yet. Enter a URL above to capture your first site.
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map((site, idx) => {
                const isEditing = editingSiteId === site.id;

                return (
                  <div
                    key={site.id}
                    className={`p-4 rounded-xl bg-white dark:bg-[#0c0c0e] border transition-all ${
                      site.hidden
                        ? "border-neutral-200 dark:border-neutral-800 opacity-60"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === sites.length - 1}
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Thumbnail image */}
                        <div className="relative w-24 aspect-[16/10] rounded-md overflow-hidden bg-neutral-900 shrink-0 border border-neutral-200 dark:border-neutral-800">
                          <Image
                            src={site.thumbnailUrl}
                            alt={site.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* Text info or inline edit form */}
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-2.5 py-1 text-sm rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                              />
                              <input
                                type="text"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-2.5 py-1 text-xs rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                              />
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleSaveEdit(site.id)}
                                  className="px-3 py-1 bg-[#0071e3] text-white text-xs rounded font-medium cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingSiteId(null)}
                                  className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 text-xs rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                  {site.name}
                                </h3>
                                {site.hidden && (
                                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                {site.description || "No description provided."}
                              </p>
                              <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#0071e3] dark:text-[#2997ff] hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <span className="truncate max-w-xs">{site.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingSiteId(site.id);
                            setEditForm({ name: site.name, description: site.description, url: site.url });
                          }}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Re-capture Button */}
                        <button
                          onClick={() => handleRecapture(site)}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Re-capture Thumbnail"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Toggle Visibility */}
                        <button
                          onClick={() => handleToggleHide(site)}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                          title={site.hidden ? "Unhide from gallery" : "Hide from gallery"}
                        >
                          {site.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(site)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Site"
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
      </main>
    </div>
  );
}
