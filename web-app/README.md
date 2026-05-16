# Random Comics Web App

This is the static GitHub Pages reader for Random Comics.

## Build

Run this before publishing:

```bash
node web-app/scripts/build-catalog.mjs
node web-app/scripts/build-share-pages.mjs
node web-app/scripts/build-pages-site.mjs
```

`build-catalog.mjs` scans top-level comic folders that contain `assets/comic-pages/`. It reads the comic title and summary from `source/treatment.md`, finds the PDF under `output/pdf/`, and uses the first Git commit date touching that folder as the initial publishing date.

Series are supported under `series/<series-folder>/`. A series folder can contain `reference-images/`, `source/series.md`, `source/issue-summaries.md`, `source/character-descriptions.md` or `source/character-bible.md`, `source/setting-descriptions.md`, and `source/key-item-descriptions.md`. Issues go under `series/<series-folder>/issues/<issue-folder>/` and use the same issue layout as standalone comics:

```text
series/<series-folder>/
  reference-images/
  source/
    series.md
    issue-summaries.md
    character-descriptions.md
    setting-descriptions.md
    key-item-descriptions.md
  issues/
    issue-01/
      assets/comic-pages/
      output/pdf/
      source/treatment.md
```

The web app search indexes series titles, series summaries, character descriptions, setting descriptions, key item descriptions, and issue labels. Series issues display labels like `Issue #1 of <Series Title>` in the archive and reader. If `source/treatment.md` has a `## Issue Number` section, that value is used; otherwise the issue number is inferred from the issue folder name or its order inside the series.

## URL Shape

- Main app: `https://jetblackrlsh.github.io/Random-Comics/web-app/`
- About page: `https://jetblackrlsh.github.io/Random-Comics/web-app/about/`
- Follow page: `https://jetblackrlsh.github.io/Random-Comics/web-app/follow/`
- Comic page: `https://jetblackrlsh.github.io/Random-Comics/web-app/comics/<comic-folder>/`
- Series page: `https://jetblackrlsh.github.io/Random-Comics/web-app/series/<series-folder>/`
- RSS feed: `https://jetblackrlsh.github.io/Random-Comics/web-app/rss.xml`

Each generated comic page includes static Open Graph and Twitter metadata using that comic's cover image. Generated series pages include crawlable issue lists and structured data tying each issue to its series.
The generated RSS feed includes each comic release as an item, newest first, and is advertised from generated pages with an alternate feed link.
The generated Follow page embeds the follow.it email subscription form and is linked from the reader navigation.

`build-pages-site.mjs` creates a curated `_site/` artifact for GitHub Pages with the web app, comic page images, comic PDFs, and a root redirect into `web-app/`.
