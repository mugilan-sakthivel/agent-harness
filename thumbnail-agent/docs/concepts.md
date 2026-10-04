# Concepts: what we teach, and where each one lives in the agent

This is a **candidate list, not the final episode list.** We lock the final list
and the episode count in Phase 4, after the agent is built and optimised. Some
concepts will merge, some will split, and the build will tell us which ones are
worth a full episode.

The rule stays the same: **one concept per reel**, and every concept points to
a real stage of the thumbnail agent.

## The map

| # | Concept | Where it lives | What the viewer sees after building it | Real-app hook (candidate) |
| --- | --- | --- | --- | --- |
| 1 | Setup | Project, API key, first run | App runs locally, key works | — |
| 2 | LLM call | S4 (simplest form) | 3 headline ideas for a video title | Every ChatGPT reply is one API call |
| 3 | System prompt | S4 planner, S7 critic | Same brief, two very different styles of output | Support bots that each have a "personality" |
| 4 | Structured output | S1, S4, S7 (all JSON) | 3 concepts as validated JSON, not a paragraph | Bill/receipt scanners turning a photo into fields |
| 5 | Vision (multimodal) | S1 brand extraction, S2 photo tags | `brand.json` read from their own past thumbnails | Google Lens |
| 6 | Context engineering | Digest once, reuse as text (decision 4) | Faster, cheaper runs. The model "knows" the brand without seeing 30 images every time | Why ChatGPT forgets the start of a long chat |
| 7 | Tool calling | S5 render tool | **First real thumbnail PNG** | Assistants that set an alarm instead of describing one |
| 8 | Workflow vs. agent | S0–S3 vs. S4–S7 | The pipeline map, with the agent part highlighted | "Most AI agents are mostly workflows" |
| 9 | Agent loop | S4 → S5 → S6 → S7 | A step-by-step trace of the agent's think → act → observe cycle | Maps rerouting when traffic changes |
| 10 | Self-critique | S7 critic + loop control | v1 → v2 → v3 with scores going up | An editor marking up your draft |
| 11 | Guardrails | S6 code checks | Agent rejects tiny text and a covered face without a model call | UPI daily limits: hard rules, not judgment |
| 12 | Memory | Brand kit + creator picks | Second run already matches the creator's taste better | ChatGPT memory, Spotify knowing your taste |
| 13 | Human in the loop | S8 "pick this one", editing `brand.json` | Creator corrects the agent and it sticks | Gmail Smart Compose: you press Tab to accept |
| 14 | Evals | `evals/` test set + results log | A table showing v1 → vN getting better | YouTube Test & Compare picking a winner |
| 15 | Streaming UI | Live run view | Viewers watch the agent think and render in real time | ChatGPT typing word by word, live order tracking |
| 16 | Deploy | Vercel + render service | A live link they can share | — |
| 17 | Retrieval / embeddings *(optional)* | S3 at scale: pick closest references | Right references picked automatically from a big library | Pinterest "more like this", Instagram Explore |

## Phase grouping (from the earlier 15-reel plan, updated)

- **Foundations:** 1–6. By the end, the agent can read a brand and plan concepts
  as JSON, with no image yet.
- **Making it an agent:** 7–11. By the end, it renders, checks and fixes its own
  thumbnails.
- **Making it real:** 12–17. By the end, it remembers, gets measured, streams,
  and is live.

## What changed from the earlier 15-reel list

- **Added:** context engineering (#6). You asked for HD photos and 10 references
  "as context", and how to do that without wasting calls is a concept on its own.
- **Added:** workflow vs. agent (#8). It's a strong trust beat, and it sets up
  the agent loop.
- **Added:** human in the loop (#13). The creator's pick drives memory.
- **Made optional:** retrieval (#17). With 10 references it isn't needed. It
  earns a place only if we grow the reference library.

## How we pick the real-app hooks

The "Real-app hook" column is a starting point. At scripting time each hook must
pass two tests:

1. The viewer uses the app weekly.
2. The concept genuinely runs in that app, or the comparison is clearly labelled
   as an analogy.

If a hook fails either test, pick a different hook. Don't stretch the claim.
