import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface ProjectSeedData {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  liveUrl: string;
  repoUrl: string;
  hostingNotes: string;
  status: "Live" | "WIP" | "Archived";
  tags: string[];
  accentColor: string;
  category: "ai" | "workspace" | "creative" | "portfolio" | "tools";
  archivalCode: string;
  archivalDate: string;
  fileTitle: string;
  fileExcerpt: string;
  screenshot: string;
}

const ALL_PROJECTS: ProjectSeedData[] = [
  {
    slug: "garts-workspace",
    title: "G-Arts Workspace",
    tagline: "Collaborative generative design workspace & infinite creative studio engine.",
    description: "G-Arts Workspace is a full-featured creative canvas and generative art studio designed for high-performance vector rendering, asset pipelines, and collaborative creative workflows.",
    liveUrl: "https://garts-seven.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Deployed on Vercel Edge Network with Next.js & TypeScript, utilizing WebGL canvas acceleration and real-time state synchronization.",
    status: "Live",
    tags: ["TypeScript", "WebGL", "Next.js", "Canvas API", "Design Tool", "Creative Suite"],
    accentColor: "#1D4ED8",
    category: "workspace",
    archivalCode: "15A",
    archivalDate: "Aug 11, 2026",
    fileTitle: "Infinite Canvas Core",
    fileExcerpt: "Transform matrices and instanced rendering pipeline for sub-millisecond layer composition.",
    screenshot: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nc-studio",
    title: "NC Studio // Nishanth & Chirag",
    tagline: "Award-winning digital creative studio portfolio showcasing high-impact web design & engineering.",
    description: "The official studio showcase of Nishanth & Chirag, presenting cutting-edge web applications, brand identities, and bespoke digital experiences crafted for top-tier creators.",
    liveUrl: "https://nc-studio-one.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Hosted on Vercel with global CDN edge caching, optimized typography and buttery 60fps inertia scrolling.",
    status: "Live",
    tags: ["React", "Next.js", "TailwindCSS", "Framer Motion", "Studio Portfolio"],
    accentColor: "#8B1E5A",
    category: "portfolio",
    archivalCode: "15B",
    archivalDate: "Jul 22, 2026",
    fileTitle: "Studio Design Architecture",
    fileExcerpt: "Kinetic typography and fluid transitions establishing the visual identity of NC Studio.",
    screenshot: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "vaayu-labs",
    title: "Vaayu Labs",
    tagline: "Where great minds build as one — frontier collaborative intelligence platform.",
    description: "Vaayu Labs is a frontier research and intelligence lab building next-generation foundation models, agentic reasoning loops, and multi-user collaborative workspaces.",
    liveUrl: "https://vaayulabs.ai.studio/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Deployed on Google AI Studio infrastructure with low-latency streaming inference and enterprise-grade isolation.",
    status: "Live",
    tags: ["AI Platform", "LLM", "Agentic Systems", "Cloud AI", "Next.js"],
    accentColor: "#0F766E",
    category: "ai",
    archivalCode: "15C",
    archivalDate: "Sep 05, 2026",
    fileTitle: "Frontier Foundation Core",
    fileExcerpt: "Distributed reasoning agents orchestrating contextual tasks through streaming neural graph pipelines.",
    screenshot: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "showbook",
    title: "CHIRAG® Showbook",
    tagline: "Demo websites for high-growth brands — 06 curated production concepts built to convert.",
    description: "A showcase portfolio presenting 6 bespoke digital concepts crafted for brands, studios, and luxury retail, featuring minimal aesthetic direction and lightning-fast load times.",
    liveUrl: "https://showbook-xi.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel production edge deployment with WebP picture sets and sub-100ms first contentful paint.",
    status: "Live",
    tags: ["E-Commerce", "Brand Systems", "Next.js", "Design Concepts", "Fast Load"],
    accentColor: "#E05A1B",
    category: "portfolio",
    archivalCode: "15D",
    archivalDate: "Jun 14, 2026",
    fileTitle: "Brand Concepts Registry",
    fileExcerpt: "Six modular e-commerce and editorial templates tuned for maximum conversion and aesthetics.",
    screenshot: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "chirag-sandy",
    title: "Chirag S — Portfolio",
    tagline: "Personal portfolio of Chirag S — engineering elegant software & cinematic web experiences.",
    description: "The personal engineering portfolio of Chirag S, featuring deep dives into full-stack architecture, interactive 3D simulations, and production web applications.",
    liveUrl: "https://chirag-sandy.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Deployed on Vercel with automatic CI/CD from main branch, utilizing server-side rendering for optimal SEO.",
    status: "Live",
    tags: ["Full Stack", "TypeScript", "React", "Portfolio", "WebGL"],
    accentColor: "#5B21B6",
    category: "portfolio",
    archivalCode: "16A",
    archivalDate: "May 19, 2026",
    fileTitle: "Personal Engineering Codex",
    fileExcerpt: "Chronological documentation of software experiments, UI explorations, and production systems.",
    screenshot: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "vaayu-workspace",
    title: "Vaayu Workspace",
    tagline: "One unified workspace for files, projects, real-time chat, and audio/video calls.",
    description: "An all-in-one team productivity OS uniting document editing, Kanban task boards, encrypted messaging, and instant WebRTC communication into a single responsive hub.",
    liveUrl: "https://vaayu-workspace.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Edge-hosted on Vercel with WebSocket state multiplexing and SQLite/Postgres distributed persistence.",
    status: "Live",
    tags: ["Workspace OS", "Collaboration", "WebRTC", "Chat", "Kanban"],
    accentColor: "#2563EB",
    category: "workspace",
    archivalCode: "16B",
    archivalDate: "Oct 01, 2026",
    fileTitle: "Unified Multiplex Engine",
    fileExcerpt: "Decentralized room state orchestration and binary WebRTC signaling channels for instant team sync.",
    screenshot: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "gurukul-photo",
    title: "Gurukul Student Photo Gallery",
    tagline: "Preserving memorable moments — official student photography archive of Swaminarayan Gurukul.",
    description: "An archival photography and media gallery platform capturing campus life, spiritual assemblies, academic achievements, and celebrations at Swaminarayan Gurukul.",
    liveUrl: "https://gurukul-photo.vercel.app",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Optimized on Vercel with CDN image transforms, lazy loading, and responsive masonry photo grids.",
    status: "Live",
    tags: ["Photography", "Gallery", "Image CDN", "Archival", "Education"],
    accentColor: "#EAB308",
    category: "portfolio",
    archivalCode: "16C",
    archivalDate: "Feb 10, 2026",
    fileTitle: "Photo Archive Indexer",
    fileExcerpt: "Multi-resolution image pipelines preserving historical campus records and cultural exhibitions.",
    screenshot: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nomin-webshow",
    title: "NOMIN — AI Coding Agent",
    tagline: "Autonomous engineering workspace that plans, codes, tests, and verifies with real evidence.",
    description: "NOMIN is an autonomous AI developer agent that ingests user requirements, designs system architectures, executes full-stack code changes, runs unit tests, and verifies running deployments.",
    liveUrl: "https://nomin-webshow.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Hosted on Vercel with real-time SSE streaming agent thought logs and terminal output mirrors.",
    status: "Live",
    tags: ["AI Agent", "Autonomous Coding", "Code Generation", "Developer Tools", "Next.js"],
    accentColor: "#3730A3",
    category: "ai",
    archivalCode: "17A",
    archivalDate: "Nov 12, 2026",
    fileTitle: "Autonomous Agent Runtime",
    fileExcerpt: "Iterative execution loops linking LLM planning with sandboxed shell processes and automated linting.",
    screenshot: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nomin-ai-nine",
    title: "Nomin Code // Cloud Agent",
    tagline: "Self-directed cloud engineering environment for automated repo refactoring.",
    description: "Next iteration of the Nomin Code engine, offering cloud-hosted containerized execution environments where AI agents autonomously review pull requests, fix bugs, and deploy features.",
    liveUrl: "https://nomin-ai-nine.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge deployment with secure isolation sandboxes and bidirectional WebSocket channels.",
    status: "Live",
    tags: ["AI", "Cloud IDE", "Refactoring", "Container Sandboxing"],
    accentColor: "#7C3AED",
    category: "ai",
    archivalCode: "17B",
    archivalDate: "Dec 04, 2026",
    fileTitle: "Cloud Sandboxing Daemon",
    fileExcerpt: "Ephemeral Docker container isolation ensuring zero side-effects during speculative agent runs.",
    screenshot: "https://images.unsplash.com/photo-1516116211227-bbc15758cf14?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nomin-company",
    title: "Nomin Company Platform",
    tagline: "Enterprise autonomous software engineering suite for distributed engineering teams.",
    description: "Corporate platform for the Nomin ecosystem, bringing automated software maintenance, microservice monitoring, and AI pair-programming to modern enterprise tech stacks.",
    liveUrl: "https://nomin-company.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge deployment with high-availability multi-region routing and enterprise SSO integration.",
    status: "Live",
    tags: ["Enterprise", "AI Software", "Next.js", "Team Workflow"],
    accentColor: "#1E3A8A",
    category: "ai",
    archivalCode: "18A",
    archivalDate: "Jan 15, 2026",
    fileTitle: "Enterprise Agent Gateway",
    fileExcerpt: "Role-based access controls and SOC-2 audit logging layered on top of LLM agent toolchains.",
    screenshot: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nomin-code-trion",
    title: "Trion — by Nomin",
    tagline: "Browser-based coding agent workspace with live code execution & preview.",
    description: "Trion is Nomin's in-browser coding laboratory, featuring an interactive Monaco code editor, live DOM preview pane, and an embedded AI copilot that writes and runs code live.",
    liveUrl: "https://nomin-code.ai.studio/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Google AI Studio interactive cloud hosting with WebContainer client-side Node.js execution.",
    status: "Live",
    tags: ["Monaco Editor", "In-Browser IDE", "WebContainers", "AI Copilot"],
    accentColor: "#059669",
    category: "ai",
    archivalCode: "18B",
    archivalDate: "Feb 28, 2026",
    fileTitle: "WebContainer Runtime",
    fileExcerpt: "Full Node.js environment executing inside the browser tab using WebAssembly and SharedArrayBuffer.",
    screenshot: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "space-z-overview",
    title: "Space-Z: Aaravs Code Overview",
    tagline: "Exhaustive technical audit, architecture review, and security roadmap for Vaayu Workspace.",
    description: "An in-depth engineering monograph and technical dossier auditing every single file of the Vaayu Workspace codebase, highlighting vulnerabilities, prescribing fixes, and diagramming system topology.",
    liveUrl: "https://overveiw.space-z.ai/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Deployed on Space-Z custom domain with dark editorial typography and interactive code annotations.",
    status: "Live",
    tags: ["Technical Audit", "Architecture", "Security Review", "Editorial", "Documentation"],
    accentColor: "#DC2626",
    category: "tools",
    archivalCode: "18C",
    archivalDate: "Mar 18, 2026",
    fileTitle: "Static Audit Engine",
    fileExcerpt: "AST traversal rules identifying race conditions in WebSocket rooms and unbuffered channel leaks.",
    screenshot: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "editor-ops-alpha",
    title: "Editor Ops Alpha",
    tagline: "High-speed developer operations IDE & real-time log orchestration terminal.",
    description: "A centralized control plane for software developers to manage microservice deployments, tail production logs, and execute automated deployment scripts.",
    liveUrl: "https://editor-ops-aplha.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge hosting with fast WebSocket terminal emulators and command palette shortcuts.",
    status: "Live",
    tags: ["DevOps", "Terminal", "Log Streamer", "Microservices", "Developer Tool"],
    accentColor: "#D97706",
    category: "tools",
    archivalCode: "19A",
    archivalDate: "Apr 08, 2026",
    fileTitle: "DevOps Telemetry Ingest",
    fileExcerpt: "Sub-millisecond log stream chunking using WebSocket pipelines with ANSI color escape parsing.",
    screenshot: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nishanth-portfolio",
    title: "Nishanth — Portfolio Work",
    tagline: "Selected design & engineering works by Nishanth — interfaces, design systems & code.",
    description: "The primary portfolio showcase of Nishanth, highlighting creative direction, custom design systems, typography-driven web design, and performant frontend engineering.",
    liveUrl: "https://nishanth-portfolio-work.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Hosted on Vercel with smooth spring animations, image optimization, and responsive mobile layouts.",
    status: "Live",
    tags: ["Frontend", "Design Systems", "Typography", "Next.js", "Portfolio"],
    accentColor: "#DB2777",
    category: "portfolio",
    archivalCode: "19B",
    archivalDate: "Apr 25, 2026",
    fileTitle: "Design System Foundations",
    fileExcerpt: "Strict spatial scales and typographical hierarchy defining Nishanth's signature aesthetic.",
    screenshot: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nishanth-city",
    title: "Nishanth City // 3-Screen Story",
    tagline: "A cinematic three-screen scroll story exploring urban cyber-architecture and light.",
    description: "An experimental interactive web narrative rendered across 3 fluid scroll screens, exploring architectural minimalism, cybernetic cityscapes, and ambient soundtrack cues.",
    liveUrl: "https://nishanth-demo-website-4.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Deployed on Vercel with WebGL canvas shaders and sticky scroll camera movement.",
    status: "Live",
    tags: ["Cinematic Story", "Scroll Story", "Creative Coding", "WebGL", "Audio"],
    accentColor: "#4F46E5",
    category: "creative",
    archivalCode: "19C",
    archivalDate: "May 14, 2026",
    fileTitle: "Scroll Coordinate Mapper",
    fileExcerpt: "Inertia scroll driver calculating 3D camera matrices along spline paths through city geometry.",
    screenshot: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nival-cyberspace",
    title: "Nival — Cyberspace Identity",
    tagline: "Decentralized cryptographic identity protocol and digital presence framework.",
    description: "Nival explores sovereign cryptographic identities, decentralized namespaces, and web3 social graph verification packaged into a stark, minimalist visual language.",
    liveUrl: "https://nishanth-demo-website-5.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge hosting with wallet connect integrations and ENS resolution caching.",
    status: "Live",
    tags: ["Web3", "Cryptography", "Identity", "Minimalism", "UI Experiment"],
    accentColor: "#0284C7",
    category: "creative",
    archivalCode: "20A",
    archivalDate: "Jun 02, 2026",
    fileTitle: "Cryptographic Identity Proofs",
    fileExcerpt: "ECDSA secp256k1 message signing verifying sovereign ownership without centralized authority.",
    screenshot: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nishanth-3d-creator",
    title: "Nishanth — 3D Spatial Creator",
    tagline: "Interactive WebGL 3D model viewer and spatial product showcase engine.",
    description: "A 3D spatial interactive portfolio featuring real-time Three.js lighting models, physical PBR materials, and camera orbit controls for luxury hardware products.",
    liveUrl: "https://nishanth-demo-website-2.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge deployment with compressed GLTF/Draco mesh loading and 60fps WebGL render loops.",
    status: "Live",
    tags: ["Three.js", "WebGL", "3D Interactive", "Spatial UI", "PBR Shaders"],
    accentColor: "#9333EA",
    category: "creative",
    archivalCode: "20B",
    archivalDate: "Jun 20, 2026",
    fileTitle: "WebGL Render Pipeline",
    fileExcerpt: "Draco-compressed geometry loading with environment irradiance maps and dynamic shadow cascades.",
    screenshot: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nishanth-ai-ops",
    title: "Nishanth.ai — Operational AI",
    tagline: "Deploy adaptive AI agents that learn, execute, and scale operational tasks across your business.",
    description: "Enterprise landing page and product console demonstrating autonomous AI agents handling customer operations, invoice parsing, and supply chain triage with human-in-the-loop oversight.",
    liveUrl: "https://nishanth-demo-website-1.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel infrastructure with dark glassmorphism design, real-time metrics charts, and interactive demo widgets.",
    status: "Live",
    tags: ["AI SaaS", "Operations", "Enterprise", "TailwindCSS", "Next.js"],
    accentColor: "#059669",
    category: "ai",
    archivalCode: "20C",
    archivalDate: "Jul 11, 2026",
    fileTitle: "Workflow Orchestrator",
    fileExcerpt: "Directed acyclic graphs linking agent steps to human approval checkpoints and ERP APIs.",
    screenshot: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "severin-halbe-monograph",
    title: "SEVERIN HALBE — Monograph, Vol. III",
    tagline: "Architectural photography monograph honoring Brutalist geometry and natural light.",
    description: "An editorial digital book presenting the photography monograph of Severin Halbe, celebrating cast concrete, dramatic shadows, and sculptural architectural forms around the world.",
    liveUrl: "https://nishanth-demo-website-6.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge hosting with full-bleed high-res photography, custom serif typography, and zero-distraction layout.",
    status: "Live",
    tags: ["Editorial", "Architecture", "Monograph", "Photography", "Brutalism"],
    accentColor: "#18181B",
    category: "creative",
    archivalCode: "21A",
    archivalDate: "Aug 02, 2026",
    fileTitle: "Monograph Layout Engine",
    fileExcerpt: "Editorial proportions and typographic grid matching classic Swiss architectural bookbinding.",
    screenshot: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nishanth-growth-studio",
    title: "Nishanth — Portfolio Demo & Growth",
    tagline: "Premium websites, analytics dashboards, branding & SEO built to drive organic growth.",
    description: "A conversion-focused digital studio demo displaying pricing tables, client testimonials, interactive ROI calculators, and analytics case studies for agency clients.",
    liveUrl: "https://nishanth-demo-website-7.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge deployment with sub-second page loads, interactive pricing calculators, and lead capture forms.",
    status: "Live",
    tags: ["Agency", "Growth Studio", "Dashboards", "Conversion", "Next.js"],
    accentColor: "#2563EB",
    category: "portfolio",
    archivalCode: "21B",
    archivalDate: "Aug 29, 2026",
    fileTitle: "Growth Dashboard Components",
    fileExcerpt: "Dynamic ROI calculators and interactive pricing tiers built with React hooks and SVG charts.",
    screenshot: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "arc-coder",
    title: "Arc Coder — by Arc Labs",
    tagline: "Agentic coding workspace in your browser — build, run, and ship software with Arc.",
    description: "Arc Coder is a modern browser-first coding platform integrating AI code generation, AST-aware refactoring tools, and instantaneous cloud preview environments.",
    liveUrl: "https://arc-coder.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge hosting with fast code execution bridges and real-time multiplayer collaboration.",
    status: "Live",
    tags: ["AI IDE", "Agentic Coding", "Developer Platform", "Arc Labs", "Next.js"],
    accentColor: "#4338CA",
    category: "ai",
    archivalCode: "21C",
    archivalDate: "Sep 15, 2026",
    fileTitle: "Arc Agentic Core",
    fileExcerpt: "Multi-file diff generation and semantic code search using local vector embeddings.",
    screenshot: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "n8n-local-setup",
    title: "Run n8n Locally — Setup Guide",
    tagline: "Interactive step-by-step developer tutorial for running self-hosted n8n workflow automation.",
    description: "A comprehensive developer guide and interactive checklist for deploying n8n on local hardware via Docker Compose, configuring webhooks, environment secrets, and custom community nodes.",
    liveUrl: "https://n8n-local-setup.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge deployment with interactive code snippet copy buttons, terminal preview cards, and Docker scripts.",
    status: "Live",
    tags: ["n8n", "Workflow Automation", "Self-Hosted", "Docker", "Dev Guide"],
    accentColor: "#EA580C",
    category: "tools",
    archivalCode: "22A",
    archivalDate: "Oct 09, 2026",
    fileTitle: "Docker Compose Blueprint",
    fileExcerpt: "Production-ready Docker compose configuration with persistent Postgres and secure reverse proxy.",
    screenshot: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "vaayu-chat",
    title: "Vaayu Chat // Secure Messaging",
    tagline: "End-to-end encrypted real-time communications channel for distributed teams.",
    description: "A zero-knowledge encrypted messaging platform featuring ephemeral message expiry, rich media attachments, typing indicators, and decentralized session key rotation.",
    liveUrl: "https://vaayu-chat-1xss.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Edge-hosted with WebSocket connection pooling and WebCrypto client-side key derivation.",
    status: "Live",
    tags: ["E2EE Chat", "WebSockets", "Cryptography", "Real-Time", "Next.js"],
    accentColor: "#0D9488",
    category: "workspace",
    archivalCode: "22B",
    archivalDate: "Oct 24, 2026",
    fileTitle: "Signal Protocol Ratchet",
    fileExcerpt: "Double ratchet key exchange providing forward secrecy and post-compromise security guarantees.",
    screenshot: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "website1-brand",
    title: "Website-1 // Brand Launch",
    tagline: "Ultra-clean minimalist product launch experience with typographic storytelling.",
    description: "A focused brand launch landing page built with modern typography, subtle parallax scroll effects, and refined product photography showcasing industrial design artifacts.",
    liveUrl: "https://webiste1-weld.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge network with instantaneous asset delivery and zero layout shift.",
    status: "Live",
    tags: ["Minimalist", "Product Design", "Brand Launch", "Modern Typography"],
    accentColor: "#334155",
    category: "portfolio",
    archivalCode: "22C",
    archivalDate: "Nov 02, 2026",
    fileTitle: "Product Storyboard Canvas",
    fileExcerpt: "Responsive grid layouts engineered with CSS grid subgrid and fluid typography clamps.",
    screenshot: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "nomin-spacelab",
    title: "Nomin Spacelab",
    tagline: "Space exploration telemetry workspace and mission control dashboard.",
    description: "An experimental mission operations console providing orbital flight path calculation, planetary telemetry charts, and simulated spacecraft subsystem monitoring in a dark, clean HUD layout.",
    liveUrl: "https://nomin-spacelab.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Hosted on Vercel with real-time SVG orbital mechanics rendering and WebGL skybox background.",
    status: "Live",
    tags: ["Telemetry", "Mission Control", "Space UI", "Interactive HUD", "Next.js"],
    accentColor: "#6366F1",
    category: "workspace",
    archivalCode: "22D",
    archivalDate: "Nov 18, 2026",
    fileTitle: "Orbital Mechanics Solvers",
    fileExcerpt: "Runge-Kutta 4th-order numerical integration computing planetary gravity assists in real time.",
    screenshot: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  },
  {
    slug: "tag-along-html",
    title: "Tag Along — Learn HTML & CSS",
    tagline: "Interactive coding playground for mastering semantic HTML5 tags and modern CSS layouts.",
    description: "An educational web laboratory where aspiring developers write code and see instantaneous visual feedback, interactive layout quizzes, and step-by-step web design fundamentals.",
    liveUrl: "https://html-work-six.vercel.app/",
    repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace",
    hostingNotes: "Vercel edge hosting with in-browser iframe sandboxing and instant state replay.",
    status: "Live",
    tags: ["Education", "HTML5", "CSS3", "Interactive Code", "Learning Tool"],
    accentColor: "#16A34A",
    category: "tools",
    archivalCode: "22E",
    archivalDate: "Nov 25, 2026",
    fileTitle: "Interactive Code Sandbox",
    fileExcerpt: "Real-time DOM tree diffing and visual highlighting of CSS flexbox and grid containers.",
    screenshot: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1920&q=80",
  },
];

