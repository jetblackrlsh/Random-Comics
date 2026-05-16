import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const webAppDir = path.join(repoRoot, "web-app");
const catalog = JSON.parse(readFileSync(path.join(webAppDir, "comics.json"), "utf8"));
const template = readFileSync(path.join(webAppDir, "index.html"), "utf8");
const comicsDir = path.join(webAppDir, "comics");
const aboutDir = path.join(webAppDir, "about");
const seriesDir = path.join(webAppDir, "series");

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

function rssDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
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

function comicIssueLabel(comic) {
  if (comic.issueLabel) return comic.issueLabel;
  if (comic.series?.title && comic.issueNumber) return `Issue #${comic.issueNumber} of ${comic.series.title}`;
  if (comic.series?.title) return `Part of ${comic.series.title}`;
  return "Standalone issue";
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

  tags.push(`<link rel="alternate" type="application/rss+xml" title="Random Comics RSS Feed" href="${escapeHtml(catalog.site.feedUrl || `${catalog.site.baseUrl}/rss.xml`)}">`);

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
      return `<li><a href="${escapeHtml(url)}">${escapeHtml(comic.title)}</a> <span>${escapeHtml(comic.publishedDate)} · ${comic.pageCount} pages · ${escapeHtml(comicIssueLabel(comic))}</span></li>`;
    })
    .join("\n          ");
}

function seriesLinkList(series) {
  return series
    .map((item) => {
      const url = `${catalog.site.baseUrl}/series/${item.slug}/`;
      const issueCount = item.issueCount === 1 ? "1 issue" : `${item.issueCount} issues`;
      return `<li><a href="${escapeHtml(url)}">${escapeHtml(item.title)}</a> <span>${escapeHtml(issueCount)}</span></li>`;
    })
    .join("\n          ");
}

function archiveSeoContent() {
  const seriesList = catalog.series?.length
    ? `
        <h3>Series</h3>
        <ul>
          ${seriesLinkList(catalog.series)}
        </ul>`
    : "";
  return `<section class="seo-content" aria-label="Random Comics archive">
        <h2>Random Comics Archive</h2>
        <p>${escapeHtml(catalog.site.description)} Read the latest one-shot comics and series issues online, browse the full archive, or open an individual comic page.</p>${seriesList}
        <h3>Comics</h3>
        <ul>
          ${comicLinkList(catalog.comics)}
        </ul>
      </section>`;
}

function aboutSeoContent() {
  return `<section class="seo-content" aria-label="About Random Comics summary">
        <h2>About Random Comics</h2>
        <p>Random Comics collects standalone comic stories, strange experiments, dream-inspired one-shots, superhero ideas, sci-fi weirdness, horror, comedy, and series that can grow through recurring issues, characters, settings, and key items.</p>
        <p><a href="${escapeHtml(catalog.site.baseUrl)}/">Read the Random Comics archive</a></p>
      </section>`;
}

