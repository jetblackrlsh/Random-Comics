---
name: american-monomyth-comic-book-pdf
description: "Create complete American Monomyth Comics issues as bright, high-saturation, anime-inspired superhero comic PDFs. Use for the American Monomyth Comics series, for any comic that must follow the 10-step American Monomyth structure, or when a user asks for a 22-page American Monomyth superhero issue. Produces exactly 22 images: a full-art cover, 20 story pages paced as two pages per American Monomyth beat, and a poster-style back cover, using image_gen for every comic page and reference image."
---

# American Monomyth Comic Book PDF

## Overview

Use this skill to create American Monomyth Comics issues: self-contained superhero comics where an ordinary or innocent community is threatened, normal institutions fail, an exceptional hero appears, redemptive force restores order, and the hero remains separate from the community they saved.

This skill is a series-specific variant of `skills/photo-comic-book-pdf`, but it intentionally overrides that skill's 8-page limit and realistic photo-comic style. Keep the repo's `image_gen` and no-later-text-overlay rules, while enforcing the American Monomyth page contract and bright anime-inspired superhero art direction.

## Output Contract

- Generate exactly 22 images total:
  - Page 1 is a full-art cover.
  - Pages 2-21 are the 20-page story.
  - Page 22 is a poster-style back cover that summarizes the entire issue.
- Use the 10-step structure in `references/american_monomyth_10_steps.md`: two story pages per step.
- Make every issue a complete story that can be enjoyed in isolation, even when it shares continuity or includes crossovers.
- Use 4:5 portrait aspect ratio for every generated image.
- Use a colorful, high-saturation, high-detail, sharp, bright-glow, modern anime-inspired superhero comic aesthetic.
- Blend American superhero comic energy, modern anime dynamism, and bright digital illustration.
- Generate all readable story text directly inside the page art with `image_gen`.
- All readable narration, speech, and character thoughts must appear inside caption boxes generated directly in the art.
- Speech bubbles, dialogue balloons, thought bubbles, floating dialogue text, manga speech balloons, and comic-style bubble tails are not allowed in American Monomyth Comics.
- Caption text may be detailed and long when needed for story clarity, as long as it remains readable and fits cleanly in caption boxes.
- Do not include redundant caption boxes that literally repeat the same wording as an earlier caption on the same page.
- Do not number caption boxes or include caption labels such as "Caption 1" or "Caption 2" in the generated artwork.
- Do not include page numbers in the page artwork.
- Prioritize story clarity over minimalism: readers should easily understand what happened, why it happened, what each character wants, what is at stake, and how each page connects to the next.
- Do not add narration, dialogue, titles, labels, captions, poster text, back-cover copy, or page text afterward with code, PDF tooling, image editing, canvas drawing, HTML/CSS, or any other typesetting step.

## Style Contract

- Use bold superhero anatomy, iconic silhouettes, dramatic perspective, expressive anime faces, speed lines, impact frames, crisp line art, glowing powers, vibrant color identities, and readable action.
- Avoid muddy, dull, gray, overly realistic, documentary, candid-photo, painted oil, watercolor, noir, or stock-poster styling.
- Make major characters recognizable by silhouette, costume palette, symbol, power color, pose language, and visual contrast.
- Use glow as storytelling language for powers, portals, shields, villain surges, technology, sunrise restoration, and emotional climaxes.
- Keep action clear: visible direction of motion, distinct silhouettes, readable power colors, and an understandable result.
- For this series, recurring reference images must use the same bright anime-inspired superhero style. This is a series-specific exception to the repo's default realistic candid reference-image style.

## Text Contract

