import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seed() {
  console.log("🌱 Clearing old data...");
  await db.rateLimitAttempt.deleteMany();
  await db.auditLog.deleteMany();
  await db.adminSession.deleteMany();
  await db.doc.deleteMany();
  await db.asset.deleteMany();
  await db.specCard.deleteMany();
  await db.repoSnapshot.deleteMany();
  await db.project.deleteMany();

  console.log("🚀 Seeding Project 1: KRONOS...");
  const kronos = await db.project.create({
    data: {
      slug: "kronos",
      title: "KRONOS Stream Engine",
      tagline: "High-throughput, sub-millisecond distributed time-series analytics and telemetry engine.",
      description: "KRONOS is an ultra-fast event streaming engine built in Rust with WebAssembly plugins, delivering real-time metric ingestion at 1.8M events/sec with vectorized ClickHouse storage and real-time anomaly detection.",
      liveUrl: "https://kronos.stream.dev",
      repoUrl: "https://github.com/chirag/kronos-engine",
      hostingNotes: "Deployed on bare-metal Hetzner AX102 cluster (AMD EPYC 9654, 128GB DDR5 ECC), NVMe RAID-1, Edge ingest routed via Cloudflare Magic Transit and Anycast BGP.",
      status: "Live",
      visibility: "public",
      featured: true,
      tags: JSON.stringify(["Rust", "WebAssembly", "ClickHouse", "Distributed Systems", "Timeseries", "gRPC"]),
      accentColor: "#00F0FF",
      lastSyncedSha: "7b4f981e2a09c4d3b6f8812e1045a19c54e48b11",
      orderIndex: 0,
      createdAt: new Date("2025-08-14T10:00:00Z"),
      updatedAt: new Date("2026-02-12T16:30:00Z"),
      assets: {
        create: [
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
            viewport: "desktop",
          },
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
            viewport: "tablet",
          },
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80",
            viewport: "mobile",
          },
          {
            type: "cover",
            path: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80",
          },
        ],
      },
      specCard: {
        create: {
          fields: JSON.stringify({
            projectName: "KRONOS Stream Engine",
            version: "v2.4.0-stable",
            status: "Live",
            license: "Apache-2.0",
            type: "Distributed Systems / Telemetry Infrastructure",
            category: "Streaming Analytics",
            intendedUse: "Real-time metrics ingestion, microsecond sliding-window aggregation, and automated incident triage for mission-critical cloud topologies.",
            targetUsers: "Infrastructure Engineers, SREs, High-Frequency Trading Telemetry Teams",
            architectureSummary: "Zero-copy lock-free ring-buffer pipeline in Rust utilizing Tokio, SIMD-accelerated filtering, and streaming Wasm filters with Arrow/Parquet batching to ClickHouse.",
            languages: ["Rust (84%)", "WebAssembly/Wat (11%)", "SQL/ClickHouse (5%)"],
            frameworks: ["Tokio", "Tower-gRPC", "Apache Arrow", "Wasmtime"],
            keyDependencies: ["wasmtime", "arrow2", "clickhouse-rs", "prost", "dashmap", "crossbeam-channel"],
            hosting: {
              platform: "Hetzner Cloud Dedicated (AX102)",
              domain: "kronos.stream.dev",
              repoLocation: "github.com/chirag/kronos-engine",
              deployBranch: "main",
              storage: "ZFS NVMe Pools (2x 1.92TB NVMe PCIe 4.0)",
              database: "ClickHouse Cluster (3-node replication)",
              cdn: "Cloudflare Spectrum Anycast",
            },
            apisAndModels: [
              {
                name: "gRPC Streaming Telemetry API",
                provider: "KRONOS Native (Port 50051)",
                purpose: "Binary protobuf protocol for sub-100μs event ingestion",
              },
              {
                name: "Prometheus Remote-Write Gateway",
                provider: "Internal adapter",
                purpose: "Drop-in ingest for Kubernetes & Grafana agents",
              },
            ],
            inputsAndOutputs: {
              inputs: ["Protobuf Stream (OTLP / Prometheus Remote-Write)", "JSON via HTTP/2 POST", "Kafka / Redpanda Ingest Topic"],
              outputs: ["Vectorized ClickHouse Columnar Storage", "Real-time SSE Anomaly Alerts", "Grafana-compatible SQL Endpoint"],
            },
            requirements: {
              runtime: "Linux x86_64 or aarch64 (Kernel >= 5.15 with io_uring support)",
              hardwareNotes: "Minimum 4 cores, 8GB RAM; Production recommendation 32+ cores, 64GB DDR5, NVMe storage.",
            },
            limitations: [
              "Out-of-order events delayed beyond 15 minutes are shifted to cold historical partitions.",
              "Wasm filter execution has a hard 50ms watchdog timeout per batch to prevent pipeline stalling.",
            ],
            knownIssues: [
              "Memory footprint spikes by ~18% during massive schema repartitioning under sustained 2M evt/sec load.",
            ],
            ethicalNotes: "Designed for telemetry operational metrics only; default masks IP addresses and PII fields prior to ingestion.",
            links: {
              liveSite: "https://kronos.stream.dev",
              repo: "https://github.com/chirag/kronos-engine",
              docs: "https://kronos.stream.dev/docs",
              demoVideo: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-996-large.mp4",
            },
            citation: "Chirag (2025). KRONOS: Sub-Millisecond Time-Series Stream Engine in Rust. GitHub repository.",
            lastVerified: "2026-02-12T16:30:00Z",
            dates: {
              created: "2025-08-14",
              firstCommit: "2025-08-14T11:22:15Z",
              lastCommit: "2026-02-12T16:28:40Z",
              lastDeployed: "2026-02-12T16:30:00Z",
            },
          }),
        },
      },
      repoSnapshot: {
        create: {
          languages: JSON.stringify({ Rust: 84.2, WebAssembly: 10.9, SQL: 4.9 }),
          commits: JSON.stringify([
            {
              sha: "7b4f981e2a09c4d3b6f8812e1045a19c54e48b11",
              shortSha: "7b4f981",
              message: "perf(ingest): vectorize sliding window aggregations using AVX-512 intrinsics",
              author: "Chirag",
              date: "2026-02-12T16:28:40Z",
              url: "https://github.com/chirag/kronos-engine/commit/7b4f981",
            },
            {
              sha: "e3a8901c0b34f71a9e88d1230198cd4a123bcdef",
              shortSha: "e3a8901",
              message: "feat(wasm): add safe memory sandbox limits for user-defined filters",
              author: "Chirag",
              date: "2026-02-09T14:15:22Z",
              url: "https://github.com/chirag/kronos-engine/commit/e3a8901",
            },
            {
              sha: "90ab45df12cd890ef123456789abcdef01234567",
              shortSha: "90ab45d",
              message: "fix(clickhouse): handle connection backpressure under saturation gracefully",
              author: "Chirag",
              date: "2026-01-28T09:44:01Z",
              url: "https://github.com/chirag/kronos-engine/commit/90ab45d",
            },
            {
              sha: "11223344556677889900aabbccddeeff00112233",
              shortSha: "1122334",
              message: "ci: add multi-platform cross-compilation pipeline for arm64 & x86_64",
              author: "Chirag",
              date: "2026-01-15T18:02:11Z",
              url: "https://github.com/chirag/kronos-engine/commit/1122334",
            },
          ]),
          releases: JSON.stringify([
            {
              tagName: "v2.4.0",
              name: "KRONOS 2.4.0: Vectorized Aggregations & Zero-Copy I/O",
              publishedAt: "2026-02-12T16:30:00Z",
              body: "## Highlights\n- 38% throughput boost via AVX-512 vectorized bucketing\n- Zero-copy ring buffer with crossbeam\n- Native ClickHouse 24.x columnar driver integration",
              url: "https://github.com/chirag/kronos-engine/releases/tag/v2.4.0",
            },
            {
              tagName: "v2.3.1",
              name: "KRONOS 2.3.1: Wasm Runtime Hardening",
              publishedAt: "2026-01-20T12:00:00Z",
              body: "Fixed memory limits inside Wasmtime executor for dynamic aggregate scripts.",
              url: "https://github.com/chirag/kronos-engine/releases/tag/v2.3.1",
            },
          ]),
          tree: JSON.stringify([
            {
              path: "Cargo.toml",
              type: "blob",
              size: 1420,
              content: `[package]
name = "kronos-engine"
version = "2.4.0"
edition = "2021"
authors = ["Chirag <chirag@kronos.stream.dev>"]
license = "Apache-2.0"
description = "High-throughput, sub-millisecond distributed time-series engine"

[dependencies]
tokio = { version = "1.38", features = ["full", "tracing"] }
tokio-util = { version = "0.7", features = ["codec"] }
tower = "0.4"
tonic = "0.11"
prost = "0.12"
wasmtime = "20.0"
arrow2 = { version = "0.17", features = ["simd"] }
clickhouse = { version = "0.11", features = ["tls"] }
crossbeam = "0.8"
parking_lot = "0.12"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
dashmap = "5.5"

[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
panic = "abort"`,
            },
            {
              path: "src/main.rs",
              type: "blob",
              size: 2840,
              content: `//! KRONOS Main Ingestion Daemon
use std::sync::Arc;
use tokio::signal;
use tracing::{info, error};

mod engine;
mod ring_buffer;
mod wasm_filter;
mod storage;
mod telemetry;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    info!("Starting KRONOS Engine v2.4.0 on 0.0.0.0:50051");

    let config = engine::Config::from_env();
    let ring = Arc::new(ring_buffer::RingBuffer::new(config.buffer_capacity));
    let wasm_runtime = Arc::new(wasm_filter::WasmFilterEngine::new(&config.filter_module)?);
    let sink = storage::ClickHouseSink::connect(&config.clickhouse_url).await?;

    let supervisor = engine::Supervisor::spawn(ring.clone(), wasm_runtime, sink);

    info!("KRONOS is ready for ingest. Listening for OTLP gRPC streams...");
    signal::ctrl_c().await?;
    info!("Shutdown signal received. Flushing pending buffer batches...");
    supervisor.graceful_shutdown().await;
    info!("KRONOS halted cleanly.");
    Ok(())
}`,
            },
            {
              path: "src/ring_buffer.rs",
              type: "blob",
              size: 1950,
              content: `use crossbeam::queue::ArrayQueue;
use std::sync::Arc;

pub struct MetricEvent {
    pub timestamp_ns: u64,
    pub metric_hash: u64,
    pub value: f64,
    pub tags_bytes: Vec<u8>,
}

pub struct RingBuffer {
    queue: Arc<ArrayQueue<MetricEvent>>,
}

impl RingBuffer {
    pub fn new(capacity: usize) -> Self {
        Self {
            queue: Arc::new(ArrayQueue::new(capacity)),
        }
    }

    #[inline(always)]
    pub fn push(&self, event: MetricEvent) -> Result<(), MetricEvent> {
        self.queue.push(event)
    }

    pub fn drain_batch(&self, max_batch: usize) -> Vec<MetricEvent> {
        let mut batch = Vec::with_capacity(max_batch);
        while let Some(evt) = self.queue.pop() {
            batch.push(evt);
            if batch.len() >= max_batch {
                break;
            }
        }
        batch
    }
}`,
            },
            {
              path: "src/wasm_filter.rs",
              type: "blob",
              size: 1720,
              content: `use wasmtime::*;

pub struct WasmFilterEngine {
    engine: Engine,
    module: Module,
}

impl WasmFilterEngine {
    pub fn new(wasm_bytes: &[u8]) -> Result<Self, Error> {
        let mut config = Config::new();
        config.consume_fuel(true);
        config.cranelift_opt_level(OptLevel::Speed);
        let engine = Engine::new(&config)?;
        let module = Module::new(&engine, wasm_bytes)?;
        Ok(Self { engine, module })
    }

    pub fn evaluate_metric(&self, metric_value: f64) -> bool {
        // Runs dynamic bytecode logic inside isolated Wasmtime sandbox
        metric_value.is_finite() && metric_value >= 0.0
    }
}`,
            },
            {
              path: "Dockerfile",
              type: "blob",
              size: 840,
              content: `FROM rust:1.77-bookworm as builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/local/bin
COPY --from=builder /app/target/release/kronos-engine .
EXPOSE 50051 8080
ENTRYPOINT ["./kronos-engine"]`,
            },
            {
              path: "README.md",
              type: "blob",
              size: 2150,
              content: `# KRONOS Stream Engine

> High-throughput, sub-millisecond distributed time-series analytics and telemetry engine written in Rust.

## Architecture
- **Inbound Ring-Buffer:** Zero-copy lock-free ring buffer accepting up to 1.8M events/sec.
- **Wasm Runtime:** Dynamic user-defined metric transformation functions compiled to WebAssembly.
- **Vectorized Storage:** SIMD Arrow aggregations dumped in micro-batches directly to ClickHouse.

## Performance Benchmark
- **Latency (P99.9):** 0.18ms
- **Memory Footprint:** 48MB baseline, 280MB at 1.5M events/sec peak
- **Ingestion Throughput:** 1,840,000 metrics/sec per node on AMD EPYC 9654`,
            },
          ]),
          manifests: JSON.stringify({
            cargoToml: "[package]\nname = \"kronos-engine\"\nversion = \"2.4.0\"",
            dockerfile: "FROM rust:1.77-bookworm as builder",
            readme: "# KRONOS Stream Engine",
          }),
        },
      },
      docs: {
        create: [
          {
            section: "overview",
            markdown: `### Executive Overview
**KRONOS** is an ultra-fast event streaming engine built in modern Rust with WebAssembly plugins, delivering real-time metric ingestion at 1.8M events/sec with vectorized ClickHouse storage.

#### The Problem
Modern distributed systems emit millions of telemetry points per second. Traditional solutions (such as standard Prometheus instances or heavyweight Java/JVM pipelines) frequently suffer from JVM garbage collection pauses, huge memory footprints (10GB+), and high ingestion latency (>50ms).

#### The KRONOS Solution
KRONOS eliminates GC latency by leveraging a zero-copy lock-free ring-buffer written in Rust with explicit memory control. It compiles dynamic customer aggregation rules directly to isolated WebAssembly bytecodes, evaluating filters in sub-microsecond timeframes without risking host memory corruption.`,
          },
          {
            section: "architecture",
            markdown: `### System Architecture
The system employs a multi-tiered pipeline designed for concurrent CPU utilization and cache-locality.

\`\`\`mermaid
flowchart TD
    Client["Clients / OTLP Agents"] -->|gRPC / HTTP2| Gateway["Tokio Inbound Gateway"]
    Gateway -->|Lock-Free RingBuffer| Ring["Atomic Ring Buffer"]
    Ring --> WorkerPool["Vectorized SIMD Workers"]
    WorkerPool -->|Sandboxed Exec| Wasm["Wasmtime Filter Engine"]
    Wasm -->|Batched Arrow Tuples| ClickhouseSink["ClickHouse Columnar Sink"]
    ClickhouseSink -->|NVMe Direct IO| Storage[("ClickHouse Cluster")]
    WorkerPool -->|Threshold Spikes| SSE["SSE Real-time Alert Broadcaster"]
\`\`\`

#### Component Roles
1. **Tokio Inbound Gateway:** Asynchronously accepts TCP/gRPC connections, parses protocol buffers using \`prost\`, and delegates raw byte slices without heap allocation.
2. **Lock-Free Ring Buffer:** Backed by \`crossbeam::queue::ArrayQueue\`, maintaining a deterministic ring that avoids thread contention.
3. **Wasmtime Filter Engine:** Sandboxes user-defined aggregate and alert logic with fuel consumption limits to guarantee deterministic execution.
4. **Vectorized ClickHouse Sink:** Collects micro-batches (50,000 records or 100ms) into Apache Arrow memory tables for maximum compression and bulk ingestion.`,
          },
          {
            section: "data_flow",
            markdown: `### Data Flow & Request Lifecycle

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant Agent as OTLP Collector
    participant GW as Tokio Gateway
    participant RB as Ring Buffer
    participant Filter as Wasm Engine
    participant DB as ClickHouse
    Agent->>GW: POST /v1/metrics (Protobuf stream)
    GW->>RB: Enqueue Zero-Copy Packet
    GW-->>Agent: 202 Accepted (ACK in 80µs)
    Note over RB,Filter: Worker batch pops 10,000 records
    RB->>Filter: Evaluate filter bytecode
    Filter-->>RB: Validated & Normalized Tuples
    RB->>DB: Bulk Vector Flush (Arrow Columnar)
    DB-->>RB: Commit 10,000 records
\`\`\``,
          },
          {
            section: "walkthrough",
            markdown: `### Deep Module Walkthrough

#### 1. \`src/main.rs\` — Supervisor & Lifecycle
Initializes the Tokio runtime, sets up signal handlers for zero-data-loss graceful shutdowns, and links the worker pipeline to the storage sink.

#### 2. \`src/ring_buffer.rs\` — Lock-Free Buffer
Constructs the low-latency conduit between the network listener threads and processing worker threads. Uses memory barriers instead of mutexes, ensuring thread switching latency remains below 100 nanoseconds.

#### 3. \`src/wasm_filter.rs\` — WebAssembly Sandbox
Integrates Bytecode Alliance's \`wasmtime\` engine. Compiles custom filtering logic on-the-fly and executes within a restricted memory cage, guaranteeing that third-party metric transformations cannot execute illegal memory reads or infinite loops.`,
          },
          {
            section: "trade_offs",
            markdown: `### Design Decisions & Trade-Offs

- **Rust vs. Go:** Go's runtime GC introduced unpredictable 15-25ms jitter spikes during heavy ingestion bursts. Rust provided deterministic execution with zero pauses.
- **ClickHouse vs. TimescaleDB:** ClickHouse columnar compression delivered a 9.2x reduction in disk usage compared to PostgreSQL hyper-tables for this specific telemetry schema.
- **Lock-Free Queue vs. Channel:** Crossbeam's array queue delivered a 4.1x throughput increase over standard multi-producer channels due to cacheline-friendly sequential memory layout.
- **[Inferred Limitation]:** Distributed coordination relies on local ring buffer instances; cross-node consensus requires an external cluster orchestrator or Redpanda partition keying.`,
          },
          {
            section: "reverse_narrative",
            markdown: `### Reverse-Engineered Reconstruction Guide
If you were to recreate KRONOS from scratch:
1. **Network Layer:** Use Tokio with \`tonic\` for high-throughput gRPC. Configure TCP buffer sizes to 4MB to prevent TCP window throttling under burst loads.
2. **Buffer Strategy:** Pre-allocate a contiguous memory block of 1,000,000 slots. Avoid any dynamically-sized heap allocations inside the packet loop.
3. **Execution Sandbox:** Embed \`wasmtime\` with fuel-metering enabled. Set a max fuel ceiling of 10,000 cycles per metric packet.
4. **Storage Batching:** Do not insert row-by-row. Batch metrics into Apache Arrow record batches and send them over ClickHouse's native TCP protocol using \`clickhouse-rs\`.`,
          },
        ],
      },
    },
  });

  console.log("🚀 Seeding Project 2: NEURA-FLOW...");
  const neura = await db.project.create({
    data: {
      slug: "neura-flow",
      title: "NEURA-FLOW Studio",
      tagline: "Infinite-canvas visual orchestrator for multimodal AI agents, RAG graphs, and LLM tool chains.",
      description: "NEURA-FLOW is a studio application combining an infinite WebGL canvas with streaming agent execution trees, hot-swappable model nodes (OpenAI, Anthropic, Gemini, Local GGUF), and instant Python/TypeScript export.",
      liveUrl: "https://neura-flow.ai",
      repoUrl: "https://github.com/chirag/neura-flow",
      hostingNotes: "Frontend hosted on Vercel Edge Network. Agent worker orchestration running on AWS ECS Fargate with Redis Cluster state cache and pgvector memory store on Supabase.",
      status: "Live",
      visibility: "public",
      featured: true,
      tags: JSON.stringify(["Next.js", "TypeScript", "WebGL", "PyTorch", "LangChain", "TailwindCSS", "Zustand"]),
      accentColor: "#9D4EDD",
      lastSyncedSha: "3f82a901048b6c4e112d890045e12f6719ab4219",
      orderIndex: 1,
      createdAt: new Date("2025-10-01T14:00:00Z"),
      updatedAt: new Date("2026-03-01T11:45:00Z"),
      assets: {
        create: [
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
            viewport: "desktop",
          },
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
            viewport: "tablet",
          },
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=500&q=80",
            viewport: "mobile",
          },
          {
            type: "cover",
            path: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
          },
        ],
      },
      specCard: {
        create: {
          fields: JSON.stringify({
            projectName: "NEURA-FLOW Studio",
            version: "v1.8.2",
            status: "Live",
            license: "MIT",
            type: "Web Application / Developer Studio",
            category: "Multimodal AI Orchestration",
            intendedUse: "Visual drag-and-drop orchestration of multi-agent cognitive architectures with live human-in-the-loop debugging.",
            targetUsers: "AI Engineers, Full-Stack Developers, Product Prototypers",
            architectureSummary: "Client-side React-Flow/WebGL graph engine communicating with Python FastAPI streaming worker via SSE and WebSockets.",
            languages: ["TypeScript (72%)", "Python (22%)", "GLSL / Shader (6%)"],
            frameworks: ["Next.js 15", "React Flow", "TailwindCSS", "FastAPI", "Zustand"],
            keyDependencies: ["@xyflow/react", "three", "framer-motion", "lucide-react", "langchain", "pydantic"],
            hosting: {
              platform: "Vercel + AWS Fargate",
              domain: "neura-flow.ai",
              repoLocation: "github.com/chirag/neura-flow",
              deployBranch: "main",
              storage: "AWS S3 (Canvas artifact snapshots)",
              database: "Supabase PostgreSQL with pgvector",
              cdn: "Vercel Global Edge Network",
            },
            apisAndModels: [
              {
                name: "Multi-Model Gateway",
                provider: "OpenAI, Anthropic, Gemini, Local Ollama",
                purpose: "Plug-and-play LLM execution at each graph node",
              },
              {
                name: "Vector Retrieval Engine",
                provider: "pgvector on Supabase",
                purpose: "Contextual RAG semantic document querying",
              },
            ],
            inputsAndOutputs: {
              inputs: ["Canvas Node JSON", "Multimodal Prompts (Text/Image/Audio)", "Document PDFs for Embedding"],
              outputs: ["Live Agent Streaming Output", "Compiled Python Agent Script", "Executable JSON Workflow"],
            },
            requirements: {
              runtime: "Node.js 20+, Python 3.11+",
              hardwareNotes: "Client requires modern browser with WebGL 2.0; server requires 2 vCPU + 4GB RAM minimum.",
            },
            limitations: [
              "Very large graphs (>500 active connected nodes) may experience frame drops on lower-end integrated GPUs.",
            ],
            knownIssues: [
              "Safari WebGL context reset occurs occasionally when switching between heavy browser tabs.",
            ],
            ethicalNotes: "Built-in prompt injection guardrails and token budget caps on all agent sub-tasks.",
            links: {
              liveSite: "https://neura-flow.ai",
              repo: "https://github.com/chirag/neura-flow",
              docs: "https://neura-flow.ai/docs",
              demoVideo: "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
            },
            citation: "Chirag (2025). NEURA-FLOW: Visual Multimodal AI Orchestration Studio. GitHub repository.",
            lastVerified: "2026-03-01T11:45:00Z",
            dates: {
              created: "2025-10-01",
              firstCommit: "2025-10-01T14:10:05Z",
              lastCommit: "2026-03-01T11:40:20Z",
              lastDeployed: "2026-03-01T11:45:00Z",
            },
          }),
        },
      },
      repoSnapshot: {
        create: {
          languages: JSON.stringify({ TypeScript: 72.1, Python: 21.8, GLSL: 6.1 }),
          commits: JSON.stringify([
            {
              sha: "3f82a901048b6c4e112d890045e12f6719ab4219",
              shortSha: "3f82a90",
              message: "feat(canvas): add real-time token heatmaps across multi-agent branches",
              author: "Chirag",
              date: "2026-03-01T11:40:20Z",
              url: "https://github.com/chirag/neura-flow/commit/3f82a90",
            },
            {
              sha: "88cc45110aef781299bb3310022ffaa110998877",
              shortSha: "88cc451",
              message: "perf(shaders): optimize particle edge animations via instanced geometry",
              author: "Chirag",
              date: "2026-02-24T18:10:00Z",
              url: "https://github.com/chirag/neura-flow/commit/88cc451",
            },
          ]),
          releases: JSON.stringify([
            {
              tagName: "v1.8.2",
              name: "v1.8.2: Agent Token Heatmaps & Faster Canvas",
              publishedAt: "2026-03-01T11:45:00Z",
              body: "Introduced real-time token heatmaps and instanced WebGL shaders.",
              url: "https://github.com/chirag/neura-flow/releases/tag/v1.8.2",
            },
          ]),
          tree: JSON.stringify([
            {
              path: "package.json",
              type: "blob",
              size: 1100,
              content: `{
  "name": "neura-flow-studio",
  "version": "1.8.2",
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "@xyflow/react": "^12.3.0",
    "three": "^0.170.0",
    "zustand": "^5.0.1",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.469.0"
  }
}`,
            },
            {
              path: "src/canvas/GraphCanvas.tsx",
              type: "blob",
              size: 2400,
              content: `import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { useGraphStore } from '@/store/graphStore';
import { AgentNode } from './nodes/AgentNode';
import { PromptNode } from './nodes/PromptNode';

const nodeTypes = { agent: AgentNode, prompt: PromptNode };

export function GraphCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphStore();

  return (
    <div className="w-full h-screen bg-[#07070a] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#1c1c2b" gap={24} size={1.5} />
        <Controls className="bg-[#12121c] border border-[#2d2d42] text-white" />
        <MiniMap className="bg-[#0e0e16] border border-[#1f1f2e]" />
      </ReactFlow>
    </div>
  );
}`,
            },
            {
              path: "README.md",
              type: "blob",
              size: 1200,
              content: `# NEURA-FLOW Studio
Visual Orchestrator for Multimodal AI Agents. Drag, connect, and stream LLM pipelines on an infinite canvas.`,
            },
          ]),
          manifests: JSON.stringify({
            packageJson: { name: "neura-flow-studio", version: "1.8.2" },
            readme: "# NEURA-FLOW Studio",
          }),
        },
      },
      docs: {
        create: [
          {
            section: "overview",
            markdown: `### Executive Overview
**NEURA-FLOW** empowers developers to map, test, and debug multi-agent AI topologies visually. Instead of managing chaotic Python script spaghetti, users drag modular agent nodes onto an infinite canvas and watch streaming thinking chains execute live.`,
          },
          {
            section: "architecture",
            markdown: `### System Architecture

\`\`\`mermaid
graph TD
    User["Developer UI (Browser)"] -->|Pan / Zoom / Edit| Canvas["React Flow + Three.js Canvas"]
    Canvas -->|State Mutations| Zustand["Zustand Reactive Graph Store"]
    Zustand -->|SSE Execution Stream| FastAPI["FastAPI Orchestrator"]
    FastAPI -->|Vector Queries| Supabase[("Supabase pgvector")]
    FastAPI -->|Model Invocations| Providers["OpenAI / Claude / Gemini APIs"]
    FastAPI -->|Tool Calling| Sandbox["Isolated Docker Sandbox"]
\`\`\`

#### Key Pillars
- **Reactive Zustand Store:** Keeps UI 60fps responsive without costly React tree rerenders.
- **FastAPI Async Pipeline:** Handles multi-branch LLM execution trees concurrently using Python asyncio.`,
          },
          {
            section: "data_flow",
            markdown: `### Data Flow & Execution Lifecycle

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Canvas as Canvas UI
    participant Backend as FastAPI Engine
    participant LLM as Frontier Model
    Dev->>Canvas: Click 'Run Pipeline'
    Canvas->>Backend: POST /api/run (Topology DAG JSON)
    Backend->>Backend: Topologically sort nodes into stages
    loop Parallel Stage Execution
        Backend->>LLM: Stream prompt with dependencies
        LLM-->>Backend: Token chunks (SSE)
        Backend-->>Canvas: Yield node status & output
        Canvas-->>Dev: Animate glowing edge & stream text
    end
\`\`\``,
          },
          {
            section: "walkthrough",
            markdown: `### Deep Module Walkthrough
- \`src/canvas/GraphCanvas.tsx\`: Renders the high-performance graph view with custom glowing edge shaders and custom node renderers.
- \`src/store/graphStore.ts\`: Manages graph state, undo/redo stacks, and execution snapshot serialization.`,
          },
          {
            section: "trade_offs",
            markdown: `### Design Decisions & Trade-Offs
- **React Flow vs Plain HTML5 Canvas:** React Flow provided superior accessibility, keyboard selection, and customizable React node subtrees, while offloading particle visuals to WebGL overlays.
- **pgvector vs Pinecone:** Hosted Supabase pgvector consolidated auth, relational metadata, and vector embeddings into a single managed database.`,
          },
          {
            section: "reverse_narrative",
            markdown: `### Reverse-Engineered Reconstruction Guide
1. Scaffold Next.js 15 with React Flow and Tailwind.
2. Build custom nodes with input/output handles matching JSON schema data types.
3. Establish an SSE stream endpoint that yields step-by-step token emissions linked by nodeId.`,
          },
        ],
      },
    },
  });

  console.log("🚀 Seeding Project 3: CYBER-VAULT...");
  const cyber = await db.project.create({
    data: {
      slug: "cyber-vault",
      title: "CYBER-VAULT Sovereign Identity",
      tagline: "Zero-knowledge end-to-end encrypted secret orchestrator and sovereign identity key vault.",
      description: "CYBER-VAULT provides zero-trust secrets management, decentralized identity (DID) signing, and ephemeral session leasing with client-side WebCrypto AES-256-GCM and Go microservices.",
      liveUrl: "https://cybervault.security",
      repoUrl: "https://github.com/chirag/cyber-vault",
      hostingNotes: "Deployed in hardened Fly.io regions (IAD, FRA, SIN) with distributed LiteFS SQLite replication, HSM-backed root keys, and Cloudflare Zero Trust tunnel protection.",
      status: "Live",
      visibility: "public",
      featured: true,
      tags: JSON.stringify(["Go", "SvelteKit", "WebCrypto", "Zero-Knowledge", "Security", "Cryptography", "LiteFS"]),
      accentColor: "#10B981",
      lastSyncedSha: "5c901e88a31024bd889900ee1244ab9812401822",
      orderIndex: 2,
      createdAt: new Date("2025-11-20T08:30:00Z"),
      updatedAt: new Date("2026-02-28T19:00:00Z"),
      assets: {
        create: [
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80",
            viewport: "desktop",
          },
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
            viewport: "tablet",
          },
          {
            type: "screenshot",
            path: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            viewport: "mobile",
          },
          {
            type: "cover",
            path: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80",
          },
        ],
      },
      specCard: {
        create: {
          fields: JSON.stringify({
            projectName: "CYBER-VAULT Sovereign Identity",
            version: "v3.1.0",
            status: "Live",
            license: "AGPL-3.0",
            type: "Cryptographic Security Portal",
            category: "Identity & Secrets Management",
            intendedUse: "Client-side encrypted secret sharing, sovereign key generation, and automated ephemeral token rotations.",
            targetUsers: "Security Teams, DevOps Engineers, Sovereign Developers",
            architectureSummary: "Zero-knowledge browser WebCrypto module encrypting secrets prior to network transmission, backed by Go Gin microservice cluster and LiteFS.",
            languages: ["Go (68%)", "TypeScript/Svelte (28%)", "Shell (4%)"],
            frameworks: ["Gin-Gonic", "SvelteKit", "WebCrypto API", "TailwindCSS"],
            keyDependencies: ["golang.org/x/crypto", "litefs", "tweetnacl-js", "argon2"],
            hosting: {
              platform: "Fly.io Hardened Firecracker VMs",
              domain: "cybervault.security",
              repoLocation: "github.com/chirag/cyber-vault",
              deployBranch: "main",
              storage: "LiteFS Distributed Encrypted Volumes",
              database: "SQLite replicated across FRA, IAD, and SIN",
              cdn: "Cloudflare Zero Trust / Enterprise Edge",
            },
            apisAndModels: [
              {
                name: "Vault Enclave Gateway",
                provider: "Internal Go Gin Cluster",
                purpose: "Encrypted blob distribution and zero-knowledge proof verification",
              },
            ],
            inputsAndOutputs: {
              inputs: ["Client-encrypted Ciphertext Blobs", "ECDSA P-256 Public Keys", "Argon2id Key Derivation Salt"],
              outputs: ["Encrypted Secret Payloads", "Time-based Ephemeral Lease Tokens", "Audit Verification Proofs"],
            },
            requirements: {
              runtime: "Modern browser supporting WebCrypto API (SubtleCrypto)",
              hardwareNotes: "Server runs on lightweight 512MB RAM Firecracker microVMs.",
            },
            limitations: [
              "Master recovery phrases cannot be recovered if lost by design (Zero Knowledge principle).",
            ],
            knownIssues: [
              "Offline sync requires manual reconciliation if edits occur simultaneously on multiple non-connected devices.",
            ],
            ethicalNotes: "Full open-source audited cryptographic primitives; zero telemetry or IP tracking on secret decryptions.",
            links: {
              liveSite: "https://cybervault.security",
              repo: "https://github.com/chirag/cyber-vault",
              docs: "https://cybervault.security/whitepaper",
              demoVideo: "https://assets.mixkit.co/videos/preview/mixkit-cyber-security-system-in-a-computer-screen-40766-large.mp4",
            },
            citation: "Chirag (2025). CYBER-VAULT: Zero-Knowledge Sovereign Identity and Secrets Portal. GitHub repository.",
            lastVerified: "2026-02-28T19:00:00Z",
            dates: {
              created: "2025-11-20",
              firstCommit: "2025-11-20T08:35:10Z",
              lastCommit: "2026-02-28T18:55:00Z",
              lastDeployed: "2026-02-28T19:00:00Z",
            },
          }),
        },
      },
      repoSnapshot: {
        create: {
          languages: JSON.stringify({ Go: 68.4, TypeScript: 27.8, Shell: 3.8 }),
          commits: JSON.stringify([
            {
              sha: "5c901e88a31024bd889900ee1244ab9812401822",
              shortSha: "5c901e8",
              message: "sec(crypto): enforce Argon2id 64MB memory cost for passphrase stretching",
              author: "Chirag",
              date: "2026-02-28T18:55:00Z",
              url: "https://github.com/chirag/cyber-vault/commit/5c901e8",
            },
            {
              sha: "71ad2900bb112345678901234567890123456789",
              shortSha: "71ad290",
              message: "feat(lease): add automated 15-minute expiring secret share URLs",
              author: "Chirag",
              date: "2026-02-14T10:12:00Z",
              url: "https://github.com/chirag/cyber-vault/commit/71ad290",
            },
          ]),
          releases: JSON.stringify([
            {
              tagName: "v3.1.0",
              name: "v3.1.0: Argon2id Hardening & Ephemeral Leasing",
              publishedAt: "2026-02-28T19:00:00Z",
              body: "Strengthened key stretching and introduced disposable 15-minute zero-knowledge share links.",
              url: "https://github.com/chirag/cyber-vault/releases/tag/v3.1.0",
            },
          ]),
          tree: JSON.stringify([
            {
              path: "go.mod",
              type: "blob",
              size: 420,
              content: `module github.com/chirag/cyber-vault

go 1.22.0

require (
	github.com/gin-gonic/gin v1.9.1
	golang.org/x/crypto v0.21.0
	github.com/mattn/go-sqlite3 v1.14.22
)`,
            },
            {
              path: "cmd/vault/main.go",
              type: "blob",
              size: 1540,
              content: `package main

import (
	"log"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(gin.Recovery())

	api := router.Group("/v1")
	{
		api.POST("/blob", storeEncryptedBlob)
		api.GET("/blob/:id", retrieveEncryptedBlob)
		api.POST("/lease/ephemeral", createEphemeralLease)
	}

	log.Println("CYBER-VAULT Enclave listening on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func storeEncryptedBlob(c *gin.Context) {
	// Server only stores ciphertext; never possesses decryption keys
	c.JSON(200, gin.H{"status": "stored_encrypted"})
}

func retrieveEncryptedBlob(c *gin.Context) {
	c.JSON(200, gin.H{"ciphertext": "e2e_encrypted_payload"})
}

func createEphemeralLease(c *gin.Context) {
	c.JSON(201, gin.H{"lease_id": "lease_89123", "ttl_seconds": 900})
}`,
            },
            {
              path: "README.md",
              type: "blob",
              size: 1100,
              content: `# CYBER-VAULT
Zero-Knowledge Sovereign Identity & Ephemeral Secret Manager.
The server never sees your plaintext secrets. Decryption happens strictly in the client runtime.`,
            },
          ]),
          manifests: JSON.stringify({
            goMod: "module github.com/chirag/cyber-vault\n\ngo 1.22.0",
            readme: "# CYBER-VAULT",
          }),
        },
      },
      docs: {
        create: [
          {
            section: "overview",
            markdown: `### Executive Overview
**CYBER-VAULT** is a zero-knowledge secret management and decentralized identity platform. By executing all cryptographic operations client-side via the WebCrypto API, the server operates strictly as an untrusted blind storage relay.`,
          },
          {
            section: "architecture",
            markdown: `### System Architecture

\`\`\`mermaid
flowchart LR
    Client["Client Browser (WebCrypto)"] -->|1. AES-256-GCM Encrypted Blob| Relay["Go Enclave Relay"]
    Relay -->|2. Replicate Blob Only| LiteFS[("LiteFS Distributed SQLite")]
    Client -->|3. Derives Key Locally| Argon2["Argon2id Key Derivation"]
    Relay -->|4. Ephemeral TTL Expired| Purge["Automated Tombstone Cleaner"]
\`\`\`

#### Security Guarantees
- Plaintext secrets never leave the user's browser memory.
- In the event of a total database breach, attackers obtain only AES-256-GCM ciphertext encrypted with client-held keys.`,
          },
          {
            section: "data_flow",
            markdown: `### Data Flow & Request Lifecycle

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant User as Alice
    participant Browser as WebCrypto Engine
    participant Server as Go API
    participant Recipient as Bob
    User->>Browser: Enter secret & passphrase
    Browser->>Browser: Argon2id stretch + AES-256-GCM encrypt
    Browser->>Server: POST /v1/blob (Ciphertext + Salt only)
    Server-->>Browser: Returns single-use claim token
    Browser-->>User: Provides secure claim URL with client hash anchor (#key)
    User->>Recipient: Shares link (Hash fragment never reaches server)
    Recipient->>Server: Fetch ciphertext
    Recipient->>Recipient: Local decrypt using key in URL anchor
\`\`\``,
          },
          {
            section: "walkthrough",
            markdown: `### Deep Module Walkthrough
- \`cmd/vault/main.go\`: Ultra-lightweight Go HTTP service enforcing lease expiration and blind ciphertext storage.
- \`src/crypto/subtle.ts\`: WebCrypto abstraction for key stretching and authenticated Galois/Counter Mode encryption.`,
          },
          {
            section: "trade_offs",
            markdown: `### Design Decisions & Trade-Offs
- **Zero-Knowledge Architecture:** Eliminates server liability at the expense of automated password recovery.
- **LiteFS vs Postgres:** SQLite with LiteFS enabled instantaneous global replication to edge nodes with a <50MB RAM footprint.`,
          },
          {
            section: "reverse_narrative",
            markdown: `### Reverse-Engineered Reconstruction Guide
1. Implement client-side key derivation with Argon2id and \`crypto.subtle.encrypt({ name: 'AES-GCM' }, ...)\`.
2. Anchor the secret decryption key inside the URL hash fragment (\`#...\`), which browsers guarantee is never transmitted to the HTTP server.
3. Schedule an automated TTL purge cron in the Go server to remove records upon expiry.`,
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded 3 rich showcase projects: ${kronos.title}, ${neura.title}, ${cyber.title}`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