function comicSeoContent(comic) {
  const pdfLink = comic.pdf
    ? `<p><a href="${escapeHtml(absoluteAssetUrl(comic.pdf))}">Download ${escapeHtml(comic.title)} as a PDF</a></p>`
    : "";
  const seriesLink = comic.series
    ? `<p><a href="${escapeHtml(catalog.site.baseUrl)}/series/${escapeHtml(comic.series.slug)}/">${escapeHtml(comicIssueLabel(comic))}</a></p>`
    : `<p>${escapeHtml(comicIssueLabel(comic))}</p>`;
  return `<section class="seo-content comic-seo-content" aria-label="${escapeHtml(comic.title)} comic details">
        <h2>${escapeHtml(comic.title)}</h2>
        ${seriesLink}
        <p>${escapeHtml(comic.summary || `${comic.title} is a standalone Random Comics issue.`)}</p>
        <figure>
          <img src="${escapeHtml(comic.cover)}" alt="${escapeHtml(`${comic.title} cover art`)}" loading="eager" decoding="async">
          <figcaption>Published ${escapeHtml(comic.publishedDate)} · ${comic.pageCount} pages · ${escapeHtml(comicIssueLabel(comic))}</figcaption>
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
        isPartOf: comic.series
          ? {
              "@type": "CreativeWorkSeries",
              name: comic.series.title,
              url: `${catalog.site.baseUrl}/series/${comic.series.slug}/`,
            }
          : undefined,
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
    description: "About Random Comics, a home for standalone one-shot comic stories, spontaneous comic ideas, and series that can grow through recurring issues.",
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
    issueNumber: comic.issueNumber || undefined,
    position: comic.issueNumber || undefined,
    numberOfPages: comic.pageCount,
    isPartOf: comic.series
      ? {
          "@type": "CreativeWorkSeries",
          name: comic.series.title,
          url: `${catalog.site.baseUrl}/series/${comic.series.slug}/`,
        }
      : {
          "@type": "CreativeWorkSeries",
          name: "Random Comics",
          url: `${catalog.site.baseUrl}/`,
        },
  });
}

function seriesStructuredData(series) {
  const issues = catalog.comics.filter((comic) => comic.series?.slug === series.slug);
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: series.title,
    url: `${catalog.site.baseUrl}/series/${series.slug}/`,
    description: series.summary || `${series.title} is a Random Comics series.`,
    hasPart: issues.map((comic) => ({
      "@type": "ComicIssue",
      name: comic.title,
      url: `${catalog.site.baseUrl}/comics/${comic.slug}/`,
      issueNumber: comic.issueNumber || undefined,
      position: comic.issueNumber || undefined,
      datePublished: comic.publishedDate,
      image: absoluteAssetUrl(comic.cover),
    })),
    isPartOf: {
      "@type": "WebSite",
      name: catalog.site.title,
      url: `${catalog.site.baseUrl}/`,
    },
  });
}

function seriesSeoContent(series) {
  const issues = catalog.comics.filter((comic) => comic.series?.slug === series.slug);
  const summary = series.summary || `${series.title} is a Random Comics series.`;
  const characterCopy = series.characterDescriptions
    ? `<h3>Characters</h3><p>${escapeHtml(series.characterDescriptions)}</p>`
    : "";
  const settingCopy = series.settingDescriptions
    ? `<h3>Settings</h3><p>${escapeHtml(series.settingDescriptions)}</p>`
    : "";
  const keyItemCopy = series.keyItemDescriptions
    ? `<h3>Key Items</h3><p>${escapeHtml(series.keyItemDescriptions)}</p>`
    : "";
  const issueCopy = series.issueSummaries
    ? `<h3>Issue Summaries</h3><p>${escapeHtml(series.issueSummaries)}</p>`
    : "";

  return `<section class="seo-content" aria-label="${escapeHtml(series.title)} series details">
        <h2>${escapeHtml(series.title)}</h2>
        <p>${escapeHtml(summary)}</p>
        ${characterCopy}
        ${settingCopy}
        ${keyItemCopy}
        ${issueCopy}
        <h3>Issues</h3>
        <ul>
          ${comicLinkList(issues)}
        </ul>
      </section>`;
}

function sitemapXml() {
  const latestDate = catalog.comics.at(-1)?.publishedDate || new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${catalog.site.baseUrl}/`, lastmod: latestDate, priority: "1.0" },
    { loc: `${catalog.site.baseUrl}/about/`, lastmod: latestDate, priority: "0.5" },
    ...(catalog.series || []).map((series) => ({
      loc: `${catalog.site.baseUrl}/series/${series.slug}/`,
      lastmod: latestDate,
      priority: "0.8",
    })),
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

function rssFeedXml() {
  const feedUrl = catalog.site.feedUrl || `${catalog.site.baseUrl}/rss.xml`;
  const latestDate = catalog.comics.at(-1)?.publishedDate || new Date().toISOString().slice(0, 10);
  const items = [...catalog.comics].sort((a, b) => {
    const byNewestDate = b.publishedDate.localeCompare(a.publishedDate);
    return byNewestDate || a.title.localeCompare(b.title);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(catalog.site.title)}</title>
    <link>${escapeXml(`${catalog.site.baseUrl}/`)}</link>
    <description>${escapeXml(catalog.site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(rssDate(latestDate))}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items
  .map((comic) => {
    const url = `${catalog.site.baseUrl}/comics/${comic.slug}/`;
    const description = comic.summary || `${comic.title} is a Random Comics release.`;
    const issueContext = comicIssueLabel(comic);
    return `    <item>
      <title>${escapeXml(comic.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${escapeXml(rssDate(comic.publishedDate))}</pubDate>
      <description>${escapeXml(`${description} ${issueContext}. ${comic.pageCount} pages.`)}</description>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;
}

rmSync(comicsDir, { recursive: true, force: true });
rmSync(seriesDir, { recursive: true, force: true });
mkdirSync(comicsDir, { recursive: true });
mkdirSync(aboutDir, { recursive: true });
mkdirSync(seriesDir, { recursive: true });

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
      description: "What Random Comics is about: standalone stories, strange experiments, one-shot adventures, and series that can grow beyond a single issue.",
      url: `${catalog.site.baseUrl}/about/`,
      image: `${catalog.site.baseUrl}/assets/site-background.png`,
    }),
    structuredData: aboutStructuredData(),
    seoContent: aboutSeoContent(),
    appRoute: "about",
  }),
);

for (const series of catalog.series || []) {
  const dir = path.join(seriesDir, series.slug);
  mkdirSync(dir, { recursive: true });

  writeFileSync(
    path.join(dir, "index.html"),
    pageFromTemplate({
      baseHref: "../../",
      meta: metaBlock({
        title: `${series.title} | Random Comics`,
        description: series.summary || `${series.title}, a Random Comics series.`,
        url: `${catalog.site.baseUrl}/series/${series.slug}/`,
        image: `${catalog.site.baseUrl}/assets/site-background.png`,
      }),
      structuredData: seriesStructuredData(series),
      seoContent: seriesSeoContent(series),
      appRoute: `series:${series.slug}`,
    }),
  );
}

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
writeFileSync(path.join(webAppDir, "rss.xml"), rssFeedXml());

console.log(`Wrote ${catalog.comics.length} comic share pages and ${(catalog.series || []).length} series pages to web-app/`);
