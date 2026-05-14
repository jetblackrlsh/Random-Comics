# Agent Instructions

These instructions apply to the whole Random Comics repository.

## Project Shape

- Standalone comics live in top-level comic folders.
- Series live under `series/<series-folder>/`.
- Series issues live under `series/<series-folder>/issues/<issue-folder>/`.
- The static reader is generated from `web-app/scripts/build-catalog.mjs` and `web-app/scripts/build-share-pages.mjs`.

## Image Generation Requirement

- All comic page art, cover art, reference images, and replacement/regenerated comic images must be created with the built-in chat AI image generation capability, using `image_gen`.
- Do not use an API-key-dependent image workflow, external image API, CLI image generator, local drawing/rendering script, placeholder art generator, stock asset service, or manual asset service for required comic imagery.
- If `image_gen` is unavailable or blocked, stop and report that the comic imagery cannot be completed under this repo's workflow instead of substituting another generation method.
- PDF assembly and preview generation may normalize, resize, package, or contact-sheet the completed generated page images, but must not create the comic art, caption text, title text, or page content as a substitute for `image_gen`.
- All readable story text in comic pages must be generated directly inside the page art by `image_gen`; do not add narration, dialogue, titles, labels, or caption text afterward with code, image editing, canvas drawing, HTML/CSS, or PDF tooling.

## Before Creating Or Editing A Comic

1. Determine whether the comic is standalone or part of a series.
2. For standalone comics, use the existing top-level comic folder layout.
3. For series comics, read `series/SERIES_WORKFLOW.md` before writing story files, prompts, images, PDFs, catalog data, or web-app output.
4. If using the repo-local photo comic workflow, follow `skills/photo-comic-book-pdf/SKILL.md`.

## Adding Pages To An Existing Comic

When the user asks to add more pages to an existing comic:

1. Identify whether the target comic is a standalone top-level comic or a series issue.
2. Follow `skills/photo-comic-book-pdf/SKILL.md`, especially its "Extending An Existing Comic" workflow.
3. If the target comic is a series issue, also apply `series/SERIES_WORKFLOW.md` so continuity files and issue summaries stay current.

## Turning A One-Shot Into A Series

When the user asks to turn an existing one-shot into issue #1 of a new series:

1. Follow `series/SERIES_WORKFLOW.md`, especially its "Promoting A Standalone One-Shot To Issue #1" workflow.
2. Preserve the existing one-shot art and source files unless the user explicitly asks for story or image revisions.
3. Run the web-app build commands so the standalone entry is replaced by the new series issue and generated series page.

## User Prompt Shorthands

Users can ask for comics with short prompts documented in `PROMPTING.md`. Treat these as complete routing instructions:

- `Create a Random Comics one-shot from this premise: ...` means create a standalone top-level comic.
- `Create the next issue of [Series Name] from this premise: ...` means create a new issue inside an existing series.
- `Create a new series called [Series Name] and make issue #1...` means create the series structure and the first issue.
- `Add [n] pages to [Comic Title]...` means expand an existing standalone comic or series issue in place.
- `Turn [One-Shot Title] into issue #1 of a new series called [Series Name]...` means promote the existing standalone comic into a new series without unnecessary regeneration.

Do not require the user to restate folder conventions, continuity-file rules, reference-image requirements, or web-app build steps when they use these shorthands. Apply the relevant project workflow automatically.

## Prompt Help And Capability Explanations

When the user asks how to prompt the agent, asks for a prompt template, or asks what the agent can do:

- Treat the request as an informational help request, not as permission to start creating or editing a comic.
- Use `PROMPTING.md` as the source of truth for user-facing prompt templates.
- Reply with concise copy-pasteable templates using bracketed placeholders, then briefly explain which template fits which task.
- Tailor the templates to the user's stated goal when they mention one-shot comics, existing series, new series, adding pages, turning a one-shot into a series, reference images, web-app updates, or commit/push work.
- When explaining capabilities, describe practical repo workflows: standalone one-shots, new series and first issues, next issues in existing series, adding pages to an existing comic, promoting a one-shot into a series, generating continuity reference images with `image_gen`, rebuilding PDFs/previews, updating the static web app, and committing/pushing when requested.
- Mention hard constraints when relevant: required comic imagery must use `image_gen`, readable story text must be generated inside the page art, and the repo-local photo comic workflow normally supports up to 8 total pages per comic.

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
