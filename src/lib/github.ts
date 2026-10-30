import { GitCommit, GitFileTreeNode, GitRelease, RepoSnapshotData } from "@/types";

export interface GitHubRepoMeta {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  license: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.replace(/\/+$/, "").replace(/\.git$/, "");
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Vault-Showcase-Agent/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchGitHubRepoData(repoUrl: string): Promise<{
  meta: GitHubRepoMeta;
  tree: GitFileTreeNode[];
  languages: Record<string, number>;
  commits: GitCommit[];
  releases: GitRelease[];
  manifests: Record<string, any>;
  readme: string;
}> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
  }

  const { owner, repo } = parsed;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = getHeaders();

  // 1. Fetch Repo Metadata
  const metaRes = await fetch(baseUrl, { headers });
  if (!metaRes.ok) {
    const errorText = await metaRes.text();
    throw new Error(`GitHub API error (${metaRes.status}): ${errorText}`);
  }
  const metaJson = await metaRes.json();

  const meta: GitHubRepoMeta = {
    name: metaJson.name,
    fullName: metaJson.full_name,
    description: metaJson.description,
    stars: metaJson.stargazers_count,
    forks: metaJson.forks_count,
    openIssues: metaJson.open_issues_count,
    defaultBranch: metaJson.default_branch || "main",
    license: metaJson.license?.spdx_id || metaJson.license?.name || "MIT",
    topics: metaJson.topics || [],
    createdAt: metaJson.created_at,
    updatedAt: metaJson.updated_at,
    pushedAt: metaJson.pushed_at,
  };

  // 2. Fetch Languages
  let languages: Record<string, number> = {};
  try {
    const langRes = await fetch(`${baseUrl}/languages`, { headers });
    if (langRes.ok) {
      const rawLangs: Record<string, number> = await langRes.json();
      const totalBytes = Object.values(rawLangs).reduce((acc, b) => acc + b, 0);
      if (totalBytes > 0) {
        for (const [lang, bytes] of Object.entries(rawLangs)) {
          languages[lang] = Number(((bytes / totalBytes) * 100).toFixed(1));
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch languages:", err);
  }

  // 3. Fetch Commits
  let commits: GitCommit[] = [];
  try {
    const commitsRes = await fetch(`${baseUrl}/commits?per_page=20`, { headers });
    if (commitsRes.ok) {
      const commitsJson = await commitsRes.json();
      if (Array.isArray(commitsJson)) {
        commits = commitsJson.map((c: any) => ({
          sha: c.sha,
          shortSha: c.sha.slice(0, 7),
          message: c.commit?.message?.split("\n")[0] || "Update",
          author: c.commit?.author?.name || c.author?.login || "Contributor",
          date: c.commit?.author?.date || meta.pushedAt,
          url: c.html_url,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch commits:", err);
  }

  // 4. Fetch Releases
  let releases: GitRelease[] = [];
  try {
    const releasesRes = await fetch(`${baseUrl}/releases?per_page=10`, { headers });
    if (releasesRes.ok) {
      const relJson = await releasesRes.json();
      if (Array.isArray(relJson)) {
        releases = relJson.map((r: any) => ({
          tagName: r.tag_name,
          name: r.name || r.tag_name,
          publishedAt: r.published_at || meta.updatedAt,
          body: r.body || "Release notes unavailable.",
          url: r.html_url,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch releases:", err);
  }

  // 5. Fetch Full Git Tree
  let tree: GitFileTreeNode[] = [];
  try {
    const treeRes = await fetch(
      `${baseUrl}/git/trees/${meta.defaultBranch}?recursive=1`,
      { headers }
    );
    if (treeRes.ok) {
      const treeJson = await treeRes.json();
      if (Array.isArray(treeJson.tree)) {
        tree = treeJson.tree
          .filter((item: any) => item.type === "blob")
          .map((item: any) => ({
            path: item.path,
            type: "blob" as const,
            size: item.size,
            sha: item.sha,
          }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch recursive tree:", err);
  }

  // 6. Fetch Key Manifests & README
  const manifests: Record<string, any> = {};
  let readme = "";

  const filesToFetch = [
    "README.md",
    "readme.md",
    "package.json",
    "Cargo.toml",
    "go.mod",
    "requirements.txt",
    "pyproject.toml",
    "Dockerfile",
    "docker-compose.yml",
  ];

  for (const fileName of filesToFetch) {
    const matchingNode = tree.find((t) => t.path.toLowerCase() === fileName.toLowerCase());
    if (matchingNode) {
      try {
        const rawRes = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${meta.defaultBranch}/${matchingNode.path}`,
          { headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : undefined }
        );
        if (rawRes.ok) {
          const content = await rawRes.text();
          matchingNode.content = content;
          if (fileName.toLowerCase() === "readme.md") {
            readme = content;
            manifests.readme = content;
          } else if (fileName.toLowerCase() === "package.json") {
            try {
              manifests.packageJson = JSON.parse(content);
            } catch {
              manifests.packageJson = content;
            }
          } else if (fileName.toLowerCase() === "cargo.toml") {
            manifests.cargoToml = content;
          } else if (fileName.toLowerCase() === "dockerfile") {
            manifests.dockerfile = content;
          } else {
            manifests[fileName] = content;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch file content for ${matchingNode.path}:`, err);
      }
    }
  }

  return {
    meta,
    tree,
    languages,
    commits,
    releases,
    manifests,
    readme,
  };
}
