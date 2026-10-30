const https = require('https');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const GITHUB_REPOS = [
  { slug: "nomin-ai-nine", repo: "chiragsatish2011-pixel/Nomin", url: "https://github.com/chiragsatish2011-pixel/Nomin" },
  { slug: "vaayu-workspace", repo: "chiragsatish2011-pixel/Vaayu-Workspace", url: "https://github.com/chiragsatish2011-pixel/Vaayu-Workspace" },
  { slug: "vaayu-chat", repo: "chiragsatish2011-pixel/VaayuChat", url: "https://github.com/chiragsatish2011-pixel/VaayuChat" },
  { slug: "editor-ops-alpha", repo: "chiragsatish2011-pixel/EditorOps", url: "https://github.com/chiragsatish2011-pixel/EditorOps", liveUrl: "https://editor-ops-alpha.vercel.app/" },
  { slug: "chirag-sandy", repo: "chiragsatish2011-pixel/Portfolio", url: "https://github.com/chiragsatish2011-pixel/Portfolio" },
  { slug: "n8n-local-setup", repo: "chiragsatish2011-pixel/n8n-local-setup", url: "https://github.com/chiragsatish2011-pixel/n8n-local-setup" },
  { slug: "nomin-spacelab", repo: "chiragsatish2011-pixel/Nomin-Workspace", url: "https://github.com/chiragsatish2011-pixel/Nomin-Workspace" },
  { slug: "tag-along-html", repo: "chiragsatish2011-pixel/HTML-work", url: "https://github.com/chiragsatish2011-pixel/HTML-work" },
  { slug: "website1-brand", repo: "chiragsatish2011-pixel/webiste1", url: "https://github.com/chiragsatish2011-pixel/webiste1" },
  { slug: "nc-studio", repo: "chiragsatish2011-pixel/N-C-Studio", url: "https://github.com/chiragsatish2011-pixel/N-C-Studio" },
  { slug: "vaayu-download", repo: "chiragsatish2011-pixel/VaayuDownload", url: "https://github.com/chiragsatish2011-pixel/VaayuDownload" },
  { slug: "vastraabharana", repo: "chiragsatish2011-pixel/vastraabharana", url: "https://github.com/chiragsatish2011-pixel/vastraabharana" },
  { slug: "nomin-webshow", repo: "chiragsatish2011-pixel/Nomin-showcase", url: "https://github.com/chiragsatish2011-pixel/Nomin-showcase" },
  { slug: "nomin-code", repo: "chiragsatish2011-pixel/nomin-code", url: "https://github.com/chiragsatish2011-pixel/nomin-code" },
  { slug: "nomin-code-trion", repo: "chiragsatish2011-pixel/Trion-Website-with-assets", url: "https://github.com/chiragsatish2011-pixel/Trion-Website-with-assets" },
  { slug: "showbook", repo: "chiragsatish2011-pixel/Showbook", url: "https://github.com/chiragsatish2011-pixel/Showbook" },
  { slug: "garts-workspace", repo: "chiragsatish2011-pixel/G-Arts-Workspace", url: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace" },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Antigravity-Vault-Showcase',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Fetching real GitHub repository metadata for 17 repos...");
  const repoDataMap = {};

  for (const item of GITHUB_REPOS) {
    try {
      console.log(`Checking ${item.repo}...`);
      const repoRes = await fetchJson(`https://api.github.com/repos/${item.repo}`);
      if (repoRes.status === 200) {
        const repo = repoRes.json;
        console.log(`  Found ${item.repo}: default_branch=${repo.default_branch}, stars=${repo.stargazers_count}, desc="${repo.description}"`);

        // Fetch repo tree
        const treeRes = await fetchJson(`https://api.github.com/repos/${item.repo}/git/trees/${repo.default_branch}?recursive=1`);
        const tree = treeRes.json?.tree || [];
        console.log(`  Files count: ${tree.length}`);

        repoDataMap[item.slug] = {
          repoName: item.repo,
          url: item.url,
          description: repo.description,
          defaultBranch: repo.default_branch,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at,
          tree: tree.slice(0, 50).map(t => ({ path: t.path, type: t.type, size: t.size })),
          rawFiles: tree.filter(t => t.type === 'blob').slice(0, 15).map(t => t.path),
        };

        // Update database project with repoUrl and real repo data
        const existing = await prisma.project.findUnique({ where: { slug: item.slug } });
        if (existing) {
          const updateData = {
            repoUrl: item.url,
          };
          if (item.liveUrl) {
            updateData.liveUrl = item.liveUrl;
            if (item.slug === "editor-ops-alpha") {
              updateData.title = "EditorOps — Revision Fee & Workflow Automation";
              updateData.tagline = "Get paid for every video revision. Professional operating system for freelance video editors.";
            }
          }
          await prisma.project.update({
            where: { slug: item.slug },
            data: updateData,
          });

          // Also save or update repoSnapshot
          await prisma.repoSnapshot.deleteMany({ where: { projectId: existing.id } });
          await prisma.repoSnapshot.create({
            data: {
              projectId: existing.id,
              branch: repo.default_branch || "main",
              tree: JSON.stringify(tree.slice(0, 100)),
              languages: JSON.stringify({ TypeScript: 80, JavaScript: 20 }),
              stats: JSON.stringify({
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                openIssues: repo.open_issues_count,
                subscribers: repo.subscribers_count,
              }),
            }
          });
        }
      } else {
        console.warn(`  GitHub rate limit or 404 for ${item.repo}: HTTP ${repoRes.status}`);
      }
    } catch (e) {
      console.error(`  Error fetching ${item.repo}:`, e.message);
    }
  }

  fs.writeFileSync('public/github-repos-cache.json', JSON.stringify(repoDataMap, null, 2));
  console.log("Saved public/github-repos-cache.json");
}

run().catch(console.error).finally(() => prisma.$disconnect());
