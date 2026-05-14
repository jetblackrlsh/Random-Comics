# Series Workflow

Use this workflow whenever a comic belongs to a series.

Users can trigger this workflow with the short prompts in `../PROMPTING.md`; they do not need to repeat the detailed checklist in their request.

## Folder Layout

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
      source/
        story-idea.txt
        treatment.md
        character-bible.md
        page-script.md
      assets/comic-pages/
      output/pdf/
      tmp/photo-comic-book-pdf/
```

## Required Series Source Files

- `source/series.md`: series title, logline, premise, tone, recurring visual language, and continuity notes.
- `source/issue-summaries.md`: one entry per issue, including issue number, title, date or creation order, plot summary, continuity changes, and introduced elements.
- `source/character-descriptions.md`: canonical descriptions for recurring characters.
- `source/setting-descriptions.md`: canonical descriptions for recurring locations or major environments.
- `source/key-item-descriptions.md`: canonical descriptions for important objects, vehicles, devices, weapons, artifacts, costumes, symbols, or props.
- `reference-images/`: stable visual references for recurring characters, settings, and key items.

Create missing required source files before generating a new series issue.

## Before Writing A New Issue

1. Read every required series source file that exists.
2. Inventory `reference-images/`.
3. Identify which existing characters, settings, and key items must recur.
4. Decide the next issue number from existing issue folders and `issue-summaries.md`.
5. Create the issue folder under `series/<series-folder>/issues/<issue-folder>/`.
6. Add `## Issue Number` to the issue treatment so the web app can label the issue correctly.

## New Continuity Elements

When the issue introduces a new character, setting, or key item that may recur, do all of this before finalizing the issue:

1. Add a written entry to the matching source file:
   - characters -> `source/character-descriptions.md`
   - settings -> `source/setting-descriptions.md`
   - key items -> `source/key-item-descriptions.md`
2. Generate a reference image for each new element using the built-in chat AI image generation capability, `image_gen`. Do not use an API-key-dependent image workflow, external image API, CLI image generator, stock asset, or manual asset service for required series reference images.
3. Save each reference image under `reference-images/` with a stable descriptive filename.
4. Reference those descriptions and images in the issue's `source/character-bible.md` or `source/page-script.md`.
5. Reuse the new reference image in page prompts whenever that element appears.

Reference images are required for all newly introduced recurring characters, settings, and key items in a series issue. Do not leave a recurring element as text-only continuity.

## Promoting A Standalone One-Shot To Issue #1

Use this checklist when a user asks to turn an existing top-level one-shot into the first issue of a new series:

1. Read the one-shot's `source/treatment.md`, `source/character-bible.md`, `source/page-script.md`, `assets/comic-pages/`, `output/pdf/`, and any existing catalog metadata.
2. Choose the new `series/<series-folder>/` slug from the requested series name, then create the standard series folder layout.
3. Move the complete one-shot folder contents into `series/<series-folder>/issues/issue-01/`. Preserve existing generated page images and PDFs unless the user asks for revisions.
4. Create `source/series.md` with the series title, logline, premise, tone, recurring visual language, and continuity notes inferred from the one-shot plus the user's requested series premise.
5. Create `source/character-descriptions.md`, `source/setting-descriptions.md`, and `source/key-item-descriptions.md` from the one-shot's recurring elements.
6. Generate `image_gen` reference images under `reference-images/` for recurring characters, settings, and key items that should persist beyond issue #1.
7. Create `source/issue-summaries.md` with an Issue #1 entry that names the moved one-shot, summarizes its plot, and records introduced continuity elements and reference images.
8. Add `## Issue Number` with value `1` to `issues/issue-01/source/treatment.md` if it is missing.
9. Rebuild the web app so the standalone catalog entry is replaced by the new series issue entry and generated series page.

Do not duplicate the same comic as both a standalone top-level comic and a series issue unless the user explicitly asks for an archival copy.

## Reference Image Style

All series reference images must use realistic candid photo-comic styling:

- documentary phone-photo or handheld photojournalism feel
- natural imperfect framing
- believable real-world lighting
- photoreal characters, locations, objects, materials, damage, and effects
- clear visual identifiers that can be reused in later issue prompts
- no anime, painted illustration, glossy poster art, or generic concept-art styling

Character references should look like candid photos of real people. Setting references should look like plausible real places photographed in the world. Key item references should look like physical objects photographed clearly enough for later prompt reuse.

## Description Entry Format

Use concise Markdown entries that are easy for future agents to quote into prompts:

```markdown
## Character: Name

- First appears: Issue #1, "Issue Title"
- Role: protagonist, antagonist, supporting character, etc.
- Visual identifiers: age range, face, hair, body type, outfit, color palette, posture, expression, signature prop.
- Continuity notes: powers, relationships, injuries, transformations, or status changes.
- Reference image: `../reference-images/name-character.png`
```

Use the same structure for settings and key items, changing the field names as needed:

```markdown
## Setting: Place Name

- First appears: Issue #1, "Issue Title"
- Visual identifiers: architecture, geography, lighting, palette, scale, era, signage, recurring props.
- Continuity notes: damage, ownership, secrets, changes over time.
- Reference image: `../reference-images/place-name-setting.png`
```

```markdown
## Key Item: Item Name

- First appears: Issue #1, "Issue Title"
- Visual identifiers: shape, size, materials, colors, markings, wear, how it is carried or used.
- Continuity notes: powers, limits, damage, ownership, story importance.
- Reference image: `../reference-images/item-name-key-item.png`
```

## Issue Summary Entry Format

Append a summary after the issue is complete:

```markdown
## Issue #1: Issue Title

- Folder: `series/<series-folder>/issues/issue-01/`
- Logline: One sentence.
- Plot summary: Short paragraph.
- Continuity changes: What changed by the end.
- New characters: Names or "None".
- New settings: Names or "None".
- New key items: Names or "None".
- Reference images added: Filenames or "None".
```

## Web App Build

After adding or updating a series issue, run:

```bash
node web-app/scripts/build-catalog.mjs
node web-app/scripts/build-share-pages.mjs
node web-app/scripts/build-pages-site.mjs
```

Verify that:

- `web-app/comics.json` includes the issue with the correct `series`, `issueNumber`, and `issueLabel`.
- `web-app/series/<series-folder>/index.html` exists.
- `web-app/sitemap.xml` includes the generated series page and issue page.
- Searching by series title, character, setting, or key item finds the related issue in the web app.
