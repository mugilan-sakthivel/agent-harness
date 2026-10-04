// Spike 4: does the critic catch planted problems? Vision model only.
//   npx tsx src/s4_critic.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import sharp from "sharp";
import { DATA, OUT, REFS, ROOT, TEXT_MODEL, img, logCall, writeJson } from "./lib.ts";
import { Critique } from "./schemas.ts";

type Case = { id: string; image: string; headline: string; creatorExpected: boolean; expect: string };
const videos: { id: string; thumbnail: string }[] = JSON.parse(readFileSync(join(DATA, "videos.json"), "utf8"));
const raw = (id: string) => join(DATA, videos.find((v) => v.id === id)!.thumbnail);

const cases: Case[] = [
  { id: "control-real", image: raw("Vm5bmuawqRM"), headline: "WHY SO EXPENSIVE", creatorExpected: true,
    expect: "ship: his real thumbnail with the right headline" },
  { id: "planted-wrong-text", image: raw("Vm5bmuawqRM"), headline: "WHY SO CHEAP", creatorExpected: true,
    expect: "revise on textAccuracy (image says EXPENSIVE, brief says CHEAP)" },
  { id: "planted-wrong-face", image: raw("VzFl-mFN9fs"), headline: "DMK KILLED TAMIL ECONOMY?", creatorExpected: true,
    expect: "revise on faceMatch (creator not in this thumbnail)" },
  { id: "planted-tiny-text", image: join(OUT, "s4/planted_tiny_text.jpg"), headline: "PETROL PRICES WILL DOUBLE", creatorExpected: true,
    expect: "revise on phoneReadability (22px headline)" },
];

const instructions = readFileSync(join(ROOT, "spikes/prompts/critic.v1.md"), "utf8");
const results = [];
for (const c of cases) {
  const full = await sharp(c.image).resize(1280, 720).jpeg().toBuffer();
  const small = await sharp(c.image).resize(320, 180).jpeg().toBuffer();
  await new Promise((res) => setTimeout(res, 15_000)); // free tier: 5 requests/minute
  const t0 = Date.now();
  const r = await generateText({
    model: google(TEXT_MODEL),
    instructions,
    maxRetries: 3,
    messages: [{ role: "user", content: [
      { type: "text", text: "Image 1: creator reference photo." },
      { type: "file", mediaType: "image/jpeg", data: img(join(REFS, "photo_airport.jpg")) },
      { type: "text", text: "Image 2: thumbnail, full size." },
      { type: "file", mediaType: "image/jpeg", data: full },
      { type: "text", text: "Image 3: same thumbnail at phone size (320x180)." },
      { type: "file", mediaType: "image/jpeg", data: small },
      { type: "text", text: `Brief: intended headline = "${c.headline}". Creator should appear: ${c.creatorExpected ? "yes" : "no"}.` },
    ] }],
    output: Output.object({ schema: Critique }),
  });
  logCall({ at: new Date().toISOString(), kind: "text", model: TEXT_MODEL, label: `critic ${c.id}`, ms: Date.now() - t0,
    inputTokens: r.usage.inputTokens, outputTokens: r.usage.outputTokens, ok: true });
  const o = r.output;
  results.push({ ...c, critique: o });
  console.log(`\n${c.id}  (expect: ${c.expect})`);
  console.log(`  verdict=${o.verdict} overall=${o.overall} face=${o.scores.faceMatch} text=${o.scores.textAccuracy} phone=${o.scores.phoneReadability} clutter=${o.scores.clutter} badgeClear=${o.badgeZoneClear}`);
  console.log(`  textSeen="${o.textSeen}"`);
  console.log(`  edit: ${o.editInstruction}`);
}
writeJson(join(OUT, "s4/critic-results.json"), results);
