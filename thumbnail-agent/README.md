# Thumbnail Agent

An AI agent that designs YouTube thumbnails in a creator's own brand style. It is
also the project we build, measure and polish privately before turning it into
the "Build your first agent" series.

This folder is a fresh project. It does not use or depend on anything else in
this repo.

## What it does

**Inputs**

1. **Brand thumbnails**: the creator's past thumbnails, pulled from their channel
   or uploaded. The agent learns the brand from these.
2. **Creator photos**: HD photos of the creator, in different expressions.
3. **Reference thumbnails**: 10 thumbnails the creator likes and wants to learn from.
4. **Brief**: the video title or topic, the hook, and the language for the text.

**Output**: 3 thumbnail options at 1280×720. Each one is critiqued, fixed and
scored, and shown on an HTML results page you can host on your site.

## The plan

We build first, measure, and decide on the series last.

| Phase | What happens | Done when |
| --- | --- | --- |
| **0. Design** (we are here) | Agree on the system design and the concept list | You sign off on `docs/system-design.md` and send the test assets |
| **1. Spikes** | Test the 4 riskiest parts on their own before building anything big | Each spike gives a clear yes or no (see "Risks" in the system design) |
| **2. Build v1** | Build the stages in order. Each stage has an acceptance check. Keep a build log with screenshots and failures | One brief goes in and 3 thumbnails plus a results page come out |
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
  docs/
    system-design.md   # architecture, stages, data contracts, evals, risks
    concepts.md        # which AI concepts we teach and where each one lives in the agent
    episode-kit.md     # what each episode contains: reel, page, build prompt, output
  # added in later phases:
  spikes/              # Phase 1 throwaway experiments
  app/                 # the agent and its UI
  evals/               # test briefs and the results log per version
  episodes/            # one folder per episode: script, build prompt, page
  data/                # creator photos and thumbnails (gitignored, never committed)
```

**Note:** this repo is public. Creator photos and other creators' thumbnails go
in `data/`, which is gitignored, and never get committed.
