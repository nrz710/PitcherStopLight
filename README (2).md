# Start Signal

A start-by-start pitcher review dashboard. It grades each outing with red / yellow / green
stop lights by comparing FanGraphs Stuff+, Location+ and Pitching+ (full arsenal and per pitch)
against the pitcher's own season norms, and pairs that with Statcast pitch-level data:
movement, release, velocity, outcomes, trends over time and outing-vs-outing comparisons.

Everything runs in the browser. There is no server, no build step, no API key and no AI:
you drop in four CSV downloads and the page does the rest.

## What you need

| File | Where to get it |
| --- | --- |
| Pitch-by-pitch log | Baseball Savant → Statcast Search → the pitcher, one season (or more) → **Download CSV** |
| Stuff+ game log | FanGraphs → player page → Game Log → Pitch Type: **Stuff+** splits → Export |
| Location+ game log | Same, **Location+** splits |
| Pitching+ game log | Same, **Pitching+** splits |

The app sorts each file into place by its column headers, so file names don't matter.
If a FanGraphs export includes a season total row, that row is used as the season average;
otherwise the average is computed (pitch-weighted) from the game rows.

## Run it

**Option A: just open it.** Double-click `index.html`, click **Upload files**, and drop in the four CSVs.
Works offline. (Browsers block the auto-load below when a page is opened straight from disk,
so you upload each time.)

**Option B: GitHub Pages (recommended).**

1. Create a repository and push this folder to it.
2. Repository **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Open the URL GitHub gives you (e.g. `https://<org>.github.io/<repo>/`).

Anyone with the link can then upload their own files. The page never sends data anywhere;
files are read in the viewer's browser.

**Option C: local server.** From this folder run `python3 -m http.server 8000` and open
`http://localhost:8000`.

## Auto-loading a default pitcher

When the site is served (Options B or C), it looks for `data/manifest.json` on open and loads
the files it lists:

```json
{
  "savant":   "savant_kyle-harrison_2026.csv",
  "stuff":    "fangraphs_stuff_kyle-harrison_2026.csv",
  "location": "fangraphs_location_kyle-harrison_2026.csv",
  "pitching": "fangraphs_pitching_kyle-harrison_2026.csv"
}
```

To change the default pitcher, replace the CSVs in `data/` and update the manifest.
To have no default (upload-only), delete `data/manifest.json`; the upload panel then opens on load.

## Team logo

Put the logo in `assets/logos/` named by team abbreviation (`MIL.png`, `CHC.svg`, …).
It appears for everyone who opens the site. A logo uploaded through the Upload panel
overrides it, but only in that browser. See `assets/logos/README.md`.

## Project layout

```
index.html              page markup
css/styles.css          all styling (color tokens at the top of the file)
js/app.js               parsing, grading logic, charts and rendering
vendor/papaparse.min.js CSV parser (MIT, bundled so the app works offline)
data/                   optional default dataset + manifest.json
assets/logos/           optional team logos
.nojekyll               tells GitHub Pages to serve files as-is
```

## How the grades work

- **Scale.** Each start is indexed to the pitcher's pitch-weighted season average (100). Bars run 50–150.
  The green line is his peak outing (40+ pitches for the full arsenal, 10+ of a given pitch).
- **Lights.** Index ≥ 98 green, 95–98 yellow, < 95 red, driven by Pitching+.
- **Context adjustments** (one step at most):
  - Fewer than 6 of a pitch: no call.
  - Fewer than 12: red capped at yellow.
  - Outings under 25 pitches: full-arsenal red capped at yellow.
  - CSW% 5+ points over his norm without harder contact: up one step.
  - Velocity 1.5+ mph (fastballs) or 2+ mph (secondaries) below norm: green drops to yellow.
- **Result light.** xwOBA allowed vs. his season xwOBA, same thresholds.
- **Optimal trait profile.** Target windows come from his top-third outings for each pitch by
  Pitching+. Traits are ranked by weighted correlation with that pitch's Stuff+ across outings.
- **ALL card.** Season baseline. Quality bars are shown against league average (FanGraphs' 100).
- **Compare Outings.** Differences are ranked by size relative to his own outing-to-outing
  standard deviation for each metric.
- **FanGraphs pitch codes.** Savant pitch types are mapped to FanGraphs codes
  (FF→FA, SI→SI, FC→FC, FS→FS, SL/ST→SL, SV/CU/CS→CU, KC→KC, CH→CH).

All of this is plain arithmetic in `js/app.js`. Thresholds live near the top of the file
(`base()`, `evaluate()`) if you want to tune them.

## Browser support

Current Chrome, Edge, Safari and Firefox. Fonts load from Google Fonts when online and
fall back to system fonts offline.

## Data and licensing notes

The sample files in `data/` are Baseball Savant and FanGraphs exports. Check both sites'
terms before publishing their data in a public repository; if in doubt, keep the repo
private or ship it without `data/` (upload-only). PapaParse is MIT-licensed
(`vendor/PAPAPARSE-LICENSE`).
