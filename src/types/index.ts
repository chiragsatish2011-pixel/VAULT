export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description?: string | null;
  liveUrl: string;
  repoUrl: string;
  hostingNotes?: string | null;
  status: "Live" | "WIP" | "Archived";
  visibility: "public" | "unlisted" | "draft";
  featured: boolean;
  tags: string[];
  accentColor: string;
  lastSyncedSha?: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  assets: AssetData[];
}

export interface AssetData {
  id: string;
  projectId: string;
  type: "screenshot" | "video" | "cover" | "og_image";
  path: string;
  viewport?: "desktop" | "tablet" | "mobile" | null;
}

export interface DocSection {
  id: string;
  section: string;
  markdown: string;
  generatedAt: string;
  sourceSha?: string | null;
  isManualOverride: boolean;
}

export interface GitCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitRelease {
  tagName: string;
  name: string;
  publishedAt: string;
  body: string;
  url: string;
}

export interface GitFileTreeNode {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha?: string;
  content?: string; // If loaded for preview
}

export interface RepoSnapshotData {
  tree: GitFileTreeNode[];
  languages: Record<string, number>;
  commits: GitCommit[];
  releases: GitRelease[];
  manifests: {
    packageJson?: Record<string, unknown>;
    cargoToml?: string;
    dockerfile?: string;
    readme?: string;
    [key: string]: unknown;
  };
  fetchedAt: string;
}

export interface SpecCardData {
  projectName: string;
  version: string;
  status: "Live" | "WIP" | "Archived";
  license: string;
  type: string;
  category: string;
  intendedUse: string;
  targetUsers: string;
  architectureSummary: string;
  languages: string[];
  frameworks: string[];
  keyDependencies: string[];
  hosting: {
    platform: string;
    domain: string;
    repoLocation: string;
    deployBranch: string;
    storage: string;
    database: string;
    cdn?: string;
  };
  apisAndModels: Array<{
    name: string;
    provider: string;
    purpose: string;
  }>;
  inputsAndOutputs: {
    inputs: string[];
    outputs: string[];
  };
  requirements: {
    runtime: string;
    hardwareNotes: string;
  };
  limitations: string[];
  knownIssues: string[];
  ethicalNotes?: string;
  links: {
    liveSite: string;
    repo: string;
    docs?: string;
    demoVideo?: string;
  };
  citation: string;
  lastVerified: string;
  dates: {
    created: string;
    firstCommit?: string;
    lastCommit: string;
    lastDeployed: string;
  };
}

export interface ProjectDetail extends ProjectSummary {
  docs: DocSection[];
  repoSnapshot: RepoSnapshotData | null;
  specCard: SpecCardData | null;
}