- Use caption boxes as the only readable text container for narration, speech, and character thoughts.
- Speech bubbles, dialogue balloons, thought bubbles, manga bubble tails, floating character dialogue, and unboxed spoken or thought text are forbidden.
- If a character speaks or thinks, rewrite that information as a caption box attributed by context instead of using a bubble.
- Caption boxes should be short, rectangular, visually clean, and placed where they do not cover important faces, action, or continuity details.
- Caption boxes may be longer or more detailed when the page would otherwise be ambiguous; use enough caption text to make plot, motivation, cause-and-effect, and emotional stakes easy to read and understand.
- Caption boxes must not be numbered, labeled, or written with prefixes like "Caption 1:".
- Page numbers must not appear anywhere in the page artwork.
- No caption box on a page may literally repeat the same wording as another caption box on that page.
- Do not make pages cryptic for the sake of brevity. American Monomyth Comics should be clear, accessible, and easy to follow.
- For poster-style back covers, any tagline or recap text should be integrated as clean poster caption boxes or rectangular text panels, not speech or thought bubbles.

## Workflow

1. Ground the issue.
   - Read `series/SERIES_WORKFLOW.md`.
   - Read the American Monomyth series source files under `series/american-monomyth-comics/source/`.
   - Read `references/american_monomyth_10_steps.md`.
   - Expand the user's premise into a complete American Monomyth superhero issue with a community worth saving, a mythic threat, failed ordinary institutions, helpless innocents, an exceptional hero, redemptive confrontation, restoration, separation, and withdrawal.
   - If the user provides a short premise, make reasonable additions that preserve their names, theme, moral, ending, and genre.

2. Create or update continuity.
   - Follow the series continuity rules in `series/SERIES_WORKFLOW.md`, except use this skill's anime-superhero reference-image style for American Monomyth Comics.
   - Add every named character to `series/american-monomyth-comics/source/character-descriptions.md` with a `First appears` line before finalizing.
   - Add recurring settings and key items to their source files.
   - Generate required recurring reference images with `image_gen` only, in the bright anime-inspired superhero style.
   - Reuse existing reference images and descriptions instead of redesigning recurring elements.

3. Build the treatment.
   - Include `## Issue Number` and `## Title`.
   - Include a 10-step outline with two story pages per step.
   - State the threatened community, the mythic evil, why institutions fail, the hero's exceptional quality, the redemptive action, the restoration, and why the hero cannot fully join the restored community.
   - State the issue theme, moral tension, hero desire, hero burden, and final withdrawal image.
   - Make the issue readable on its own without requiring prior issues.

4. Script the cover, 20 story pages, and back cover.
   - Page filenames must be:
     - `page-01-cover.png`
     - `page-02.png` through `page-21.png`
     - `page-22-back-cover.png`
   - For each story page, include the American Monomyth step name, step function, panel layout, visual beats, readable caption-box text, continuity notes, action clarity notes, color palette, glow effects, and emotional intent.
   - Keep visible page text reader-facing only. Do not include prompt scaffolding, page numbers, panel labels, caption numbers, caption labels, prefixes, or step labels inside the generated artwork unless the user explicitly wants visible step labels.
   - Prefer readable comic panels with integrated caption boxes. Short captions are fine for simple beats, but detailed captions are allowed and preferred when they improve comprehension. Avoid text so dense that image generation is unlikely to render it legibly.
   - Do not script two caption boxes on the same page with identical wording.
   - Do not script speech bubbles, dialogue balloons, thought bubbles, or unboxed spoken/thought text.

5. Generate images.
   - Use the built-in `image_gen` tool for every cover, story page, back cover, replacement page, and required reference image.
   - Generate one page at a time.
   - Repeat the stable character and reference bible in every prompt.
   - Prompt for "full colorful anime-inspired superhero comic page, 4:5 portrait aspect ratio" every time.
   - Repeat the issue's dominant style phrase: "high-saturation, high-detail, sharp crisp line art, bright glow effects, modern anime-inspired American superhero comic aesthetic."
   - Repeat that all readable story text must be generated directly inside caption boxes in the page art and that blank text boxes are not acceptable.
   - Repeat that speech bubbles, dialogue balloons, thought bubbles, and bubble tails are not allowed.
   - Repeat that caption boxes must not include caption numbers or caption labels and must not literally repeat the same wording as another caption on the same page.
   - Repeat that page numbers must not appear anywhere in the page artwork.

