# Episode kit: what every episode contains

Every episode is **one concept** mapped to **one stage** of the thumbnail agent.
It ships as four pieces that point to each other.

```
Reel (60–90s) ──"comment KEYWORD"──▶ Learning page (hosted HTML)
                                        ├─ Doc: the concept in plain words
                                        ├─ Interactive: animated steps they can click
                                        ├─ Quiz: test yourself
                                        ├─ Build prompt: paste into your AI coding assistant
                                        └─ Output: what you'll have when you're done
```

## 1. The reel (60–90s)

The five beats from the series format, adapted for build episodes:

| Time | Beat | Job | What's on screen |
| --- | --- | --- | --- |
| 0–3s | **Hook** | Reach | This episode's output, e.g. "My agent just rejected its own thumbnail" |
| 3–15s | **Real app** | Reach | Where this concept runs in an app they already use |
| 15–45s | **Concept** | Understanding | One idea, one animation (the same animation as the page) |
| 45–70s | **In our agent + proof** | Trust | The pipeline map with this stage lit up, then the real output before and after, from our build |
| 70–90s | **Bridge** | Retention | "Comment KEYWORD. The page has the interactive and the prompt to build it." |

**Recurring visual: the pipeline map.** The same diagram appears in every
episode, with the current stage highlighted. Viewers always know where they are
in the build, and the series feels like one journey.

**The proof beat uses real artefacts only.** That means a real JSON, a real
render, a real score from `evals/results.md`, or a real failure from the build
log. Never use mock-ups.

## 2. The learning page (HTML, hosted on your site)

| Section | What it contains |
| --- | --- |
| **The idea** | 150–250 words, plain language, one diagram. Includes the real-app example from the reel |
| **Interactive** | Animated steps they can click through, or a control they can change and watch the result. Uses our agent's **real data** |
| **Quiz** | 3–5 questions. At least one asks them to *predict* what the agent will do |
| **Build it** | The build prompt (section 3), copyable, plus the acceptance check |
| **What you'll have** | A screenshot or live demo of this stage's output, and a link to the checkpoint |
| **Next** | A link to the next episode's page |

## 3. The build prompt

This is the prompt viewers paste into their AI coding assistant (Claude Code,
Cursor, etc.) to build this stage on top of the previous one.

Structure:

```
Context:     where the project is now (the previous checkpoint) and what this stage adds
Task:        what to build, in steps
Constraints: stack, file locations, schemas to use (copied from system-design.md)
Done when:   the acceptance check, something they can see and verify
```

**Replay test (required before publishing):** start a fresh coding-assistant
session on the previous checkpoint, paste the prompt exactly as published, and
confirm the acceptance check passes. If it fails, fix the prompt, not the code.
If our prompt doesn't work, viewers can't follow the series.

**Checkpoints:** every episode has a git tag (`ep-07-render-tool`, ...). A viewer
who falls behind can jump straight to it.

## 4. The output

After each episode the viewer has a working, slightly bigger agent, and
something visible to show for it. The final output across the whole series is
a hosted page where anyone can upload a brand, photos and references and get 3
thumbnails back.

---

## Worked example: Self-critique (episode 11)

Use this to judge whether the format works before we commit to it.

**Reel**

- **Hook (0–3s):** split screen. On the left, the agent's first thumbnail. Over
  it, the agent's own note: "That's not his face. Face match 2/5. Rejected."
- **Real app (3–15s):** "An editor marks up your draft before it goes out. We
  gave the agent its own editor." (This is clearly labelled as an analogy.)
- **Concept (15–45s):** two roles, the designer and the critic. The critic has
  a rubric, compares the face with the real photo, reads the text back, checks
  it at phone size, and returns one specific edit, not vibes. Face and text are
  hard gates.
  The loop has a limit, and the best version wins, not the last one.
- **In our agent (45–70s):** the pipeline map with Critique lit up. Then the
  real critique JSON, and the v1 → v2 renders with their real scores from the
  results log.
- **Bridge (70–90s):** "Comment CRITIC and I'll send you the page and the prompt."

**Interactive:** the viewer plays critic first. They score 3 real renders from
our build (one with a drifted face, one with a misspelled word, one good), then
reveal the agent's scores next to their own. A phone-size toggle shows why
small text fails.

**Quiz (sample):**

1. Why does the critic look at the thumbnail at 320×180?
2. The score went 3.6 → 3.4 in round 2. Which version does the agent return?
3. "Image is not 16:9" should be caught by the model or by code. Which one, and why?

**Build prompt "Done when":** run the critic on our planted bad thumbnails
(drifted face, misspelled headline, tiny text). It fails each one on the right
rubric line and returns an edit instruction. After one refine round, the
misspelled one passes text accuracy.

**What you'll have:** the results page now shows each round with before and
after images and scores.

---

## Episode folder (created in Phase 4)

```
episodes/11-self-critique/
  script.md        # the 5 beats with timings and the shot list
  prompt.md        # the build prompt, with its replay-test result and date
  page/index.html  # the learning page
  assets/          # real renders and JSON taken from the build log
```
