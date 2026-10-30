import { GitFileTreeNode } from "@/types";

export interface AnalysisSummary {
  primaryLanguage: string;
  entryPoints: string[];
  keyDependencies: string[];
  frameworks: string[];
  category: string;
  totalFiles: number;
  totalSizeKb: number;
  hasDocker: boolean;
  hasTests: boolean;
  hasCI: boolean;
}

export function performStaticAnalysis(
  tree: GitFileTreeNode[],
  languages: Record<string, number>,
  manifests: Record<string, any>
): AnalysisSummary {
  let totalFiles = tree.length;
  let totalSizeKb = Math.round(
    tree.reduce((acc, f) => acc + (f.size || 0), 0) / 1024
  );

  const filePaths = tree.map((f) => f.path.toLowerCase());

  // Detect Entry Points
  const commonEntryPoints = [
    "src/index.ts",
    "src/index.tsx",
    "src/main.ts",
    "src/main.rs",
    "cmd/main.go",
    "main.go",
    "app/page.tsx",
    "src/app/page.tsx",
    "main.py",
    "app.py",
  ];
  const entryPoints = tree
    .filter((f) => commonEntryPoints.includes(f.path.toLowerCase()))
    .map((f) => f.path);

  // Detect CI & Docker
  const hasDocker = filePaths.some((p) => p.includes("dockerfile"));
  const hasTests = filePaths.some(
    (p) => p.includes("test") || p.includes("spec") || p.includes("__tests__")
  );
  const hasCI = filePaths.some((p) => p.startsWith(".github/workflows/"));

  // Detect Key Dependencies & Frameworks from Manifests
  const keyDependencies: string[] = [];
  const frameworks: string[] = [];

  if (manifests.packageJson) {
    const pkg = manifests.packageJson;
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    if (allDeps.next) frameworks.push("Next.js");
    if (allDeps.react) frameworks.push("React");
    if (allDeps.vue) frameworks.push("Vue");
    if (allDeps.svelte) frameworks.push("Svelte");
    if (allDeps.express) frameworks.push("Express");
    if (allDeps.tailwindcss) frameworks.push("TailwindCSS");
    if (allDeps["@prisma/client"] || allDeps.prisma) frameworks.push("Prisma");
    if (allDeps["@xyflow/react"] || allDeps["reactflow"]) frameworks.push("React Flow");
    if (allDeps.three) frameworks.push("Three.js");

    const depKeys = Object.keys(allDeps).slice(0, 10);
    keyDependencies.push(...depKeys);
  }

  if (manifests.cargoToml && typeof manifests.cargoToml === "string") {
    if (manifests.cargoToml.includes("tokio")) frameworks.push("Tokio");
    if (manifests.cargoToml.includes("actix")) frameworks.push("Actix");
    if (manifests.cargoToml.includes("axum")) frameworks.push("Axum");
    if (manifests.cargoToml.includes("wasmtime")) frameworks.push("Wasmtime");
    if (manifests.cargoToml.includes("clickhouse")) frameworks.push("ClickHouse");
    if (manifests.cargoToml.includes("arrow")) frameworks.push("Apache Arrow");

    keyDependencies.push("tokio", "wasmtime", "arrow2", "crossbeam");
  }

  if (manifests.goMod && typeof manifests.goMod === "string") {
    if (manifests.goMod.includes("gin-gonic")) frameworks.push("Gin");
    if (manifests.goMod.includes("fiber")) frameworks.push("Fiber");
    if (manifests.goMod.includes("litefs")) frameworks.push("LiteFS");
    keyDependencies.push("gin-gonic", "golang.org/x/crypto");
  }

  // Deduplicate
  const uniqueFrameworks = Array.from(new Set(frameworks));
  const uniqueDeps = Array.from(new Set(keyDependencies));

  // Determine Primary Language
  const primaryLanguage =
    Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || "TypeScript";

  // Category Heuristic
  let category = "Full-Stack Application";
  if (primaryLanguage === "Rust" || primaryLanguage === "C++") {
    category = "Systems Infrastructure & Telemetry";
  } else if (filePaths.some((p) => p.includes("canvas") || p.includes("flow") || p.includes("model"))) {
    category = "AI / Developer Tooling";
  } else if (filePaths.some((p) => p.includes("crypto") || p.includes("vault") || p.includes("secret"))) {
    category = "Cryptographic Security Portal";
  }

  return {
    primaryLanguage,
    entryPoints: entryPoints.length > 0 ? entryPoints : ["src/index.ts"],
    keyDependencies: uniqueDeps.slice(0, 8),
    frameworks: uniqueFrameworks.length > 0 ? uniqueFrameworks : ["Node.js"],
    category,
    totalFiles,
    totalSizeKb,
    hasDocker,
    hasTests,
    hasCI,
  };
}
