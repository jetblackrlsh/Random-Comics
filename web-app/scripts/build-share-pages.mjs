import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const webAppDir = path.join(repoRoot, "web-app");
const catalog = JSON.parse(readFileSync(path.join(webAppDir, "comics.json"), "utf8"));
const template = readFileSync(path.join(webAppDir, "index.html"), "utf8");
const comicsDir = path.join(webAppDir, "comics");
const aboutDir = path.join(webAppDir, "about");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteAssetUrl(assetPath) {
  if (!assetPath) return `${catalog.site.baseUrl}/assets/site-background.png`;
  const rootRelative = assetPath.replace(/^\.\.\//, "");
  const repoBase = catalog.site.baseUrl.replace(/\/web-app$/, "");
  return `${repoBase}/${rootRelative}`;
}

function metaBlock({ title, description, url, image }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  const safeImage = escapeHtml(image);

  return [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}">`,
    `<link rel="canonical" href="${safeUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Random Comics">`,
    `<meta property="og:title" content="${safeTitle}">`,
    `<meta property="og:description" content="${safeDescription}">`,
    `<meta property="og:url" content="${safeUrl}">`,
    `<meta property="og:image" content="${safeImage}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${safeTitle}">`,
    `<meta name="twitter:description" content="${safeDescription}">`,
    `<meta name="twitter:image" content="${safeImage}">`,
  ].join("\n    ");
}

function pageFromTemplate({ baseHref, meta, appRoute }) {
  return template
    .replace(/<base href="[^"]+">/, `<base href="${baseHref}">`)
    .replace(
      /<!-- APP_META_START -->[\s\S]*?<!-- APP_META_END -->/,
      `<!-- APP_META_START -->\n    ${meta}\n    <!-- APP_META_END -->`,
    )
    .replace(
      /<body([^>]*)>/,
      `<body$1 data-initial-route="${escapeHtml(appRoute)}">`,
    );
}

rmSync(comicsDir, { recursive: true, force: true });
mkdirSync(comicsDir, { recursive: true });
mkdirSync(aboutDir, { recursive: true });

const genericMeta = metaBlock({
  title: catalog.site.title,
  description: catalog.site.description,
  url: `${catalog.site.baseUrl}/`,
  image: `${catalog.site.baseUrl}/assets/site-background.png`,
});

writeFileSync(
  path.join(comicsDir, "index.html"),
  pageFromTemplate({ baseHref: "../", meta: genericMeta, appRoute: "home" }),
);

writeFileSync(
  path.join(aboutDir, "index.html"),
  pageFromTemplate({
    baseHref: "../",
    meta: metaBlock({
      title: "About Random Comics",
      description: "What Random Comics is about: standalone stories, strange experiments, one-shot adventures, and ideas that do not need a universe.",
      url: `${catalog.site.baseUrl}/about/`,
      image: `${catalog.site.baseUrl}/assets/site-background.png`,
    }),
    appRoute: "about",
  }),
);

for (const comic of catalog.comics) {
  const dir = path.join(comicsDir, comic.slug);
  mkdirSync(dir, { recursive: true });
  const title = `${comic.title} | Random Comics`;
  const description = comic.summary || `${comic.title}, published ${comic.publishedDate}, available to read in Random Comics.`;
  const url = `${catalog.site.baseUrl}/comics/${comic.slug}/`;
  const image = absoluteAssetUrl(comic.cover);

  writeFileSync(
    path.join(dir, "index.html"),
    pageFromTemplate({
      baseHref: "../../",
      meta: metaBlock({ title, description, url, image }),
      appRoute: `comic:${comic.slug}`,
    }),
  );
}

console.log(`Wrote ${catalog.comics.length} comic share pages to web-app/comics/`);
