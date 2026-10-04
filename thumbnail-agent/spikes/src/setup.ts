// Setup stage on one creator: analyze thumbnails (vision) -> group into
// reference types + brand kit. Text/vision models only (free tier works).
//   npx tsx src/setup.ts epaphraa
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { google } from "@ai-sdk/google";
import { generateText, Output, type ModelMessage } from "ai";
import { z } from "zod";
import { DATA, OUT, REFS, ROOT, TEXT_MODEL, img, logCall, writeJson } from "./lib.ts";
import { BrandKit, ReferenceType, ThumbnailNote } from "./schemas.ts";

const creator = process.argv[2] ?? "epaphraa";
const outDir = join(OUT, "setup", creator);
const prompt = (name: string) => readFileSync(join(ROOT, "spikes/prompts", name), "utf8");

type Video = { id: string; title: string; view_count: number | null; thumbnail: string | null };
const videos: Video[] = JSON.parse(readFileSync(join(DATA, "videos.json"), "utf8"))
  .filter((v: Video) => v.thumbnail);

async function call<T>(label: string, args: Parameters<typeof generateText>[0]) {
  const t0 = Date.now();
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await generateText({ ...args, maxRetries: 0 });
      logCall({ at: new Date().toISOString(), kind: "text", model: TEXT_MODEL, label, ms: Date.now() - t0,
        inputTokens: r.usage.inputTokens, outputTokens: r.usage.outputTokens, ok: true });
      return r.output as T;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // A daily quota will not recover by retrying: stop now (progress is cached).
      if (attempt >= 3 || /PerDay|per day|retry in \d+h/i.test(msg)) {
        logCall({ at: new Date().toISOString(), kind: "text", model: TEXT_MODEL, label, ms: Date.now() - t0, ok: false, error: msg.slice(0, 300) });
        throw err;
      }
      console.warn(`${label}: attempt ${attempt} failed (${msg.slice(0, 120)}), retrying in ${20 * attempt}s`);
      await new Promise((r) => setTimeout(r, 20_000 * attempt));
    }
  }
}

// 1. Analyze thumbnails in batches of 4, with the creator photo as Image 1.
const BATCH = 4;
const notes: ThumbnailNote[] = [];
for (let i = 0; i < videos.length; i += BATCH) {
  const batch = videos.slice(i, i + BATCH);
  const cache = join(outDir, `notes.batch-${i / BATCH + 1}.json`);
  if (existsSync(cache)) { notes.push(...JSON.parse(readFileSync(cache, "utf8"))); continue; }
  const content: Extract<ModelMessage, { role: "user" }>["content"] = [
    { type: "text", text: "Image 1: reference photo of the creator." },
    { type: "file", mediaType: "image/jpeg", data: img(join(REFS, "t_budget.jpg")) },
  ];
  for (const v of batch) {
    content.push({ type: "text", text: `THUMBNAIL ${v.id} | title: ${v.title}` });
    content.push({ type: "file", mediaType: "image/jpeg", data: img(join(DATA, v.thumbnail!)) });
  }
  const out = await call<{ notes: ThumbnailNote[] }>(`analyst batch ${i / BATCH + 1}`, {
    model: google(TEXT_MODEL),
    instructions: prompt("analyst.v1.md"),
    messages: [{ role: "user", content }],
    output: Output.object({ schema: z.object({ notes: z.array(ThumbnailNote) }) }),
  });
  writeJson(cache, out.notes);
  notes.push(...out.notes);
  console.log(`analyzed ${notes.length}/${videos.length}`);
}
writeJson(join(outDir, "notes.json"), notes);

// 2. Group into reference types + brand kit (text only).
const views = Object.fromEntries(videos.map((v) => [v.id, v.view_count]));
const library = await call<{ types: ReferenceType[]; brandKit: BrandKit }>("librarian", {
  model: google(TEXT_MODEL),
  instructions: prompt("librarian.v1.md"),
  prompt: JSON.stringify(notes.map((n) => ({ ...n, views: views[n.id] ?? null }))),
  output: Output.object({ schema: z.object({ types: z.array(ReferenceType), brandKit: BrandKit }) }),
});
writeJson(join(outDir, "library.json"), library);

for (const t of library.types) {
  console.log(`\n## ${t.name} (${t.exampleIds.length} thumbnails, avg ${Math.round(t.avgViews).toLocaleString()} views, needs: ${t.needsOtherPeople})`);
  console.log(`use when: ${t.useWhen.join("; ")}`);
}
console.log("\nbrand kit:", JSON.stringify(library.brandKit, null, 2));
