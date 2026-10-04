// Spike 5: can the AI SDK send the creator's photo to a Gemini image model and
// get a 16:9 image back? One cheap call.
import { join } from "node:path";
import { generateThumbnail, img, OUT, REFS } from "./lib.ts";

const model = process.argv[2] ?? "gemini-3.1-flash-image";
const r = await generateThumbnail({
  model,
  label: "s5-smoke",
  text:
    "Image 1 is a photo of a YouTube creator. Create a 16:9 YouTube thumbnail of this same man " +
    "(same face, hair, beard and skin tone) looking seriously at the camera, on the right third, " +
    "in a maroon t-shirt. Left side: the bold white headline text \"TEST RUN\" on a red label.",
  images: [img(join(REFS, "photo_selfie.jpg"))],
  outPath: join(OUT, "s5", `${model}.jpg`),
});
console.log(JSON.stringify(r, null, 2));
