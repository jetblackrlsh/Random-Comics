# Prompting Cheat Sheet

Use these short prompts when asking an agent to make a comic.

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

## New Series And First Issue

```text
Create a new series called [Series Name] and make issue #1. Series premise: [series premise]. Issue premise: [issue premise]
```

Use this when the series does not exist yet. The agent should create the series folder, continuity files, reference images, and first issue.

## Optional Add-Ons

Add these only when needed:

```text
Make it 4 pages.
Use this exact issue title: [title]
This should introduce [character/setting/key item].
Use these attached reference images.
Commit and push when done.
```