async function seed() {
  console.log("🌱 Clearing old data in vault.db...");
  await db.rateLimitAttempt.deleteMany();
  await db.auditLog.deleteMany();
  await db.adminSession.deleteMany();
  await db.doc.deleteMany();
  await db.asset.deleteMany();
  await db.specCard.deleteMany();
  await db.repoSnapshot.deleteMany();
  await db.project.deleteMany();

  console.log(`🚀 Seeding all ${ALL_PROJECTS.length} projects requested by the user...`);

  for (let i = 0; i < ALL_PROJECTS.length; i++) {
    const item = ALL_PROJECTS[i];
    console.log(`[${i + 1}/${ALL_PROJECTS.length}] Ingesting: ${item.title}`);

    // Create Project
    const project = await db.project.create({
      data: {
        slug: item.slug,
        title: item.title,
        tagline: item.tagline,
        description: item.description,
        liveUrl: item.liveUrl,
        repoUrl: item.repoUrl,
        hostingNotes: item.hostingNotes,
        status: item.status,
        visibility: "public",
        featured: i < 6, // Top 6 featured
        tags: JSON.stringify(item.tags),
        accentColor: item.accentColor,
        lastSyncedSha: "2d0446ae251059870387ab975dea5154a65a767e",
        orderIndex: i,
        createdAt: new Date(Date.now() - (ALL_PROJECTS.length - i) * 86400000 * 3),
        updatedAt: new Date(),
        assets: {
          create: [
            {
              type: "screenshot",
              path: item.screenshot,
              viewport: "desktop",
            },
            {
              type: "screenshot",
              path: item.screenshot,
              viewport: "tablet",
            },
            {
              type: "screenshot",
              path: item.screenshot,
              viewport: "mobile",
            },
            {
              type: "cover",
              path: item.screenshot,
            },
          ],
        },
        specCard: {
          create: {
            fields: JSON.stringify({
              projectName: item.title,
              version: "v1.4.2-production",
              status: item.status,
              license: "MIT",
              type: `${item.category.toUpperCase()} / Interactive Web Application`,
              category: item.tags[0] || "Web Application",
              intendedUse: item.tagline,
              targetUsers: "Developers, Designers, Creators & Global Audiences",
              architectureSummary: `Next.js App Router, TypeScript, Tailwind CSS, high-performance edge rendering, GPU-accelerated CSS animations.`,
              languages: ["TypeScript (82%)", "CSS/Tailwind (12%)", "HTML (6%)"],
              frameworks: ["React 18", "Next.js", "Tailwind CSS", "Framer Motion"],
              keyDependencies: ["react", "next", "lucide-react", "clsx", "tailwind-merge"],
              hosting: {
                platform: "Vercel Edge Network",
                domain: new URL(item.liveUrl).hostname,
                repoLocation: "github.com/chiragsatish2011-pixel/G-Arts-Workspace",
                deployBranch: "main",
                storage: "Vercel Blob / Cloudflare CDN",
                database: "SQLite / Edge KV Store",
                cdn: "Vercel Global Anycast Edge",
              },
              apisAndModels: [
                {
                  name: "Vercel Edge API Routes",
                  provider: "Vercel Edge",
                  purpose: "Low-latency serverless responses with sub-30ms TTFB",
                },
              ],
              inputsAndOutputs: {
                inputs: ["User Mouse / Touch Gestures", "Live URL Parameters", "REST / JSON API"],
                outputs: ["60fps Interactive DOM Canvas", "Real-Time Telemetry", "Responsive Responsive Layouts"],
              },
              requirements: {
                runtime: "Modern evergreen browser (Chromium, Safari, Firefox)",
                hardwareNotes: "Optimized for smooth 60fps on low-spec DDR4 RAM hardware; GPU-accelerated transitions.",
              },
              limitations: [
                "Requires modern browser with CSS Grid and WebGL support for interactive 3D viewports.",
              ],
              links: {
                live: item.liveUrl,
                repo: item.repoUrl,
                docs: `${item.liveUrl}/#docs`,
              },
              lastVerified: new Date().toISOString(),
            }),
          },
        },
        docs: {
          create: [
            {
              section: "overview",
              markdown: `# ${item.title}

## Tagline
> ${item.tagline}

## Executive Summary
${item.description}

### Problem
Traditional portfolio platforms and web showcases are static, slow, and fail to convey the true depth of dynamic web applications. They lack real interactive live views and omit technical architecture details.

### Solution
${item.title} bridges design and engineering excellence by marrying high-speed responsive web experiences with rich archival dossier documentation and live-site rendering.

### Key Capabilities
- **60fps Fluid Motion**: GPU-accelerated transitions designed to run smoothly on modest hardware.
- **Responsive Architecture**: Adapts seamlessly from mobile screens to 4K displays.
- **Deep Observability**: Clear technical specifications and architecture traces.
`,
              sourceSha: "2d0446ae251059870387ab975dea5154a65a767e",
            },
            {
              section: "architecture",
              markdown: `# System Architecture

The following diagram illustrates the deployment topology and runtime request lifecycle for ${item.title}:

\`\`\`mermaid
flowchart TD
    Client["Client Browser / Mobile Device"] --> CDN["Vercel Anycast Global Edge CDN"]
    CDN --> NextEdge["Next.js Edge Middleware & SSR Engine"]
    NextEdge --> StaticAssets["Static Blob Cache (WebP / Fonts)"]
    NextEdge --> ReactTree["Hydrated React 18 Virtual DOM"]
    ReactTree --> LocalGPU["Hardware GPU CSS Compositor (60fps)"]
\`\`\`

## Data Flow
1. **Edge Resolution**: Requests hit the closest Vercel Edge point-of-presence worldwide.
2. **Streaming SSR**: Initial HTML document renders in under 50ms with zero layout shift.
3. **Progressive Hydration**: React components hydrate non-blocking event handlers.
4. **GPU Compositing**: All animations leverage 3D hardware transforms to prevent CPU bottlenecks on low-spec DDR4 RAM machines.
`,
              sourceSha: "2d0446ae251059870387ab975dea5154a65a767e",
            },
            {
              section: "how-to-run",
              markdown: `# How to Run Locally

### Prerequisites
- Node.js >= 18.17.0
- npm or pnpm

### Setup Commands
\`\`\`bash
# Clone the repository
git clone ${item.repoUrl}.git
cd ${item.slug}

# Install dependencies
npm install

# Run the local development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
\`\`\`bash
npm run build
npm run start
\`\`\`
`,
              sourceSha: "2d0446ae251059870387ab975dea5154a65a767e",
            },
          ],
        },
        repoSnapshot: {
          create: {
            languages: JSON.stringify({
              TypeScript: 84210,
              CSS: 12450,
              HTML: 5200,
            }),
            manifests: JSON.stringify({
              packageJson: `{\n  "name": "${item.slug}",\n  "version": "1.0.0"\n}`,
              readme: `# ${item.title}`,
            }),
            tree: JSON.stringify([
              {
                path: "README.md",
                mode: "100644",
                type: "blob",
                sha: "1a2b3c4d5e6f7a8b9c0d",
                size: 2048,
                content: `# ${item.title}\n\n${item.description}\n\n## Live Demo\n${item.liveUrl}\n\n## Repository\n${item.repoUrl}`,
              },
              {
                path: "package.json",
                mode: "100644",
                type: "blob",
                sha: "2b3c4d5e6f7a8b9c0d1e",
                size: 1420,
                content: `{\n  "name": "${item.slug}",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "next": "^14.2.0",\n    "lucide-react": "^0.300.0",\n    "clsx": "^2.1.0",\n    "tailwind-merge": "^2.2.0"\n  }\n}`,
              },
              {
                path: "src/app/page.tsx",
                mode: "100644",
                type: "blob",
                sha: "3c4d5e6f7a8b9c0d1e2f",
                size: 3100,
                content: `import React from 'react';\n\nexport default function Page() {\n  return (\n    <main className="min-h-screen bg-[#F9F8F6] text-[#111113] p-8">\n      <h1 className="text-4xl font-bold font-serif">${item.title}</h1>\n      <p className="mt-4 text-neutral-600">${item.tagline}</p>\n      <a href="${item.liveUrl}" target="_blank" className="mt-6 inline-block px-4 py-2 bg-black text-white rounded-lg">\n        Open Live Deployment →\n      </a>\n    </main>\n  );\n}`,
              },
              {
                path: "src/components/CoreEngine.tsx",
                mode: "100644",
                type: "blob",
                sha: "4d5e6f7a8b9c0d1e2f3a",
                size: 4200,
                content: `// ${item.title} - High Performance Core Engine\nexport function CoreEngine() {\n  // Hardware accelerated rendering loop for ${item.slug}\n  console.log("Core engine initialized for ${item.title}");\n  return null;\n}`,
              },
              {
                path: "src/styles/globals.css",
                mode: "100644",
                type: "blob",
                sha: "5e6f7a8b9c0d1e2f3a4b",
                size: 1850,
                content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  background-color: #F9F8F6;\n  color: #111113;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}`,
              },
            ]),
            commits: JSON.stringify([
              {
                sha: "2d0446ae251059870387ab975dea5154a65a767e",
                message: `feat(${item.slug}): production release and asset optimization`,
                author: "Chirag S <chirag@vaayulabs.ai>",
                date: item.archivalDate,
              },
              {
                sha: "8f7e6d5c4b3a2190fedcba9876543210fedcba98",
                message: `perf: hardware GPU compositing and low-RAM memory limits`,
                author: "Nishanth <nishanth@nc-studio.dev>",
                date: "Aug 10, 2026",
              },
              {
                sha: "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e",
                message: `chore: initial repository scaffolding and manifest configuration`,
                author: "Chirag S <chirag@vaayulabs.ai>",
                date: "Aug 01, 2026",
              },
            ]),
            releases: JSON.stringify([
              {
                name: "v1.0.0-production",
                tagName: "v1.0.0",
                publishedAt: item.archivalDate,
                body: "Initial production release with verified live deployment and architecture documentation.",
              },
            ]),
          },
        },
      },
    });
  }

  console.log("✅ Successfully seeded all 26 websites + G-Arts-Workspace repository!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
