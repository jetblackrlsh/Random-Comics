---
name: monomyth-comic-book-pdf
description: "Create complete Monomyth Comics issues as realistic candid photo-comic PDFs. Use for the Monomyth Comics series, for any comic that must follow all 17 Campbell Hero's Journey stages, or when a user asks for a 17-stage monomyth issue. Produces a cover plus exactly 17 story pages, one story page per stage, using image_gen for every comic page and reference image."
---

# Monomyth Comic Book PDF

## Overview

Use this skill to create Monomyth Comics issues: self-contained realistic photo-comics where each issue follows all 17 Campbell Hero's Journey stages with exactly one story page dedicated to each stage.

This skill is a series-specific variant of `skills/photo-comic-book-pdf`, but it intentionally exceeds that skill's 8-page limit. Keep the same realistic candid photo-comic style and text rules, while enforcing the Monomyth page contract.

## Output Contract

- Generate exactly 18 images total: page 1 is the cover, pages 2-18 are the 17 Hero's Journey story pages.
- Use the stage order in `references/hero_journey_17_stages.md` unless the user explicitly provides a different 17-stage list.
- Dedicate each story page to one stage. Do not merge, skip, rename beyond recognition, or add extra story pages.
- Use 4:5 portrait aspect ratio for every generated image.
- Make each image a complete realistic candid photo-comic page with its own panels and caption boxes.
- Use caption boxes only. Do not use speech bubbles, thought bubbles, floating subtitles, watermarks, logos, or later text overlays.
- Generate all readable story text directly inside the page art with `image_gen`.
- Do not include redundant caption boxes that literally repeat the same wording as an earlier caption on the same page.
- Do not number caption boxes or include caption labels such as "Caption 1" or "Caption 2" in the generated artwork.
- Do not include page numbers in the page artwork.
- Do not add narration, dialogue, title text, labels, captions, or page text afterward with code, PDF tooling, image editing, canvas drawing, HTML/CSS, or any other typesetting step.
- Keep the issue self-contained even when it belongs to the Monomyth Comics series.

## Workflow

1. Ground the issue.
   - Read `series/SERIES_WORKFLOW.md`.
   - Read the Monomyth series source files under `series/monomyth-comics/source/`.
   - Read `references/hero_journey_17_stages.md`.
   - Expand the user's premise into a full 17-stage arc with a clear protagonist, call, refusals, transformations, return complication, and final freedom.
   - If the user provides a short premise, make reasonable additions that preserve their names, theme, moral, ending, and genre.

2. Create or update continuity.
   - Follow the series continuity rules in `series/SERIES_WORKFLOW.md`.
   - Add every named character to `series/monomyth-comics/source/character-descriptions.md` with a `First appears` line before finalizing.
   - Add recurring settings and key items to their source files.
   - Generate required recurring reference images with `image_gen` only, in realistic candid photo-comic style.
   - Reuse existing reference images and descriptions instead of redesigning recurring elements.

3. Build the treatment.
   - Include `## Issue Number` and `## Title`.
   - Include a 17-stage outline with one stage per story page.
   - State the issue theme, moral tension, protagonist desire, protagonist fear, and ending choice.
   - Make sure the final stage gives emotional closure, not just plot closure.

4. Script the cover and 17 story pages.
   - Read `skills/photo-comic-book-pdf/references/photo_page_prompting.md` before writing final image prompts.
   - Page filenames must be:
     - `page-01-cover.png`
     - `page-02.png` through `page-18.png`
   - For each story page, include the stage name, stage function, panel layout, visual beats, caption-box text, continuity notes, camera feel, and lighting.
   - Keep caption text reader-facing only. Do not include prompt scaffolding, page numbers, panel labels, caption numbers, caption labels, prefixes, or stage labels inside the generated artwork unless the user explicitly wants visible stage labels.
   - Do not script two caption boxes on the same page with identical wording.
   - Prefer 3-4 large panels on lore-heavy or emotionally dense pages; use more panels only for compact action beats.

5. Generate images.
   - Use the built-in `image_gen` tool for every cover, story page, replacement page, and required reference image.
   - Generate one page at a time.
   - Repeat the stable character and reference bible in every prompt.
   - Prompt for "full realistic candid photo-comic page, 4:5 portrait aspect ratio" every time.
   - Repeat "caption boxes only, no speech bubbles, no thought bubbles" every time.
   - Repeat that all readable story text must be generated directly inside the page art and that blank caption boxes are not acceptable.
   - Repeat that caption boxes must not include caption numbers or caption labels and must not literally repeat the same wording as another caption on the same page.
   - Repeat that page numbers must not appear anywhere in the page artwork.

6. Assemble the PDF and previews.
   - Run from the issue root:

```bash
python ../../../skills/monomyth-comic-book-pdf/scripts/assemble_monomyth_comic_book_pdf.py \
  --pages-dir "assets/comic-pages" \
  --out "output/pdf/monomyth-comics-issue-##.pdf" \
  --preview-dir "tmp/monomyth-comic-book-pdf"
```

   - The wrapper enforces exactly 18 page images and delegates page normalization to the shared photo-comic assembler.
   - Do not add external captions, titles, borders, or page chrome during assembly.

7. Verify and finalize.
   - Inspect the contact sheet and at least the cover, pages 2, 6, 10, 14, and 18.
   - Confirm exact page count, 4:5 portrait pages, stage coverage, readable caption boxes, no page numbers in the artwork, no numbered caption boxes, no duplicate same-page caption wording, no speech bubbles, no later text overlays, realistic candid-photo style, and consistent recurring visuals.
   - Regenerate any page that fails core requirements before assembling the final PDF.
   - Append a completed issue entry to `series/monomyth-comics/source/issue-summaries.md`.
   - Rebuild the web app from the repo root:

```bash
node web-app/scripts/build-catalog.mjs
node web-app/scripts/build-share-pages.mjs
node web-app/scripts/build-pages-site.mjs
```

## Page Contract

Use this page mapping for every Monomyth issue:

```text
page-01-cover.png  Cover
page-02.png        Stage 01
page-03.png        Stage 02
page-04.png        Stage 03
page-05.png        Stage 04
page-06.png        Stage 05
page-07.png        Stage 06
page-08.png        Stage 07
page-09.png        Stage 08
page-10.png        Stage 09
page-11.png        Stage 10
page-12.png        Stage 11
page-13.png        Stage 12
page-14.png        Stage 13
page-15.png        Stage 14
page-16.png        Stage 15
page-17.png        Stage 16
page-18.png        Stage 17
```

The cover can foreshadow the entire journey, but it does not count as a Hero's Journey stage.

## Quality Bar

- The issue must read as a complete comic book when opened by itself.
- Each stage page must advance the story, not merely illustrate a checklist item.
- The protagonist's inner change must be visible through choices, not only caption exposition.
- The ending must resolve the central thematic question established in the premise.
- The story may have a morally uneasy or selfish resolution if the user's premise calls for it, but the protagonist's reasoning should be legible and emotionally earned.
