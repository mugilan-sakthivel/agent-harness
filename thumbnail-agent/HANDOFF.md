# Handoff: where the Thumbnail Agent stands (2026-10-04)

Read this first in any new session. Then read `docs/system-design.md` (how the
agent works) and `docs/concepts.md` (the 15-episode plan).

## Repos

| Repo | What | Where on the Mac |
| --- | --- | --- |
| `mugilan-sakthivel/agent-harness` (public), branch `claude/tender-meitner-vm6kbo` | Plan + code, in `thumbnail-agent/` | wherever you clone it |
| `mugilan-sakthivel/thumbnail-agent-data` (**private**) | Creator data: `raw/` (28 thumbnails + `.info.json`), `videos.json`, `photos/` (4 Instagram screenshots) | `~/epaphraa` |

**Never commit** to the public repo: keys, the creator's photos or thumbnails,
generated images, or analysis output. These live in `data/`, `output/` and
`.env`, which are all gitignored.

## Decisions so far

- **Image model draws everything, including the text.** 3 options per run, each
  with 1 generate plus up to 2 edits, so at most 9 image calls per run.
- **Stack:** Next.js + Vercel AI SDK **v7**. Notes for v7:
  - The system prompt goes in `instructions`, not `system`.
  - Structured output is `generateText({ output: Output.object({ schema }) })`.
  - Images are `generateImage({ model, prompt: { text, images }, aspectRatio })`.
- **First creator:** Explore with Epaphra (`@epaphraa`), a Tamil channel with
  thumbnail text in English.
- **v1 covers only the styles where he is the only real person:** "Creator &
  Concept Props" and "Visual Narrative / Split". The podcast style comes later,
  with a guest photo the creator supplies. No style that generates real public
  figures.
- **HTML/UI design** is handled separately in another session. `design/` is a
  work-in-progress snapshot and the plan doesn't depend on it.

## Done

- `docs/`: system design v0.2, the 15×15 episode plan, the episode kit.
- **Creator data:** 28 of his latest 30 long-form videos (2 are members-only),
  fetched with `spikes/fetch_channel.sh`.
- **`spikes/`** (TypeScript, AI SDK v7):

| File | What it does |
| --- | --- |
| `src/lib.ts` | Env, paths, Gemini image call, call log (`output/spikes/calls.jsonl`) |
| `src/schemas.ts` | zod: `ThumbnailNote`, `ReferenceType`, `BrandKit`, `Critique` |
| `src/setup.ts` | **Setup stage:** analyst (vision, batches of 4) → librarian → reference types + brand kit. Resumable per batch |
| `src/s4_critic.ts` | Spike 4: critic on 1 real thumbnail + 3 planted problems (wrong text, wrong face, tiny text) |
| `src/s5_smoke.ts` | Spike 5: one image call with his photo as input |
| `prompts/*.v1.md` | analyst, librarian, critic system prompts |
| `make_refs.sh` | Recreates his identity crops in `output/spikes/refs/` from the data repo |

- **The setup stage ran** (with `gemini-2.5-flash`) and found 5 reference
  types plus a brand kit (red labels, bold white uppercase text, small
  "EXPLORE WITH EPAPHRA" watermark). The result files `notes.json` and
  `library.json` are not in git. Re-create them with `npm run setup`.
- **Problems found in that run** (first eval material):
  - one thumbnail was put in 2 types
  - the note for one thumbnail (Sterlite) came back empty ("?")
  - the accent colour (green) is questionable
  - the watermark was misread as "EPARTHA"
  - "avoid neutral expressions" contradicts his serious-face style

## Not done / blocked

| Spike | Status |
| --- | --- |
| 5: image call via AI SDK | The call shape is confirmed, but **no Gemini key has billing**, so the image free quota is 0 on all three Google keys. OpenAI was blocked by the cloud network but **works locally** |
| 1–3: face / style / text | Not run (needs images) |
| 4: critic | Written, never completed. Hit the free tier limit (5 requests/min, 20/day for 3.x flash) and "high demand" errors |
| 6: cost | Not run |

## Budget rules

- **OpenAI: $1 total, hard stop.**
  - Check the model list and current image prices first.
  - Start with the cheapest image model at low or medium quality.
  - Make one image at a time and log the cost of each call.
  - Stop at $0.90 and ask.
  - Use the expensive models only for the final comparison.
- **Gemini (free keys)** handles text and vision: analysis, brief and critic.
  - Stay under 5 requests per minute.
  - The 3.x Flash models allow about 20 requests a day. `gemini-2.5-flash` allows more.
  - Use one key per job. Don't rotate free keys to get around Google's limits.

## Run it on the Mac

```bash
cd ~/agent-harness            # or: git clone https://github.com/mugilan-sakthivel/agent-harness && cd agent-harness
git fetch origin && git checkout claude/tender-meitner-vm6kbo && git pull
cd thumbnail-agent/spikes && npm install
```

Create `thumbnail-agent/.env` (gitignored). Use full paths, because `~` doesn't work there:

```
GOOGLE_GENERATIVE_AI_API_KEY=<gemini key>
OPENAI_API_KEY=<openai key>
CREATOR_DATA=/Users/mugilansakthivel/epaphraa
TEXT_MODEL=gemini-2.5-flash
```

Then:

```bash
npm run refs      # identity crops (needs ffmpeg)
npm run setup     # analysis -> reference types + brand kit
npm run critic    # spike 4
```

## Next steps, in order

1. **Rotate every key that was pasted in chat** (3 Google, 1 OpenAI), and put the new ones in `.env`.
2. Run spike 4 (`npm run critic`, 4 calls). Did it catch the wrong text, the wrong face and the tiny text?
3. Add OpenAI images to `lib.ts`:
   - use `@ai-sdk/openai` and `openai.image(<model>)` with `prompt: { text, images }`
   - read the cost from the response usage
   - make one smoke image first (spike 5)
4. Spikes 1–3, with at most about 6 images:
   - use 3 of his real titles in the two v1 styles, plus 1 new concept
   - leave the real thumbnail out of the style references
   - show each result next to his real one
5. Write `docs/spike-report.md`: findings, scores and cost per run. Keep
   images out of the public repo.
6. Decide go or no-go, then move to Phase 2 and build the Next.js app.

## Prompt to paste into the new chat

> We're building the Thumbnail Agent. Repo: this one, branch
> `claude/tender-meitner-vm6kbo`, folder `thumbnail-agent/`. Read
> `thumbnail-agent/HANDOFF.md` first, then `docs/system-design.md`. We're in
> Phase 1 (spikes). Keys are in `thumbnail-agent/.env`. The creator data is at
> `/Users/mugilansakthivel/epaphraa`. Continue from "Next steps": run the critic
> spike, then add OpenAI image generation and run the image spikes. **Hard
> budget: $1 on OpenAI.** Check prices first, make one image at a time, log the
> cost of every call, and stop at $0.90 and ask me. Use free Gemini for
> text/vision and respect its rate limits. Never commit keys, creator photos,
> thumbnails or generated images (the repo is public). Show me each generated
> thumbnail next to his real one.
