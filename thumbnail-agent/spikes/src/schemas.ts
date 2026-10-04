// zod schemas for model outputs. These become the app's data contracts.
import { z } from "zod";

export const ThumbnailNote = z.object({
  id: z.string(),
  title: z.string(),
  creator: z.object({
    present: z.boolean(),
    position: z.enum(["left", "center", "right", "multiple", "none"]),
    size: z.enum(["small", "medium", "large", "close-up", "none"]),
    expression: z.string(),
    gesture: z.string(),
    clothing: z.string(),
  }),
  otherPeople: z.array(z.object({
    kind: z.enum(["podcast_guest", "public_figure", "generic_people", "expert", "crowd", "unsure"]),
    description: z.string(),
    position: z.string(),
  })),
  text: z.object({
    words: z.string().describe("exact text on the thumbnail, word for word"),
    wordCount: z.number(),
    style: z.string(),
    position: z.string(),
  }),
  objects: z.array(z.string()),
  background: z.string(),
  colors: z.array(z.string()).describe("dominant colours as hex"),
  layout: z.string(),
  hook: z.string(),
});
export type ThumbnailNote = z.infer<typeof ThumbnailNote>;

export const ReferenceType = z.object({
  id: z.string().describe("short kebab-case id"),
  name: z.string(),
  description: z.string(),
  useWhen: z.array(z.string()),
  recipe: z.string(),
  needsOtherPeople: z.enum(["none", "guest_photo", "public_figure", "generic_people"]),
  exampleIds: z.array(z.string()),
  avgViews: z.number(),
});
export type ReferenceType = z.infer<typeof ReferenceType>;

export const BrandKit = z.object({
  palette: z.object({ primary: z.string(), accent: z.string(), text: z.string(), backgrounds: z.array(z.string()) }),
  textStyle: z.string(),
  faceStyle: z.string(),
  recurring: z.array(z.string()),
  avoid: z.array(z.string()),
});
export type BrandKit = z.infer<typeof BrandKit>;

export const Critique = z.object({
  scores: z.object({
    faceMatch: z.number().describe("1-5: is the main person clearly the creator in the reference photo?"),
    textAccuracy: z.number().describe("1-5: does the rendered text exactly match the intended headline?"),
    phoneReadability: z.number().describe("1-5: readable in the small 320x180 copy?"),
    referenceMatch: z.number(),
    brandMatch: z.number(),
    curiosity: z.number(),
    clutter: z.number().describe("1-5, 5 = clean single idea"),
  }),
  textSeen: z.string().describe("the text you can actually read in the image, verbatim"),
  badgeZoneClear: z.boolean().describe("bottom-right corner free of important content"),
  overall: z.number(),
  verdict: z.enum(["ship", "revise"]),
  problems: z.array(z.string()),
  editInstruction: z.string().describe("one specific edit for the image model, or empty if ship"),
});
export type Critique = z.infer<typeof Critique>;
