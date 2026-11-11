/**
 * Client-safe URL normalization and utility functions
 */
export function normalizeUrl(urlStr: string): string {
  try {
    let clean = urlStr.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "").replace(/\.git$/i, "").toLowerCase();
    return `${host}${pathname}`;
  } catch {
    return urlStr
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\.git$/i, "")
      .replace(/\/+$/, "");
  }
}
