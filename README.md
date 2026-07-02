# melties-lp

Public landing page for **Melties** — *Every Day Melts Better.*

TikTok-first vibe page (3秒で世界観→フォロー). Vanilla HTML/CSS/JS, zero build.

## Deploy (GitHub Pages)
- Live: https://melties.world/ (GitHub Pages + `CNAME`)
- Push to `main` = deploy. No build step (static root).
- Pretty URLs: `play.html` is served at `/play` (extensionless). `/play/` is a 404 — always link/canonicalize to `/play`.

## Structure
- `index.html` / `style.css` / `app.js` — the page
- `images/` — logo, group badge, character art (self-contained)
- `manifest.json` — PWA
- `SPEC.md` — LP spec

> Source IP/pipeline repo: github.com/pyonkichi369/melties (separate).
