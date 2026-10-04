# 15 concepts × 15 builds

Each episode teaches **one AI concept** and has the viewer **build one piece** of
the Thumbnail Agent. By episode 15 they have a deployed thumbnail designer.

This is the plan to build against. It stays a draft until Phase 4: the build and
the evals may merge, split or reorder episodes.

## The plan

### Part 1: Foundations (the "I can do this" part)

| # | Concept | What they build | What they see at the end |
| --- | --- | --- | --- |
| 1 | **Setup: what an AI app is made of** | Next.js app in the theme, AI SDK, API key in `.env` | The app running locally, styled like the final product |
| 2 | **The LLM call** | A concept box that sends the user's text to the model | 5 headline ideas for any video concept |
| 3 | **System prompt vs. user prompt** | The "Strategist" system prompt. The creator's concept stays the user prompt | Same concept, with and without the system prompt: generic vs. sharp |
| 4 | **Structured output** | The strategist returns a `Brief` as validated JSON | A brief card: hook, emotion, headline, objects |
| 5 | **Vision (multimodal input)** | The "Thumbnail analyst" reads the creator's past thumbnails | A table of their thumbnails, each with an AI description |

### Part 2: Making it an agent

| # | Concept | What they build | What they see at the end |
| --- | --- | --- | --- |
| 6 | **Classification: finding patterns** | The "Style librarian" groups thumbnails into reference types + brand kit | A "Your thumbnail styles" board, with examples per style |
| 7 | **Embeddings & retrieval** | Find the past thumbnails closest to a new concept | "For this concept, use style X, like these 3" |
| 8 | **Image generation with image inputs** | Generate a thumbnail from the creator photo + references + prompt | **The first generated thumbnail** |
| 9 | **Prompt chaining** | Brief → pick → image prompt writer → generator, each step feeding the next | A visible jump in quality vs. episode 8's single prompt |
| 10 | **Tool calling & the agent loop** | Give the model tools (`pick_reference`, `generate`, `edit`) and let it run | A live trace of the agent deciding its next step |
| 11 | **Self-critique** | The critic: face match, text spelling, phone readability, then an edit | v1 → v2 with scores going up |
| 12 | **Guardrails** | Hard gates (face, text), cost cap, round cap, badge zone, all in code | Bad outputs blocked, and the run stays under budget |

### Part 3: Making it real

| # | Concept | What they build | What they see at the end |
| --- | --- | --- | --- |
| 13 | **Memory** | Save the creator library and picks. Later runs follow the creator's taste | The second run already leans toward the creator's favourite style |
| 14 | **Evals** | 10 test concepts, a scorecard, and a pairwise "which would you click?" | A table showing v1 → vN improving |
| 15 | **Streaming + deploy** | Stream agent steps to the UI, deploy to Vercel | A live link, in the same theme, on their own domain |

## How the pieces connect

```
 1 Setup ─ 2 LLM call ─ 3 System prompt ─ 4 Structured output ─ 5 Vision
                                                                    │
 8 Image gen ◀─ 7 Retrieval ◀─ 6 Reference types ◀──────────────────┘
     │
 9 Chaining ─ 10 Agent loop ─ 11 Self-critique ─ 12 Guardrails
                                                        │
              15 Stream + deploy ◀─ 14 Evals ◀─ 13 Memory
```

## Where each concept lives in the system design

| Concept | Stage in `system-design.md` |
| --- | --- |
| 2–4 | G1 Brief (strategist prompt, `Brief` schema) |
| 5 | S1 Analyze thumbnails, S4 Tag photos |
| 6 | S2 Reference types, S3 Brand kit |
| 7 | G2 Pick reference |
| 8 | G4 Generate |
| 9 | G1 → G2 → G3 → G4 |
| 10 | The generate loop and its tools |
| 11 | G6 Critique, G7 Refine |
| 12 | G5 Guardrails, hard gates in G6 |
| 13 | G8 Results + memory |
| 14 | Section 8, Evals |
| 15 | UI + deploy |

## Real-app hooks (for the reel's "real app" beat)

These are candidates. At scripting time each hook must pass two tests:

1. The viewer uses the app weekly.
2. The concept genuinely runs in that app, or the comparison is clearly
   labelled as an analogy.

| # | Candidate hook |
| --- | --- |
| 2 | Every ChatGPT reply is one API call |
| 3 | The same chatbot behaves differently inside different apps (its system prompt) |
| 4 | Bill and receipt scanners turning a photo into fields |
| 5 | Google Lens |
| 6 | Photo apps grouping your pictures by person or place |
| 7 | Pinterest "more like this", Instagram Explore |
| 8 | Editing a photo by typing what you want in ChatGPT or Gemini |
| 9 | An assembly line: each station does one job |
| 10 | Assistants that set an alarm instead of describing one |
| 11 | An editor marking up your draft (analogy) |
| 12 | UPI daily limits: hard rules, not judgement |
| 13 | ChatGPT memory, Spotify knowing your taste |
| 14 | YouTube Test & Compare picking the winning thumbnail |
| 15 | ChatGPT typing word by word, live order tracking |
