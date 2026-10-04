#!/usr/bin/env bash
# Download titles, descriptions, stats and thumbnails (no video) for a channel's
# latest long-form uploads into data/creators/<handle>/, which is gitignored.
#
# Usage:  spikes/fetch_channel.sh @epaphraa [count]
# Needs:  pip install yt-dlp, ffmpeg, and network access to www.youtube.com
#         and i.ytimg.com.
set -euo pipefail

handle="${1:?usage: fetch_channel.sh @handle [count]}"
count="${2:-30}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/data/creators/${handle#@}"
mkdir -p "$out/raw"

python3 -m yt_dlp \
  --skip-download --write-thumbnail --convert-thumbnails jpg \
  --write-info-json --no-write-playlist-metafiles \
  --playlist-end "$count" --ignore-errors \
  -o "$out/raw/%(upload_date)s_%(id)s.%(ext)s" \
  "https://www.youtube.com/${handle}/videos" \
  || echo "Some videos failed (e.g. members-only); indexing the rest."

# One index file: the analyst reads titles + descriptions from here, and the
# view counts give the evals a rough "which thumbnails worked" signal.
python3 - "$out" <<'EOF'
import json, sys, pathlib

out = pathlib.Path(sys.argv[1])
rows = []
for f in sorted((out / "raw").glob("*.info.json"), reverse=True):
    d = json.loads(f.read_text(encoding="utf-8"))
    stem = f.name[: -len(".info.json")]
    thumb = next((p for ext in ("jpg", "webp", "png")
                  if (p := f.with_name(f"{stem}.{ext}")).exists()), None)
    row = {k: d.get(k) for k in ("id", "title", "description", "upload_date",
                                  "view_count", "like_count", "duration")}
    row["thumbnail"] = str(thumb.relative_to(out)) if thumb else None
    rows.append(row)
(out / "videos.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"{len(rows)} videos -> {out / 'videos.json'}")
EOF
