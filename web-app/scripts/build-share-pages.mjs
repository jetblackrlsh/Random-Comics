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

function escapeXml(value) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function jsonLd(value) {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

function truncateDescription(value, maxLength = 180) {
  const normalized = String(value || catalog.site.description).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const trimmed = normalized.slice(0, maxLength - 1);
  return `${trimmed.slice(0, trimmed.lastIndexOf(" "))}...`;
}

function absoluteAssetUrl(assetPath) {
  if (!assetPath) return `${catalog.site.baseUrl}/assets/site-background.png`;
  const rootRelative = assetPath.replace(/^\.\.\//, "");
  const repoBase = catalog.site.baseUrl.replace(/\/web-app$/, "");
  return `${repoBase}/${rootRelative}`;
}

function metaBlock({ title, description, url, image, type = "website", publishedDate = null }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(truncateDescription(description));
  const safeUrl = escapeHtml(url);
  const safeImage = escapeHtml(image);
  const safeImageAlt = escapeHtml(`${title} cover art`);

  const tags = [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}">`,
    `<meta name="robots" content="index, follow">`,
    `<link rel="canonical" href="${safeUrl}">`,
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:site_name" content="Random Comics">`,
    `<meta property="og:title" content="${safeTitle}">`,
    `<meta property="og:description" content="${safeDescription}">`,
    `<meta property="og:url" content="${safeUrl}">`,
    `<meta property="og:image" content="${safeImage}">`,
    `<meta property="og:image:alt" content="${safeImageAlt}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${safeTitle}">`,
    `<meta name="twitter:description" content="${safeDescription}">`,
    `<meta name="twitter:image" content="${safeImage}">`,
    `<meta name="twitter:image:alt" content="${safeImageAlt}">`,
  ];

  if (publishedDate) {
    tags.push(`<meta property="article:published_time" content="${escapeHtml(publishedDate)}">`);
  }

  return tags.join("\n    ");
}

function pageFromTemplate({ baseHref, meta, structuredData, seoContent, appRoute }) {
  return template
    .replace(/<base href="[^"]+">/, `<base href="${baseHref}">`)
    .replace(
      /<!-- APP_META_START -->[\s\S]*?<!-- APP_META_END -->/,
      `<!-- APP_META_START -->\n    ${meta}\n    <!-- APP_META_END -->`,
    )
    .replace(
      /<!-- STRUCTURED_DATA_START -->[\s\S]*?<!-- STRUCTURED_DATA_END -->/,
      `<!-- STRUCTURED_DATA_START -->\n    ${structuredData}\n    <!-- STRUCTURED_DATA_END -->`,
    )
    .replace(
      /<!-- SEO_CONTENT_START -->[\s\S]*?<!-- SEO_CONTENT_END -->/,
      `<!-- SEO_CONTENT_START -->\n      ${seoContent}\n      <!-- SEO_CONTENT_END -->`,
    )
    .replace(
      /<body([^>]*)>/,
      (_match, attributes) => {
        const cleanAttributes = attributes.replace(/\sdata-initial-route="[^"]*"/, "");
        return `<body${cleanAttributes} data-initial-route="${escapeHtml(appRoute)}">`;
      },
    );
}

function comicLinkList(comics) {
  return comics
    .map((comic) => {
      const url = `${catalog.site.baseUrl}/comics/${comic.slug}/`;
      return `<li><a href="${escapeHtml(url)}">${escapeHtml(comic.title)}</a> <span>${escapeHtml(comic.publishedDate)} · ${comic.pageCount} pages</span></li>`;
    })
    .join("\n          ");
}

function archiveSeoContent() {
  return `<section class="seo-content" aria-label="Random Comics archive">
        <h2>Random Comics Archive</h2>
        <p>${escapeHtml(catalog.site.description)} Read the latest one-shot comics online, browse the full archive, or open an individual comic page.</p>
        <ul>
          ${comicLinkList(catalog.comics)}
        </ul>
      </section>`;
}

function aboutSeoContent() {
  return `<section class="seo-content" aria-label="About Random Comics summary">
        <h2>About Random Comics</h2>
        <p>Random Comics collects standalone comic stories, strange experiments, dream-inspired one-shots, superhero ideas, sci-fi weirdness, horror, comedy, and other spontaneous comic concepts.</p>
        <p><a href="${escapeHtml(catalog.site.baseUrl)}/">Read the Random Comics archive</a></p>
      </section>`;
}

function comicSeoContent(comic) {
  const pdfLink = comic.pdf
    ? `<p><a href="${escapeHtml(absoluteAssetUrl(comic.pdf))}">Download ${escapeHtml(comic.title)} as a PDF</a></p>`
    : "";
  return `<section class="seo-content comic-seo-content" aria-label="${escapeHtml(comic.title)} comic details">
        <h2>${escapeHtml(comic.title)}</h2>
        <p>${escapeHtml(comic.summary || `${comic.title} is a standalone Random Comics issue.`)}</p>
        <figure>
          <img src="${escapeHtml(comic.cover)}" alt="${escapeHtml(`${comic.title} cover art`)}" loading="eager" decoding="async">
          <figcaption>Published ${escapeHtml(comic.publishedDate)} · ${comic.pageCount} pages</figcaption>
        </figure>
        ${pdfLink}
        <h3>More Random Comics</h3>
        <ul>
          ${comicLinkList(catalog.comics.filter((item) => item.slug !== comic.slug))}
        </ul>
      </section>`;
}

function homeStructuredData() {
  const url = `${catalog.site.baseUrl}/`;
  return [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: catalog.site.title,
      url,
      description: catalog.site.description,
      publisher: {
        "@type": "Organization",
        name: "Random Comics",
      },
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Random Comics Archive",
      url,
      description: catalog.site.description,
      hasPart: catalog.comics.map((comic) => ({
        "@type": "ComicIssue",
        name: comic.title,
        url: `${catalog.site.baseUrl}/comics/${comic.slug}/`,
        datePublished: comic.publishedDate,
        image: absoluteAssetUrl(comic.cover),
      })),
    }),
  ].join("\n    ");
}

