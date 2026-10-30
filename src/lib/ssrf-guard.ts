import dns from "dns/promises";
import net from "net";

// RFC 1918, RFC 3927 (link-local/cloud metadata), loopback, RFC 4193 (IPv6 ULA)
function isPrivateOrReservedIP(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [b0, b1] = parts;

    // 0.0.0.0/8 (Broadcast/Current network)
    if (b0 === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;

    // 10.0.0.0/8 (Private network)
    if (b0 === 10) return true;

    // 172.16.0.0/12 (Private network)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.168.0.0/16 (Private network)
    if (b0 === 192 && b1 === 168) return true;

    // 169.254.0.0/16 (Link-local, AWS/GCP/Azure instance metadata 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;

    // 224.0.0.0/4 (Multicast)
    if (b0 >= 224) return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // ::1 (IPv6 Loopback)
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    // fc00::/7 (Unique Local Address)
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    // fe80::/10 (Link-Local)
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
    return false;
  }

  return true; // Unknown format, block for safety
}

export async function validateSafeUrl(rawUrl: string): Promise<{
  safe: boolean;
  error?: string;
  url?: URL;
}> {
  try {
    const parsed = new URL(rawUrl);

    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, error: "Only http and https protocols are permitted." };
    }

    const hostname = parsed.hostname;

    // Reject localhost, internal domains, AWS metadata aliases
    if (
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".corp")
    ) {
      return { safe: false, error: "Internal or local network domains are forbidden." };
    }

    // If it's already an IP address, check directly
    if (net.isIP(hostname)) {
      if (isPrivateOrReservedIP(hostname)) {
        return { safe: false, error: `Access to private/internal IP address (${hostname}) is blocked.` };
      }
      return { safe: true, url: parsed };
    }

    // Resolve hostname via DNS
    try {
      const lookupResults = await dns.lookup(hostname, { all: true });
      for (const res of lookupResults) {
        if (isPrivateOrReservedIP(res.address)) {
          return {
            safe: false,
            error: `Domain ${hostname} resolves to blocked internal address ${res.address}.`,
          };
        }
      }
    } catch (dnsErr: any) {
      return { safe: false, error: `DNS lookup failed for ${hostname}: ${dnsErr.message}` };
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, error: `Malformed URL: ${err.message}` };
  }
}
