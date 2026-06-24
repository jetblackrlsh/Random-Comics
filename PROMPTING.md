# Prompting Cheat Sheet

Use these short prompts when asking an agent to make a comic.

If you are not sure what to ask for, use:

```text
What can you do in this Random Comics repo?
```

```text
Give me prompt templates for [one-shot comics / series shells / series issues / adding pages / turning a one-shot into a series].
```

The agent should answer with copy-pasteable templates and a short explanation of when to use each one.

## One-Shot Comic

```text
Create a Random Comics one-shot from this premise: [premise]
```

Use this for a standalone comic that should live as a top-level comic folder.

## Existing Series Issue

```text
Create the next issue of [Series Name] from this premise: [premise]
```

Use this for a comic that belongs to an existing series under `series/<series-folder>/`.

For Monomyth Comics, use:

```text
Create the next issue of Monomyth Comics from this premise: [premise]
```

Use this for an issue that must follow all 17 Hero's Journey stages. The agent should use `skills/monomyth-comic-book-pdf/SKILL.md`, create a cover plus exactly 17 story pages, generate all comic imagery with `image_gen`, assemble the PDF/previews, update continuity, and rebuild the web app.

For American Monomyth Comics, use:

```text
Create the next issue of American Monomyth Comics from this premise: [premise]
```

Use this for a complete 22-page superhero issue that follows the 10-step American Monomyth structure. The agent should use `skills/american-monomyth-comic-book-pdf/SKILL.md`, create a full-art cover, 20 story pages, and a poster-style back cover, use bright anime-inspired superhero comic art, generate all comic imagery with `image_gen`, assemble the PDF/previews, update continuity, and rebuild the web app.

## New Series Shell

```text
Create a new series shell called [Series Name]. Series premise: [series premise]
```

Use this when the series idea exists but issue #1 is not planned yet. The agent should create the series folder and source continuity files, but not create issue folders, comic pages, PDFs, or web-app comic entries.

## New Series And First Issue

```text
Create a new series called [Series Name] and make issue #1. Series premise: [series premise]. Issue premise: [issue premise]
```

Use this when the series does not exist yet. The agent should create the series folder, continuity files, reference images, and first issue.

## Add Pages To Existing Comic

```text
Add [number] pages to [Comic Title]. New story material: [premise or beats]
```

Use this when a standalone comic or series issue should be expanded in place. The agent should preserve existing pages, append new sequential page images, update source files, rebuild the PDF/previews, and rebuild the web app.

## Turn One-Shot Into Series

```text
Turn [One-Shot Title] into issue #1 of a new series called [Series Name]. Series premise: [series premise]
```

Use this when an existing top-level one-shot should become the first issue of a new series.

## Optional Add-Ons

Add these only when needed:

```text
Make it 4 pages.
Use this exact issue title: [title]
This should introduce [character/setting/key item].
Use these attached reference images.
Commit and push when done.
```

## Capability Questions

Use these when you want the agent to explain available workflows before you start:

```text
What can you do in this Random Comics repo?
```

```text
How should I prompt you to create a new comic?
```

```text
How should I prompt you to continue an existing series?
```

```text
How should I prompt you to revise or expand an existing comic?
```

The agent can help create standalone one-shots, create planning-only series shells, create new series with first issues, make the next issue of an existing series, add pages to an existing comic, turn a one-shot into issue #1 of a new series, create required series reference images with `image_gen`, update continuity files, rebuild PDFs/previews, rebuild the static web app, and commit/push changes when asked.
