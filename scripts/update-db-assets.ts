import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const projects = await db.project.findMany();
  console.log(`Updating assets for ${projects.length} projects to real captures...`);

  for (const p of projects) {
    const captureUrl = `/captures/${p.slug}.webp`;
    await db.asset.deleteMany({ where: { projectId: p.id } });
    await db.asset.createMany({
      data: [
        {
          projectId: p.id,
          type: "screenshot",
          path: captureUrl,
          viewport: "desktop",
        },
        {
          projectId: p.id,
          type: "screenshot",
          path: captureUrl,
          viewport: "tablet",
        },
        {
          projectId: p.id,
          type: "screenshot",
          path: captureUrl,
          viewport: "mobile",
        },
        {
          projectId: p.id,
          type: "cover",
          path: captureUrl,
        },
      ],
    });
    console.log(`Updated assets for: ${p.title} -> ${captureUrl}`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
