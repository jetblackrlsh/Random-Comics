# Dream Anime Chronicles Agent Instructions

These instructions apply to `series/dream-anime-chronicles/`.

## Series Identity

Dream Anime Chronicles is based on Dream Anime characters created with generative AI from the dreams of Nicholas Alexander Benson. Treat Dream Anime Wiki articles and user-provided Dream Anime lore as continuity inputs for character powers, personality, motivations, and backstory.

## Visual Style

All Dream Anime Chronicles comic pages and series reference images must use a modern anime aesthetic, not the repo's default realistic photo-comic look.

Required visual language:

- highly colorful anime art
- high color saturation
- high detail sharpness
- bright glow and luminous energy effects
- dynamic shots, strong posing, and dramatic camera angles
- crisp modern anime character design
- clean readable comic-page composition

Do not use muted documentary realism, candid phone-photo framing, photoreal people, naturalistic news photography, or low-saturation cinematic realism for this series unless the user explicitly requests a one-off exception.

## Story Patterns

Character introduction stories should:

- introduce a specific Dream Anime character's backstory, powers, personality, and motivations
- tie the main conflict directly to that character's personal goal
- force the character to fail multiple times while testing the wrong power, tactic, or emotional approach
- end with the character choosing the power or strategy that defines who they are
- work as the first and last story a reader would need to understand the character
- end with a ninth page that acts as both a character poster and full-issue summary page. This page must feature the introduced character in a strong poster composition plus one large readable caption box that summarizes the entire issue.

Versus battles should:

- pit pre-existing series characters against each other because their motivations directly clash
- compare and contrast personalities, backstories, powers, and goals through action
- require both combatants to use powers strategically
- end with a clear winner
- never permanently kill either combatant

## Text And Image Generation

- Generate all comic page art, cover art, and reference images with the built-in chat AI image generation capability, `image_gen`.
- All readable story text, title text, labels, captions, or dialogue must be generated directly inside the page art by `image_gen`.
- Do not add story text after generation with code, image editing, PDF tooling, HTML/CSS, canvas drawing, or manual typesetting.
- Use caption boxes for narration and rare short dialogue. Avoid speech bubbles and thought bubbles unless a user explicitly requests them for this series.

## Recovering Built-In `image_gen` Outputs

When `image_gen` renders an image in chat but does not save a local file path, recover the generated PNG from the active Codex session log instead of regenerating it with another tool.

1. Find the current thread id from `nodeRepl.requestMeta["x-codex-turn-metadata"].thread_id` or from `.codex/session_index.jsonl`.
2. Open the matching session log under `C:\Users\jetbl\.codex\sessions\<yyyy>\<mm>\<dd>\rollout-*-<thread-id>.jsonl`.
3. Find the `event_msg` line for the image generation item. The generated-image id is stored in `payload.call_id`, and the base64 PNG is stored in `payload.result`. In `read_thread` output the same image may appear as an `imageGeneration` item with `result` and `savedPath: null`.
4. Decode `payload.result` with `[Convert]::FromBase64String(...)` and save it to the intended repo path, such as `reference-images/<name>.png` or `issues/<issue>/assets/comic-pages/page-##.png`.
5. Inspect the saved image before using it as continuity or assembling the PDF.
