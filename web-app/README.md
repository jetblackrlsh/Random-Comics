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

## URL Shape

- Main app: `https://jetblackrlsh.github.io/Random-Comics/web-app/`
- About page: `https://jetblackrlsh.github.io/Random-Comics/web-app/about/`
- Comic page: `https://jetblackrlsh.github.io/Random-Comics/web-app/comics/<comic-folder>/`

Each generated comic page includes static Open Graph and Twitter metadata using that comic's cover image.

`build-pages-site.mjs` creates a curated `_site/` artifact for GitHub Pages with the web app, comic page images, comic PDFs, and a root redirect into `web-app/`.
