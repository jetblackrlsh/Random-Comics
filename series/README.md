# Series Folder Convention

Future series should live under this folder. The web app build pipeline will discover series folders here without changing app code.

For user-facing prompt shorthand, see `../PROMPTING.md`.

Read `SERIES_WORKFLOW.md` before creating or editing a series issue.

Use this layout:

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

`source/series.md` can use `## Title` and `## Logline` sections. Each issue can use `source/treatment.md` the same way standalone comics do. Add `## Issue Number` to an issue treatment when the folder name does not make the numbering obvious.

When a series issue introduces a new recurring character, setting, or key item, add a written description to the matching source file and create a reference image for it under `reference-images/`.

Create those required reference images with the built-in chat AI image generation capability, `image_gen`, not an API-key-dependent or external image workflow. Use realistic candid photo-comic styling for every series reference image.
