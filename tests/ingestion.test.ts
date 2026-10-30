import { performStaticAnalysis } from "../src/lib/static-analyzer";
import { generateProjectDocs } from "../src/lib/doc-generator";
import { GitFileTreeNode } from "../src/types";

async function runIngestionTests() {
  console.log("⚙️ Running Ingestion Pipeline & Grounding Unit Tests...");

  // Mock repository data
  const mockTree: GitFileTreeNode[] = [
    { path: "Cargo.toml", type: "blob", size: 500 },
    { path: "src/main.rs", type: "blob", size: 1200 },
    { path: "src/engine.rs", type: "blob", size: 3400 },
    { path: "Dockerfile", type: "blob", size: 300 },
    { path: ".github/workflows/ci.yml", type: "blob", size: 450 },
    { path: "README.md", type: "blob", size: 800 },
  ];

  const mockLanguages = { Rust: 92.5, Dockerfile: 7.5 };
  const mockManifests = {
    cargoToml: `[package]\nname = "hyper-stream"\nversion = "1.0.0"\n[dependencies]\ntokio = "1.0"\nwasmtime = "20.0"`,
    readme: "# HyperStream\nReal-time telemetry processor built in Rust with WebAssembly.",
    dockerfile: "FROM rust:1.77",
  };

  // Test 1: Static Analysis
  const analysis = performStaticAnalysis(mockTree, mockLanguages, mockManifests);
  if (analysis.primaryLanguage !== "Rust") {
    throw new Error(`ANALYSIS TEST FAILED: Expected Rust, got ${analysis.primaryLanguage}`);
  }
  if (!analysis.frameworks.includes("Tokio") || !analysis.frameworks.includes("Wasmtime")) {
    throw new Error(`ANALYSIS TEST FAILED: Tokio or Wasmtime missing from frameworks.`);
  }
  if (!analysis.hasDocker || !analysis.hasCI) {
    throw new Error(`ANALYSIS TEST FAILED: Dockerfile or CI workflow detection failed.`);
  }
  console.log("  ✓ Static analysis accurately identified Rust, Tokio, Wasmtime, Dockerfile, and CI workflows.");

  // Test 2: Grounded Docs & Model Card Spec Sheet Generation
  const result = await generateProjectDocs({
    repoMeta: {
      name: "hyper-stream",
      fullName: "test/hyper-stream",
      description: "Real-time telemetry processor",
      stars: 120,
      forks: 15,
      openIssues: 2,
      defaultBranch: "main",
      license: "Apache-2.0",
      topics: ["rust", "telemetry"],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-06-01T00:00:00Z",
      pushedAt: "2025-06-01T00:00:00Z",
    },
    liveUrl: "https://hyperstream.io",
    repoUrl: "https://github.com/test/hyper-stream",
    tree: mockTree,
    languages: mockLanguages,
    manifests: mockManifests,
    readme: mockManifests.readme,
    analysis,
  });

  // Verify all sections exist
  const expectedSections = ["overview", "architecture", "data_flow", "walkthrough", "trade_offs", "reverse_narrative"];
  for (const sec of expectedSections) {
    if (!result.docs[sec as keyof typeof result.docs]) {
      throw new Error(`DOCS TEST FAILED: Missing documentation section: ${sec}`);
    }
  }
  console.log("  ✓ Generated all 6 required documentation sections.");

  // Verify Mermaid diagram syntax
  if (!result.docs.architecture.includes("```mermaid") || !result.docs.data_flow.includes("```mermaid")) {
    throw new Error("DOCS TEST FAILED: Mermaid diagram blocks missing in architecture or data flow.");
  }
  console.log("  ✓ Generated valid Mermaid system architecture and data flow sequences.");

  // Verify Spec Card fields (NVIDIA format)
  const spec = result.specCard;
  if (!spec.projectName || !spec.version || !spec.requirements.runtime || !spec.hosting.platform) {
    throw new Error("SPEC CARD TEST FAILED: Missing structured NVIDIA spec fields.");
  }
  console.log("  ✓ Generated complete NVIDIA-format Model Card & Spec Sheet.");

  // Verify grounded constraint tagging
  if (!result.docs.trade_offs.includes("[Inferred]") && !spec.limitations.some((l) => l.includes("[Inferred]"))) {
    throw new Error("GROUNDING TEST FAILED: Expected uncertain items to be tagged as [Inferred].");
  }
  console.log("  ✓ Correctly tagged speculative architectural trade-offs with '[Inferred]'.");

  console.log("✅ All Ingestion & Grounding unit tests passed successfully!\n");
}

runIngestionTests().catch((e) => {
  console.error("❌ Ingestion Tests Failed:", e);
  process.exit(1);
});
