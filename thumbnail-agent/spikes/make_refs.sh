#!/usr/bin/env bash
# Recreate the identity references used by the spikes (crops of the creator's
# photos and of his face from his own thumbnails) into output/spikes/refs/.
# Usage: CREATOR_DATA=~/epaphraa bash spikes/make_refs.sh     (needs ffmpeg)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
data="${CREATOR_DATA:-$root/../../thumbnail-agent-data}"
out="$root/output/spikes/refs"
mkdir -p "$out"
crop() { ffmpeg -v error -y -i "$1" -vf "crop=$2" "$out/$3"; }

# Two HD photos (Instagram screenshots), cropped to remove app overlays.
crop "$data/photos/Screenshot 2026-10-04 at 13.38.57.png" 1000:1250:170:150 photo_selfie.jpg
crop "$data/photos/Screenshot 2026-10-04 at 13.39.01.png" 700:1100:420:330  photo_airport.jpg
# His face from three of his thumbnails (serious expression, as used on the channel).
crop "$data/raw/20260706_sbAoV9hqJ3U.jpg" 480:720:800:0  t_petrol.jpg
crop "$data/raw/20260811_wTZvupTXhuQ.jpg" 330:600:950:0  t_budget.jpg
crop "$data/raw/20260916_YO9ROEnhsXI.jpg" 380:600:900:0  t_parasocial.jpg

# Planted problem for the critic test: a 22px headline nobody can read on a phone.
font="$(fc-match -f '%{file}' 'DejaVu Sans:bold' 2>/dev/null || true)"
[ -f "$font" ] || font="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
mkdir -p "$root/output/spikes/s4"
ffmpeg -v error -y -f lavfi -i "color=c=0x8a1c1c:s=1280x720" -i "$out/t_petrol.jpg" \
  -filter_complex "[1:v]scale=-1:720[f];[0:v][f]overlay=W-w:0,drawtext=fontfile='$font':text='PETROL PRICES WILL DOUBLE':fontcolor=white:fontsize=22:x=60:y=80" \
  -frames:v 1 "$root/output/spikes/s4/planted_tiny_text.jpg"
ls "$out"
