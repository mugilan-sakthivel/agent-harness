# Thumbnail Agent

An AI agent that designs YouTube thumbnails in a creator's own brand style. It is
also the project we build, measure and polish privately before turning it into
the "Build your first agent" series.

This folder is a fresh project. It does not use or depend on anything else in
this repo.

## What it does

**Setup, once per creator**

- **Creator photos:** 3–5 HD photos of the creator, with different expressions.
- **Past thumbnails:** 20–30 thumbnails from their channel, each with its title.
  The agent finds the creator's **reference types** (their recurring thumbnail
  styles) and their **brand kit** from these.

**Generate, every video**

- **User prompt:** any video concept, typed in plain words.
- The agent writes a brief, picks the reference type that fits, writes an image
  prompt, generates the thumbnail with an image model (OpenAI or Gemini) using
  the creator's photo and the chosen references, then critiques and refines it.
- **Output:** 3 thumbnail options at 1280×720, each with scores and the reason
  its style was picked.

**Stack:** Next.js, Vercel AI SDK, Gemini for text and vision, and OpenAI or
Gemini for images. The UI follows the claude.dev look in light mode (see
`design/`).

## The plan

We build first, measure, and decide on the series last.

| Phase | What happens | Done when |
| --- | --- | --- |
| **0. Design** (we are here) | Agree on the system design, the 15-episode plan and the UI theme | You sign off on `docs/system-design.md` and the `design/` prototypes, and send the test assets |
| **1. Spikes** | Test the 6 riskiest parts (face, style, text, critic, SDK, cost) on their own before building the app | Each spike gives a clear yes or no (section 10 of the system design) |
| **2. Build v1** | Build the stages in order. Each stage has an acceptance check. Keep a build log with screenshots and failures | One concept goes in, and 3 thumbnails plus a results page come out |
| **3. Evals and optimise** | Run a fixed test set, change one thing at a time, and track scores per version | Scores stop improving, or the agent beats your handmade thumbnails in blind picks |
| **4. Freeze and package** | Lock the final concept list and episode count, then write each episode kit and test every build prompt | Every build prompt reproduces its stage from the previous checkpoint |
| **5. Record and publish** | Record the reels and publish the pages | Episodes go live |

**Why we record last.** Optimising will change the earlier stages. You will
change a schema, a prompt or a template, and if those episodes are already
recorded, they become wrong and viewers' code drifts away from ours. So we write
the docs and prompts while building, when the details are fresh, and record only
after Phase 4. The build log from Phases 2 and 3 (failures, before and after
images, score jumps) becomes the raw material for the "proof" beat in every reel.

## Folder layout

```
thumbnail-agent/
  HANDOFF.md           # current status, decisions, next steps: read this first
  docs/
    system-design.md   # architecture, prompts, stages, data contracts, evals, spikes
    concepts.md        # 15 concepts x 15 builds: the episode plan
    episode-kit.md     # what each episode contains: reel, page, build prompt, output
  design/              # theme tokens + HTML prototypes (app screens, episode page)
  spikes/              # Phase 1 experiments: setup stage, critic, image calls (TypeScript, AI SDK v7)
  # added in later phases:
  app/                 # the agent and its UI
  evals/               # test briefs and the results log per version
  episodes/            # one folder per episode: script, build prompt, page
  data/                # creator photos and thumbnails (gitignored, never committed)
```

**Note:** this repo is public. Creator photos and other creators' thumbnails go
in `data/`, which is gitignored, and never get committed.
