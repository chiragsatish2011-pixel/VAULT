import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/gallery/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "VAULT — Works by Chirag S.",
  description:
    "A curated gallery of websites, digital experiences, and web applications designed and built by Chirag S.",
  metadataBase: new URL("https://vault-showbook.vercel.app"),
  openGraph: {
    title: "VAULT — Works by Chirag S.",
    description:
      "A curated gallery of websites, digital experiences, and web applications designed and built by Chirag S.",
    url: "https://vault-showbook.vercel.app",
    siteName: "VAULT",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VAULT — Works by Chirag S.",
    description:
      "A curated gallery of websites, digital experiences, and web applications designed and built by Chirag S.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("vault_theme");
                  var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-black dark:text-white transition-colors antialiased selection:bg-[#0071e3] selection:text-white dark:selection:bg-[#2997ff] dark:selection:text-black">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