function aboutStructuredData() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Random Comics",
    url: `${catalog.site.baseUrl}/about/`,
    description: "About Random Comics, a home for standalone one-shot comic stories and spontaneous comic ideas.",
    isPartOf: {
      "@type": "WebSite",
      name: catalog.site.title,
      url: `${catalog.site.baseUrl}/`,
    },
  });
}

function comicStructuredData(comic) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "ComicIssue",
    name: comic.title,
    headline: comic.title,
    url: `${catalog.site.baseUrl}/comics/${comic.slug}/`,
    description: comic.summary || `${comic.title} is a standalone Random Comics issue.`,
    datePublished: comic.publishedDate,
    image: absoluteAssetUrl(comic.cover),
    numberOfPages: comic.pageCount,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: "Random Comics",
      url: `${catalog.site.baseUrl}/`,
    },
  });
}

function sitemapXml() {
  const latestDate = catalog.comics.at(-1)?.publishedDate || new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${catalog.site.baseUrl}/`, lastmod: latestDate, priority: "1.0" },
    { loc: `${catalog.site.baseUrl}/about/`, lastmod: latestDate, priority: "0.5" },
    ...catalog.comics.map((comic) => ({
      loc: `${catalog.site.baseUrl}/comics/${comic.slug}/`,
      lastmod: comic.publishedDate,
      priority: "0.9",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`)
  .join("\n")}
</urlset>
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${catalog.site.baseUrl}/sitemap.xml
`;
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
  path.join(webAppDir, "index.html"),
  pageFromTemplate({
    baseHref: "./",
    meta: genericMeta,
    structuredData: homeStructuredData(),
    seoContent: archiveSeoContent(),
    appRoute: "home",
  }),
);

writeFileSync(
  path.join(comicsDir, "index.html"),
  pageFromTemplate({
    baseHref: "../",
    meta: genericMeta,
    structuredData: homeStructuredData(),
    seoContent: archiveSeoContent(),
    appRoute: "home",
  }),
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
    structuredData: aboutStructuredData(),
    seoContent: aboutSeoContent(),
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
      meta: metaBlock({
        title,
        description,
        url,
        image,
        type: "article",
        publishedDate: comic.publishedDate,
      }),
      structuredData: comicStructuredData(comic),
      seoContent: comicSeoContent(comic),
      appRoute: `comic:${comic.slug}`,
    }),
  );
}

writeFileSync(path.join(webAppDir, "sitemap.xml"), sitemapXml());
writeFileSync(path.join(webAppDir, "robots.txt"), robotsTxt());

console.log(`Wrote ${catalog.comics.length} comic share pages to web-app/comics/`);
