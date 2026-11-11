import fs from "fs";
import path from "path";

const cachePath = path.join(process.cwd(), "public", "sites-cache.json");
const sites = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

const tsCode = `export interface SiteItem {
  id: string;
  name: string;
  url: string;
  description: string;
  thumbnailUrl: string;
  thumbnail1440?: string;
  thumbnail800?: string;
  thumbnail400?: string;
  blurDataURL?: string;
  order: number;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_VAULT_SITES: SiteItem[] = ${JSON.stringify(sites, null, 2)};
`;

const targetPath = path.join(process.cwd(), "src", "lib", "initial-sites.ts");
fs.writeFileSync(targetPath, tsCode, "utf-8");
console.log("Successfully wrote initial-sites.ts with", sites.length, "sites.");
