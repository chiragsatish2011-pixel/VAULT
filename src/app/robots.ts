import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // We do not even mention the secret admin path in Disallow to prevent reconnaissance/information leakage
    },
    sitemap: "https://vault.local/sitemap.xml",
  };
}
