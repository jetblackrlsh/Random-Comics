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
  "_site",
  "node_modules",
  "series",
  "skills",
  "web-app",
]);

const seriesReservedDirs = new Set([
  "assets",
  "output",
  "reference-images",
  "Reference Images",
  "references",
  "source",
  "tmp",
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markdownSection(filePath, heading) {
  if (!existsSync(filePath)) return "";
  const content = readFileSync(filePath, "utf8");
  return content.match(new RegExp(`##\\s+${escapeRegExp(heading)}\\s+([\\s\\S]*?)(?:\\n##\\s+|$)`, "i"))?.[1] || "";
}

function treatmentTitle(filePath) {
  const explicitTitle = markdownSection(filePath, "Title")
    .replace(/[#*_>`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (explicitTitle) return explicitTitle;

  const heading = firstHeading(filePath);
  return heading && heading.toLowerCase() !== "treatment" ? heading : null;
}

function markdownSummary(filePath) {
  if (!existsSync(filePath)) return "";
  const content = readFileSync(filePath, "utf8");
  const logline = markdownSection(filePath, "Logline");
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
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
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

function plainMarkdown(filePath) {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[#*_>`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstExistingFile(paths) {
  return paths.find((filePath) => existsSync(filePath)) || null;
}

function numericSection(filePath, heading) {
  const value = markdownSection(filePath, heading).replace(/[^\d]/g, "");
  return value ? Number.parseInt(value, 10) : null;
}

function issueNumberFromSlug(slug) {
  const match = slug.match(/(?:^|[-_])(?:issue|number|no)?[-_]?(\d{1,3})(?:[-_]|$)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function pagesForComic(relativeDir, title = slugToTitle(path.basename(relativeDir))) {
  const pagesDir = path.join(repoRoot, relativeDir, "assets", "comic-pages");
  return readdirSync(pagesDir)
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file, index) => ({
      number: index + 1,
      path: `../${relativeDir}/assets/comic-pages/${file}`,
      alt: `${title} comic page ${index + 1}`,
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
      stdio: ["ignore", "pipe", "ignore"],
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

function referenceImagesForSeries(seriesSlug, seriesDir) {
  const referenceDir = firstExistingFile([
    path.join(seriesDir, "reference-images"),
    path.join(seriesDir, "Reference Images"),
    path.join(seriesDir, "references"),
  ]);
  if (!referenceDir) return [];

  const referenceRootName = path.relative(seriesDir, referenceDir);
  return readdirSync(referenceDir)
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => ({
      path: `../series/${seriesSlug}/${referenceRootName}/${file}`,
      alt: `${slugToTitle(seriesSlug)} reference image`,
    }));
}

function seriesMetadata(seriesSlug) {
  const seriesDir = path.join(repoRoot, "series", seriesSlug);
  const sourceDir = path.join(seriesDir, "source");
  const overview = firstExistingFile([
    path.join(sourceDir, "series.md"),
    path.join(sourceDir, "series-summary.md"),
    path.join(seriesDir, "series.md"),
    path.join(seriesDir, "README.md"),
  ]);
  const characterDescriptions = firstExistingFile([
    path.join(sourceDir, "character-descriptions.md"),
    path.join(sourceDir, "character-bible.md"),
    path.join(seriesDir, "character-descriptions.md"),
  ]);
  const issueSummaries = firstExistingFile([
    path.join(sourceDir, "issue-summaries.md"),
    path.join(seriesDir, "issue-summaries.md"),
  ]);
  const settingDescriptions = firstExistingFile([
    path.join(sourceDir, "setting-descriptions.md"),
    path.join(sourceDir, "settings.md"),
    path.join(seriesDir, "setting-descriptions.md"),
  ]);
  const keyItemDescriptions = firstExistingFile([
    path.join(sourceDir, "key-item-descriptions.md"),
    path.join(sourceDir, "key-items.md"),
    path.join(seriesDir, "key-item-descriptions.md"),
  ]);

  return {
    slug: seriesSlug,
    title: overview ? treatmentTitle(overview) || slugToTitle(seriesSlug) : slugToTitle(seriesSlug),
    summary: overview ? markdownSummary(overview) : "",
    characterDescriptions: characterDescriptions ? plainMarkdown(characterDescriptions) : "",
    settingDescriptions: settingDescriptions ? plainMarkdown(settingDescriptions) : "",
    keyItemDescriptions: keyItemDescriptions ? plainMarkdown(keyItemDescriptions) : "",
    issueSummaries: issueSummaries ? plainMarkdown(issueSummaries) : "",
    referenceImages: referenceImagesForSeries(seriesSlug, seriesDir),
    url: `series/${seriesSlug}/`,
  };
}

function issueEntriesForSeries(seriesSlug) {
  const seriesDir = path.join(repoRoot, "series", seriesSlug);
  const issuesRoot = existsSync(path.join(seriesDir, "issues"))
    ? path.join(seriesDir, "issues")
    : seriesDir;
  const issuesRootRelative = path.relative(repoRoot, issuesRoot);

  return readdirSync(issuesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !seriesReservedDirs.has(entry.name))
    .filter((entry) => existsSync(path.join(issuesRoot, entry.name, "assets", "comic-pages")))
    .map((entry) => ({
      issueSlug: entry.name,
      relativeDir: path.join(issuesRootRelative, entry.name).split(path.sep).join("/"),
    }))
    .sort((a, b) => a.issueSlug.localeCompare(b.issueSlug, undefined, { numeric: true }));
}

function comicFromDirectory({ relativeDir, slug, series = null, issueNumber = null }) {
  const treatment = path.join(repoRoot, relativeDir, "source", "treatment.md");
  const title = treatmentTitle(treatment) || slugToTitle(path.basename(relativeDir));
  const pages = pagesForComic(relativeDir, title);
  const cover = pages.find((page) => /cover/i.test(page.path)) || pages[0];
  const publishedDate = gitFirstCommitDate(relativeDir) || fileDate(path.join(repoRoot, relativeDir));
  const issueLabel = series
    ? `Issue #${issueNumber} of ${series.title}`
    : "Standalone issue";

  return {
    slug,
    folder: relativeDir,
    title,
    publishedDate,
    summary: markdownSummary(treatment),
    cover: cover?.path || null,
    pdf: pdfPath(relativeDir),
    pages,
    pageCount: pages.length,
    series,
    issueNumber,
    issueLabel,
    url: `comics/${slug}/`,
  };
}

function discoverStandaloneComics() {
  return readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !excludedDirs.has(entry.name))
    .filter((entry) => existsSync(path.join(repoRoot, entry.name, "assets", "comic-pages")))
    .map((entry) => comicFromDirectory({ relativeDir: entry.name, slug: entry.name }));
}

function discoverSeries() {
  const seriesRoot = path.join(repoRoot, "series");
  if (!existsSync(seriesRoot)) return { series: [], comics: [] };

  const series = [];
  const comics = [];

  for (const entry of readdirSync(seriesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metadata = seriesMetadata(entry.name);
    const issueEntries = issueEntriesForSeries(entry.name);
    const issueComics = issueEntries.map((issue, index) => {
      const treatment = path.join(repoRoot, issue.relativeDir, "source", "treatment.md");
      const explicitIssueNumber = numericSection(treatment, "Issue Number") || issueNumberFromSlug(issue.issueSlug);
      return comicFromDirectory({
        relativeDir: issue.relativeDir,
        slug: `${entry.name}-${issue.issueSlug}`,
        series: {
          slug: metadata.slug,
          title: metadata.title,
          summary: metadata.summary,
          url: metadata.url,
        },
        issueNumber: explicitIssueNumber || index + 1,
      });
    });

    series.push({
      ...metadata,
      issueCount: issueComics.length,
      issues: issueComics.map((comic) => comic.slug),
    });
    comics.push(...issueComics);
  }

  return {
    series: series.sort((a, b) => a.title.localeCompare(b.title)),
    comics,
  };
}

function sortComics(comics) {
  return comics
    .sort((a, b) => {
      const byDate = a.publishedDate.localeCompare(b.publishedDate);
      return byDate || a.title.localeCompare(b.title);
    });
}

const standaloneComics = discoverStandaloneComics();
const discoveredSeries = discoverSeries();
const comics = sortComics([...standaloneComics, ...discoveredSeries.comics]);
const baseUrl = canonicalBaseUrl();
const catalog = {
  site: {
    title: "Random Comics",
    description: "Standalone comics, strange experiments, one-shot adventures, spontaneous comic ideas, and future comic series.",
    baseUrl,
    feedUrl: `${baseUrl}/rss.xml`,
    supportUrl: "https://donate.stripe.com/bJeeVd7LZfaWbCH78dbV602",
  },
  series: discoveredSeries.series,
  comics,
};

writeFileSync(path.join(webAppDir, "comics.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${comics.length} comics and ${catalog.series.length} series to web-app/comics.json`);
