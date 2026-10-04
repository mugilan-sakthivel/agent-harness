// Shared helpers for the Phase 1 spikes: env, paths, one image call, call log.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "@ai-sdk/google";
import { generateImage } from "ai";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, "../..");                       // thumbnail-agent/

// Load KEY=VALUE lines from ENV_FILE, default thumbnail-agent/.env (gitignored).
// Values already set in the shell win.
const envFile = process.env.ENV_FILE ?? join(ROOT, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

export const OUT = join(ROOT, "output/spikes");                   // gitignored
export const REFS = join(OUT, "refs");                            // made by spikes/make_refs.sh
// The creator's private data repo (thumbnails, videos.json, photos/).
export const DATA = process.env.CREATOR_DATA ?? resolve(ROOT, "../../thumbnail-agent-data");

export const TEXT_MODEL = process.env.TEXT_MODEL ?? "gemini-3.8-flash";

export const img = (path: string) => readFileSync(path);

export type CallLog = {
  at: string; kind: "image" | "text"; model: string; label: string;
  ms: number; inputTokens?: number; outputTokens?: number; ok: boolean; error?: string;
};

export function logCall(entry: CallLog) {
  mkdirSync(OUT, { recursive: true });
  appendFileSync(join(OUT, "calls.jsonl"), JSON.stringify(entry) + "\n");
}

// One image call: prompt text + input images -> 1280x720 JPEG saved at outPath.
export async function generateThumbnail(opts: {
  model: string; label: string; text: string; images: Buffer[]; outPath: string;
}) {
  const t0 = Date.now();
  try {
    const result = await generateImage({
      model: google.image(opts.model),
      prompt: { text: opts.text, images: opts.images },
      aspectRatio: "16:9",
      providerOptions: { google: { imageConfig: { aspectRatio: "16:9", imageSize: "2K" } } },
    });
    const raw = Buffer.from(result.image.uint8Array);
    mkdirSync(dirname(opts.outPath), { recursive: true });
    await sharp(raw).resize(1280, 720, { fit: "cover" }).jpeg({ quality: 90 }).toFile(opts.outPath);
    const meta = await sharp(raw).metadata();
    logCall({
      at: new Date().toISOString(), kind: "image", model: opts.model, label: opts.label,
      ms: Date.now() - t0, inputTokens: result.usage?.inputTokens, outputTokens: result.usage?.outputTokens, ok: true,
    });
    return { path: opts.outPath, rawSize: `${meta.width}x${meta.height}`, usage: result.usage, ms: Date.now() - t0 };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logCall({ at: new Date().toISOString(), kind: "image", model: opts.model, label: opts.label, ms: Date.now() - t0, ok: false, error: msg.slice(0, 500) });
    throw err;
  }
}

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}
