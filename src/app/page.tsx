import { getAllSites } from "@/lib/sites-store";
import { AppleNav } from "@/components/gallery/AppleNav";
import { AppleHero } from "@/components/gallery/AppleHero";
import { AppleGrid } from "@/components/gallery/AppleGrid";
import { AppleFooter } from "@/components/gallery/AppleFooter";

export const revalidate = 60; // ISR cache with on-demand tag revalidation

export default async function HomePage() {
  const sites = await getAllSites(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] dark:bg-[#000000] text-black dark:text-white transition-colors">
      {/* Skip to Content for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to gallery content
      </a>

      {/* Translucent Frosted Top Navigation */}
      <AppleNav totalCount={sites.length} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full">
        {/* Apple Product Page Style Hero */}
        <AppleHero />

        {/* Edge-to-Edge Screen Wall Grid */}
        <AppleGrid sites={sites} />
      </main>

      {/* Minimal Apple-style Footer */}
      <AppleFooter totalCount={sites.length} />
    </div>
  );
}
