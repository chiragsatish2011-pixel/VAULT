/**
 * Client-safe URL normalization and utility functions
 */
export function normalizeUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr.trim());
    return `${parsed.hostname}${parsed.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return urlStr.trim().toLowerCase().replace(/\/+$/, "");
  }
}
