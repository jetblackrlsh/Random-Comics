import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const webAppDir = path.join(repoRoot, "web-app");
const siteDir = path.join(repoRoot, "_site");
const catalog = JSON.parse(readFileSync(path.join(webAppDir, "comics.json"), "utf8"));

function copyIfExists(from, to) {
  try {
    cpSync(from, to, { recursive: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

cpSync(webAppDir, path.join(siteDir, "web-app"), { recursive: true });
copyIfExists(path.join(webAppDir, "robots.txt"), path.join(siteDir, "robots.txt"));
copyIfExists(path.join(webAppDir, "sitemap.xml"), path.join(siteDir, "sitemap.xml"));

for (const comic of catalog.comics) {
  const comicRoot = path.join(siteDir, comic.slug);
  mkdirSync(comicRoot, { recursive: true });
  copyIfExists(
    path.join(repoRoot, comic.slug, "assets", "comic-pages"),
    path.join(comicRoot, "assets", "comic-pages"),
  );
  copyIfExists(
    path.join(repoRoot, comic.slug, "output", "pdf"),
    path.join(comicRoot, "output", "pdf"),
  );
}

writeFileSync(
  path.join(siteDir, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Random Comics</title>
    <meta http-equiv="refresh" content="0; url=web-app/">
    <link rel="canonical" href="${catalog.site.baseUrl}/">
  </head>
  <body>
    <p><a href="web-app/">Random Comics</a></p>
  </body>
</html>
`,
);

console.log(`Wrote GitHub Pages artifact to ${path.relative(repoRoot, siteDir)}`);
