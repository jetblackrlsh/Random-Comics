# Agent Instructions

These instructions apply to the whole Random Comics repository.

## Project Shape

- Standalone comics live in top-level comic folders.
- Series live under `series/<series-folder>/`.
- Series issues live under `series/<series-folder>/issues/<issue-folder>/`.
- The static reader is generated from `web-app/scripts/build-catalog.mjs` and `web-app/scripts/build-share-pages.mjs`.

## Before Creating Or Editing A Comic

1. Determine whether the comic is standalone or part of a series.
2. For standalone comics, use the existing top-level comic folder layout.
3. For series comics, read `series/SERIES_WORKFLOW.md` before writing story files, prompts, images, PDFs, catalog data, or web-app output.
4. If using the repo-local photo comic workflow, follow `skills/photo-comic-book-pdf/SKILL.md`.

## User Prompt Shorthands

Users can ask for comics with short prompts documented in `PROMPTING.md`. Treat these as complete routing instructions:

- `Create a Random Comics one-shot from this premise: ...` means create a standalone top-level comic.
- `Create the next issue of [Series Name] from this premise: ...` means create a new issue inside an existing series.
- `Create a new series called [Series Name] and make issue #1...` means create the series structure and the first issue.

Do not require the user to restate folder conventions, continuity-file rules, reference-image requirements, or web-app build steps when they use these shorthands. Apply the relevant project workflow automatically.

## Series Continuity Rules

- Treat series source files as continuity contracts, not optional notes.
- Before creating a new issue in a series, read the existing series summary, issue summaries, character descriptions, setting descriptions, key item descriptions, and reference images.
- When a series issue introduces a new recurring character, setting, or key item, create both:
  - a written description in the relevant `series/<series-folder>/source/*-descriptions.md` file
  - a matching reference image under `series/<series-folder>/reference-images/`
- Create series reference images with the built-in chat AI image generation capability, using `image_gen`; do not require or route through an API key, external image API, CLI image generator, or manual asset service.
- Series reference images must use the realistic candid photo-comic style: documentary phone-photo or handheld photojournalism feel, natural imperfect framing, believable real-world lighting, photoreal action or object detail where needed, and no anime or painted illustration style.
- Reuse existing reference images and descriptions for recurring elements instead of redesigning them.
- Update `series/<series-folder>/source/issue-summaries.md` after each completed issue.

## Web App Updates

After adding, moving, or editing comics or series metadata, run:

```bash
node web-app/scripts/build-catalog.mjs
node web-app/scripts/build-share-pages.mjs
node web-app/scripts/build-pages-site.mjs
```

Then run syntax checks on changed JavaScript:

```bash
node --check web-app/app.js
node --check web-app/scripts/build-catalog.mjs
node --check web-app/scripts/build-share-pages.mjs
node --check web-app/scripts/build-pages-site.mjs
```

## Git Hygiene

- Check `git status --short --branch` before staging or committing.
- Stage only intended files.
- Do not revert unrelated user changes.
