# Hirono Boy Collector

A whimsical, installable web app for collecting Hirono boy figurines: open blind boxes, unlock rare and secret figures, and browse your shelf.

## Features

- **Explorable map**: four screens on a 2×2 world (Home, Blind Box, My Shelf, Series). Move with the top menu, edge arrows, mini-map or arrow keys (Shift + arrow on Home).
- **Swipeable hero carousel**: floating figurines you can drag, swipe, click or arrow through.
- **Blind boxes**: shake, open and reveal a figure. Rarities are common (70%), rare (24%) and secret (6%), and you can pick any series or a specific one.
- **Stardust economy**: first box free, then 10 ✦ each. Tap drifting stars for +2 ✦, and duplicates give +3 ✦.
- **Collection shelf** with locked silhouettes, filters and per-series progress.
- **Light / dark mode** with hand-drawn twinkling stars.
- **Installable PWA** that works offline after the first visit. Progress is saved in the browser (localStorage).
- Responsive from phones to wide desktops, and respects reduced-motion settings.

## Run locally

It's a plain static site with no build step. Serve the folder with any static server:

```bash
npx serve .
```

On Windows without Node, use the included script and open http://localhost:8137:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

(Opening `index.html` directly works too, but offline/install support needs http.)

## Deploy

Push to GitHub, then turn on **Settings → Pages → Deploy from branch → main / (root)**.

## Customising figures

All figures live in `figures.js`. Each row is `[name, series, rarity, outfitColor, accessory, mood]`.
The illustrations are original stand-ins. To use a photo of your own figure, set `img` on it, for example:

```js
FIGURES[0].img = "images/sleepy-sunday.png";
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and screens |
| `style.css` | Theme tokens (light/dark), layout, animations |
| `figures.js` | Series and figure data, SVG figure illustrator |
| `app.js` | Navigation, carousel, blind boxes, shelf, saving |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | Offline + installable app |
| `serve.ps1` | Tiny local server for Windows |

*Fan project. Hirono is a trademark of its respective owners; this app is not affiliated with or endorsed by them.*
