#!/usr/bin/env bash
# Rasterise the brand icon.
#
# icon.svg is the source; the PNGs are build artifacts that happen to be
# committed, because Home Assistant only reads .png from a custom integration's
# brand/ directory (see homeassistant/components/brands/const.py ALLOWED_IMAGES).
#
# Chromium is used because it is what this machine has. Note it may be a snap,
# which is confined and cannot read paths outside $HOME — so the temporary HTML
# wrapper is written next to the SVG rather than into /tmp, where a snap
# chromium silently screenshots a blank page instead of failing.
set -euo pipefail

BRAND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../custom_components/polr_stocks/brand" && pwd)"
cd "$BRAND_DIR"

CHROME="${CHROME:-$(command -v chromium || command -v google-chrome || true)}"
[[ -n "$CHROME" ]] || { echo "no chromium/google-chrome found; set CHROME=" >&2; exit 1; }

render() {
  local size="$1" out="$2"
  cat > _render.html <<HTML
<html><head><style>
html,body{margin:0;padding:0;background:transparent}
svg{display:block;width:${size}px;height:${size}px}
</style></head><body>
$(cat icon.svg)
</body></html>
HTML
  # --default-background-color=00000000 is what yields an alpha channel; without
  # it the transparent corners outside the circle render opaque white.
  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --default-background-color=00000000 --virtual-time-budget=3000 \
    --screenshot="$PWD/$out" --window-size="$size,$size" "$PWD/_render.html" >/dev/null 2>&1
  rm -f _render.html
  echo "  $out ($(file -b --mime-type "$out"), ${size}x${size})"
}

echo "rendering from icon.svg:"
render 256 icon.png
render 512 "icon@2x.png"

# Guard the two failure modes that are silent rather than loud.
for f in icon.png "icon@2x.png"; do
  case "$(file -b "$f")" in
    *RGBA*) ;;
    *) echo "ERROR: $f has no alpha channel" >&2; exit 1 ;;
  esac
done
echo "ok — alpha channel present in both"
