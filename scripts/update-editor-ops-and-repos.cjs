const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log("Updating editor-ops-alpha and all project repoUrls...");

  // 1. Update editor-ops-alpha
  await prisma.project.update({
    where: { slug: "editor-ops-alpha" },
    data: {
      title: "EditorOps — Revision Fee & Workflow Automation",
      tagline: "Get paid for every video revision. Professional review portal and workflow operating system for freelance video editors.",
      liveUrl: "https://editor-ops-alpha.vercel.app/",
      repoUrl: "https://github.com/chiragsatish2011-pixel/EditorOps",
      description: "EditorOps solves the biggest pain point for Indian freelance video editors: endless unpaid revisions and delayed client payments. Features client review link generation, timestamped feedback, automated revision limits, and instant UPI checkout before delivery.\n\nLive production website deployed at https://editor-ops-alpha.vercel.app/\nGitHub repository: https://github.com/chiragsatish2011-pixel/EditorOps",
    }
  });
  console.log("Updated editor-ops-alpha in DB.");

  // 2. Map all GitHub URLs to existing projects
  const repoMapping = [
    { slug: "nomin-ai-nine", repoUrl: "https://github.com/chiragsatish2011-pixel/Nomin" },
    { slug: "vaayu-workspace", repoUrl: "https://github.com/chiragsatish2011-pixel/Vaayu-Workspace" },
    { slug: "vaayu-chat", repoUrl: "https://github.com/chiragsatish2011-pixel/VaayuChat" },
    { slug: "editor-ops-alpha", repoUrl: "https://github.com/chiragsatish2011-pixel/EditorOps" },
    { slug: "chirag-sandy", repoUrl: "https://github.com/chiragsatish2011-pixel/Portfolio" },
    { slug: "n8n-local-setup", repoUrl: "https://github.com/chiragsatish2011-pixel/n8n-local-setup" },
    { slug: "nomin-spacelab", repoUrl: "https://github.com/chiragsatish2011-pixel/Nomin-Workspace" },
    { slug: "tag-along-html", repoUrl: "https://github.com/chiragsatish2011-pixel/HTML-work" },
    { slug: "website1-brand", repoUrl: "https://github.com/chiragsatish2011-pixel/webiste1" },
    { slug: "nc-studio", repoUrl: "https://github.com/chiragsatish2011-pixel/N-C-Studio" },
    { slug: "nomin-webshow", repoUrl: "https://github.com/chiragsatish2011-pixel/Nomin-showcase" },
    { slug: "nomin-code-trion", repoUrl: "https://github.com/chiragsatish2011-pixel/Trion-Website-with-assets" },
    { slug: "showbook", repoUrl: "https://github.com/chiragsatish2011-pixel/Showbook" },
    { slug: "garts-workspace", repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace" },
  ];

  for (const item of repoMapping) {
    try {
      await prisma.project.update({
        where: { slug: item.slug },
        data: { repoUrl: item.repoUrl },
      });
      console.log(`Linked ${item.slug} -> ${item.repoUrl}`);
    } catch (e) {
      console.warn(`Could not link ${item.slug}: ${e.message}`);
    }
  }

  console.log("Finished updating projects with real GitHub URLs!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
