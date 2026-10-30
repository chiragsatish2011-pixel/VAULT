import type { Metadata } from "next";
import "./globals.css";
import { HeaderNavbar } from "@/components/cinematic/HeaderNavbar";
import { CommandPalette } from "@/components/cinematic/CommandPalette";
import { MobileDesktopGuideModal } from "@/components/cinematic/MobileDesktopGuideModal";

export const metadata: Metadata = {
  title: "VAULT — Cinematic Showcase & Archival Dossier",
  description: "Curated Production Deployments, Physical Git Archival Dossiers, and Live Rendered Case Studies.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen selection:bg-white selection:text-black antialiased relative">
        {/* Subtle Archival Film Grain */}
        <div className="archival-grain" aria-hidden="true" />

        {/* Global Navigation */}
        <HeaderNavbar />
        <CommandPalette />
        <MobileDesktopGuideModal />

        <main className="relative z-10">{children}</main>

        {/* Clean Monochrome Footer */}
        <footer className="mt-24 border-t border-neutral-900 bg-black py-8 px-6 text-xs text-neutral-400 font-mono font-bold">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-editorial text-base font-black text-white tracking-widest">VAULT</span>
            <span className="text-neutral-500 font-bold">2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