6. Assemble the PDF and previews.
   - Run from the issue root:

```bash
python ../../../../skills/american-monomyth-comic-book-pdf/scripts/assemble_american_monomyth_comic_book_pdf.py \
  --pages-dir "assets/comic-pages" \
  --out "output/pdf/american-monomyth-comics-issue-##.pdf" \
  --preview-dir "tmp/american-monomyth-comic-book-pdf"
```

   - The wrapper enforces exactly 22 page images and delegates page normalization to the shared photo-comic assembler.
   - Do not add external captions, titles, borders, page numbers, poster copy, or page chrome during assembly.

7. Verify and finalize.
   - Inspect the contact sheet and at least the cover, pages 2, 6, 10, 14, 18, 21, and 22.
   - Confirm exact page count, 4:5 portrait pages, all 10 steps covered, page-turn hooks on pages 3, 5, 7, 9, 11, 13, 15, 17, 19, and 21, readable integrated caption-box text, no page numbers in the artwork, no numbered caption boxes, no duplicate same-page caption wording, no speech or thought bubbles, no later text overlays, bright anime-inspired superhero style, and consistent recurring visuals.
   - Confirm the story works as a standalone issue.
   - Regenerate any page that fails core requirements before assembling the final PDF.
   - Append a completed issue entry to `series/american-monomyth-comics/source/issue-summaries.md`.
   - Rebuild the web app from the repo root:

```bash
node web-app/scripts/build-catalog.mjs
node web-app/scripts/build-share-pages.mjs
node web-app/scripts/build-pages-site.mjs
```

## Page Contract

Use this page mapping for every American Monomyth issue:

```text
page-01-cover.png       Full-art cover
page-02.png             Step 01, page 1: The Edenic Community
page-03.png             Step 01, page 2: The Edenic Community
page-04.png             Step 02, page 1: Evil Threatens the Community
page-05.png             Step 02, page 2: Evil Threatens the Community
page-06.png             Step 03, page 1: Ordinary Institutions Fail
page-07.png             Step 03, page 2: Ordinary Institutions Fail
page-08.png             Step 04, page 1: The Community Becomes Helpless
page-09.png             Step 04, page 2: The Community Becomes Helpless
page-10.png             Step 05, page 1: The Exceptional Hero Appears
page-11.png             Step 05, page 2: The Exceptional Hero Appears
page-12.png             Step 06, page 1: The Hero Resists Ordinary Limitations
page-13.png             Step 06, page 2: The Hero Resists Ordinary Limitations
page-14.png             Step 07, page 1: Redemptive Force Confronts Evil
page-15.png             Step 07, page 2: Redemptive Force Confronts Evil
page-16.png             Step 08, page 1: The Community Is Restored
page-17.png             Step 08, page 2: The Community Is Restored
page-18.png             Step 09, page 1: The Hero Does Not Fully Join the Community
page-19.png             Step 09, page 2: The Hero Does Not Fully Join the Community
page-20.png             Step 10, page 1: The Hero Withdraws or Waits
page-21.png             Step 10, page 2: The Hero Withdraws or Waits
page-22-back-cover.png  Poster-style back cover summary
```

## Quality Bar

- The issue must read as a complete comic book when opened by itself.
- The community must feel worth saving before the crisis dominates the issue.
- Institutional failure must create dramatic need without requiring every institution to be foolish or evil.
- The hero's victory must express the issue's central value, not only superior power.
- The final separation must be emotionally legible: noble, lonely, unsettling, rebellious, peaceful, or tragic depending on the premise.
- The back cover must feel like a collectible poster-style summary, not a plain text recap.
