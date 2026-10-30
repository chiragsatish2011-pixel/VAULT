/**
 * Design Tokens for VAULT Showcase
 * Matching Video 1 ("Fragments" archive) & Video 2 ("Alinma" 3D card-stack hero)
 */

export const FOLDER_PALETTE = [
  { id: "maroon", bg: "#8B1E5A", border: "#A2286D", text: "#FFFFFF", name: "Maroon" },
  { id: "orange", bg: "#E05A1B", border: "#F97316", text: "#FFFFFF", name: "Orange" },
  { id: "teal", bg: "#0F766E", border: "#14B8A6", text: "#FFFFFF", name: "Teal Green" },
  { id: "red", bg: "#DC2626", border: "#EF4444", text: "#FFFFFF", name: "Red" },
  { id: "purple", bg: "#5B21B6", border: "#7C3AED", text: "#FFFFFF", name: "Purple" },
  { id: "cobalt", bg: "#1D4ED8", border: "#3B82F6", text: "#FFFFFF", name: "Cobalt" },
  { id: "magenta", bg: "#831843", border: "#BE185D", text: "#FFFFFF", name: "Magenta" },
  { id: "yellow", bg: "#FACC15", border: "#EAB308", text: "#18181B", name: "Yellow Accent" },
  { id: "obsidian", bg: "#18181B", border: "#3F3F46", text: "#FFFFFF", name: "Obsidian Accent" },
  { id: "royal", bg: "#1E3A8A", border: "#2563EB", text: "#FFFFFF", name: "Royal Blue" },
  { id: "rose", bg: "#E11D48", border: "#F43F5E", text: "#FFFFFF", name: "Rose" },
  { id: "emerald", bg: "#047857", border: "#10B981", text: "#FFFFFF", name: "Emerald" },
];

export const CARD_3D_PALETTE = [
  { bg: "#7A8B7B", bevel: "#98A999", text: "#FFFFFF", name: "Sage" },
  { bg: "#5E6953", bevel: "#77836B", text: "#FFFFFF", name: "Olive" },
  { bg: "#4B6B82", bevel: "#6588A3", text: "#FFFFFF", name: "Dusty Blue" },
  { bg: "#A2593F", bevel: "#BF7256", text: "#FFFFFF", name: "Terracotta" },
  { bg: "#D98274", bevel: "#ECA093", text: "#FFFFFF", name: "Salmon Pink" },
  { bg: "#9C8A74", bevel: "#B8A58D", text: "#FFFFFF", name: "Tan" },
  { bg: "#2E5339", bevel: "#3F6F4D", text: "#FFFFFF", name: "Forest" },
  { bg: "#26292B", bevel: "#42464A", text: "#FFFFFF", name: "Charcoal" },
  { bg: "#8E607A", bevel: "#A97793", text: "#FFFFFF", name: "Muted Plum" },
  { bg: "#5C6B73", bevel: "#798A94", text: "#FFFFFF", name: "Slate" },
];

export const SPRING_CONFIGS = {
  // Video 1 Folder hover spring
  folderHover: {
    stiffness: 260,
    damping: 26,
    mass: 0.8,
  },
  // Video 2 3D Card hover wave spring
  cardWave: {
    stiffness: 180,
    damping: 22,
    mass: 1.0,
  },
  // Open Folder Transition
  folderOpenTransition: {
    durationMs: 750,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)", // ease-out-expo
  },
  // Desk paper drift physics
  paperShuffle: {
    stiffness: 200,
    damping: 20,
  },
};

/**
 * Strict Small-Text Rule Formatter
 * Generates purposeful, real project metadata for stamps, labels, tabs, and receipts
 */
export function formatProjectMicrocopy(project: {
  title: string;
  slug: string;
  status: string;
  lastSyncedSha?: string | null;
  createdAt: string;
  tags: string[];
  liveUrl: string;
  repoUrl: string;
  orderIndex?: number;
}) {
  const dateObj = new Date(project.createdAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const shortSha = project.lastSyncedSha?.slice(0, 7) || "HEAD";
  let primaryDomain = "";
  try {
    primaryDomain = new URL(project.liveUrl).hostname;
  } catch {
    primaryDomain = project.liveUrl;
  }

  return {
    codeBadge: project.title,
    date: formattedDate,
    sha: shortSha,
    domain: primaryDomain,
    statusText: project.status,
    primaryTag: project.tags[0] || "Showcase",
    secondaryTag: project.tags[1] || "Production",
  };
}
