import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const webAppDir = path.join(repoRoot, "web-app");

const excludedDirs = new Set([
  ".git",
  ".github",
  "node_modules",
  "skills",
  "web-app",
]);

function slugToTitle(slug) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function firstHeading(filePath) {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, "utf8");
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || null;
}

function markdownSummary(filePath) {
  if (!existsSync(filePath)) return "";
  const content = readFileSync(filePath, "utf8");
  const logline = content.match(/##\s+Logline\s+([\s\S]*?)(?:\n##\s+|$)/i)?.[1];
  const source = logline || content.replace(/^#\s+.+$/m, "");
  return source
    .replace(/[#*_>`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function gitFirstCommitDate(relativeDir) {
  try {
    const output = execFileSync(
      "git",
      ["log", "--reverse", "--format=%cs", "--", relativeDir],
      { cwd: repoRoot, encoding: "utf8" },
    ).trim();
    return output.split(/\n/).find(Boolean) || null;
  } catch {
    return null;
  }
}

function fileDate(filePath) {
  try {
    return statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function pagesForComic(relativeDir) {
  const pagesDir = path.join(repoRoot, relativeDir, "assets", "comic-pages");
  return readdirSync(pagesDir)
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file, index) => ({
      number: index + 1,
      path: `../${relativeDir}/assets/comic-pages/${file}`,
      alt: `${slugToTitle(relativeDir)} comic page ${index + 1}`,
    }));
}

function pdfPath(relativeDir) {
  const pdfDir = path.join(repoRoot, relativeDir, "output", "pdf");
  if (!existsSync(pdfDir)) return null;
  const pdf = readdirSync(pdfDir)
    .filter((file) => /\.pdf$/i.test(file))
    .sort()
    .at(0);
  return pdf ? `../${relativeDir}/output/pdf/${pdf}` : null;
}

function canonicalBaseUrl() {
  if (process.env.PAGES_BASE_URL) {
    return process.env.PAGES_BASE_URL.replace(/\/+$/, "");
  }

  try {
    const remote = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const match = remote.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      return `https://${owner}.github.io/${repo}/web-app`;
    }
  } catch {
    // Fall through to local-friendly default.
  }

  return "https://jetblackrlsh.github.io/Random-Comics/web-app";
}

function discoverComics() {
  return readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !excludedDirs.has(entry.name))
    .filter((entry) => existsSync(path.join(repoRoot, entry.name, "assets", "comic-pages")))
    .map((entry) => {
      const slug = entry.name;
      const treatment = path.join(repoRoot, slug, "source", "treatment.md");
      const pages = pagesForComic(slug);
      const cover = pages.find((page) => /cover/i.test(page.path)) || pages[0];
      const publishedDate = gitFirstCommitDate(slug) || fileDate(path.join(repoRoot, slug));

      return {
        slug,
        title: firstHeading(treatment) || slugToTitle(slug),
        publishedDate,
        summary: markdownSummary(treatment),
        cover: cover?.path || null,
        pdf: pdfPath(slug),
        pages,
        pageCount: pages.length,
        url: `comics/${slug}/`,
      };
    })
    .sort((a, b) => {
      const byDate = a.publishedDate.localeCompare(b.publishedDate);
      return byDate || a.title.localeCompare(b.title);
    });
}

const comics = discoverComics();
const catalog = {
  site: {
    title: "Random Comics",
    description: "Standalone comics, strange experiments, one-shot adventures, and spontaneous comic ideas.",
    baseUrl: canonicalBaseUrl(),
    supportUrl: "https://donate.stripe.com/bJeeVd7LZfaWbCH78dbV602",
  },
  comics,
};

writeFileSync(path.join(webAppDir, "comics.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${comics.length} comics to web-app/comics.json`);
