# Huey B — Website Project Notes

Context handoff for continuing work on this site. As of 2026-08-14 this is an
**Eleventy (11ty) static site** for Huey B, a multidisciplinary artist —
previously plain hand-written HTML/CSS/JS with no build step; converted to
add a Decap CMS content pipeline for the Projects page (see "Projects CMS"
section below). Git, Node/npm, and a build step are now part of the project;
these were all previously deliberately skipped and were reintroduced
specifically to support the CMS.

## Files

```
src/                  Eleventy input directory — everything here becomes the site
  _includes/base.njk  Shared header/nav/footer layout — every page extends this.
                       Edit nav links, header markup, or footer ONCE here, not per-page.
  index.njk           Home — full-bleed video hero, glitch/scramble text intro
  studio.njk          Studio updates (drawings, paintings, in-progress work) — still placeholder tiles
  projects.njk        Projects tile grid — data-driven from src/content/projects/*.md (see below)
  projects/detail.njk Per-project detail page template — one HTML page generated per
                       project markdown file, at /projects/<slug>/
  products.njk         Items for sale (decorative cart, not wired to checkout) — still placeholders
  cv.njk               Exhibition history — Solo, Group, Education — still placeholder content
  contact.njk          Contact form (name + email, not wired to a backend)
  content/projects/    One markdown file per project (frontmatter + description) — this is
                       what Decap CMS edits via /admin
  admin/               Decap CMS: index.html (CMS shell) + config.yml (content schema)
  assets/uploads/      Where Decap CMS uploads project media (images/video/audio)
  styles.css           All site styling
  script.js            Nav dropdown, scroll reveals, hero video picker, glitch text, accent randomizer
  index_videos/        Background videos for the homepage hero (currently 2 .mp4 files)
.eleventy.js           Eleventy config: passthrough copies, the `projects`/`projectsCurrent`/
                       `projectsPast` collections read from src/content/projects/*.md
netlify.toml           Netlify build command (`npm run build`) + publish dir (`_site`)
package.json            `npm run build` (one-off) / `npm run serve` (local dev server, localhost:8080)
_site/                 Generated output — gitignored, never edit directly
```

## Design direction

Originally built as a generic dark SaaS-style template, then rebuilt around
three references the artist provided: **shrigshop.com**, **newrafael.com**,
**catherinebiocca.com** — minimalist, gallery-style, image-forward, restrained
typography. Then pulled further details directly from Huey's real (Squarespace)
site at **hueyb.com**:

- Real font used there: **Silkscreen** (retro/pixel Google Font) — used here for
  the logo and all headings. Body copy uses **Inter**.
- Real header pattern: cart icon + Instagram icon, which we replicated.
- Real Instagram handle: **@huebeeeee**.
- Real project names pulled from their live nav (used as placeholder content
  in Projects/CV until real project data is supplied): LINES (2021), Water
  Resistant Cowboy, Foldables, Corners, The Speaker.

## Current visual system

- **Palette**: near-black background (`#0a0a0a`), off-white text, monochrome
  hairline borders. One **accent color** used for links/hover/logo/buttons.
- **Accent color is randomized on every page load** — `script.js` picks from a
  set of 8 neon colors (lime, green, magenta, cyan, purple, orange, yellow,
  red-pink) and sets it as the `--color-accent` CSS variable at runtime, so the
  whole site's accent theme (logo, nav underlines, button hovers, cart badge,
  tile prices, glitch characters) shifts together each refresh.
- **Logo & cart badge** have a neon "tube flicker" animation (`neonFlicker`
  keyframes) plus a `text-shadow` glow, since they're persistently
  accent-colored (not just on hover).
- **Buttons**: flat, outlined, invert to solid accent fill on hover.
- **Tiles** (Projects/Products/Studio grids): full-bleed placeholder boxes,
  title/price revealed on hover via a dark gradient overlay — no real artwork
  images wired in yet, just gradient/pattern placeholders.

## Navigation

Structure (same on every page): `Home → Studio → Projects → Products → About ▾`
where **About** is a dropdown containing **CV** and **Contact**.

- Portfolio and Gallery pages were removed entirely per explicit request —
  only pages in the layout above should exist.
- Dropdown opens on hover (desktop) or click/tap (touch), closes on outside
  click or Escape. Aligned to open below the left edge of the "About" button.
- Active-state styling shows on both the top-level item and, if relevant, the
  "About" toggle + the matching item inside the dropdown.

## Homepage hero

- Full-bleed `<video>` background: muted, looped, no controls, `object-fit:
  cover`. On each load, `script.js` picks **one random video** from a
  hardcoded filename list (`index_videos/video_2023-11-08_14-15-30.mp4`,
  `index_videos/video_2026-08-14_19-19-06.mp4`).
  - **To add more videos**: drop the file into `index_videos/` and add its
    filename to the `videoFiles` array in `script.js` — static sites can't
    auto-list a folder's contents, so this list has to be maintained by hand.
- A left-to-right dark scrim sits over the video for legibility.
- Title + description are **left-aligned**, positioned at the same left
  margin as the header logo.
- Text has a black, 85%-opacity background sitting tightly behind the
  characters themselves (not a padded box) via `box-decoration-break: clone`,
  so it reads as a highlighter strip that follows the wrapped lines.

## Glitch / "ghost writing" text effect

On page load, the hero title and description reveal themselves character by
character via a custom `TextScramble` class in `script.js`:

- Each character is its own persistent `<span class="scramble-slot">` (not
  rebuilt every frame — this was a deliberate rewrite so CSS transitions could
  animate smoothly per character).
- Each character starts invisible and blurred (`opacity: 0`, `blur(3px)`),
  fades/sharpens in (550ms) roughly left-to-right, and cycles through random
  glitch symbols (`$ & # % @ ! < > [ ] { } = + * ^ ? / \ _ ~`) in the current
  neon accent color with a glow before settling into the correct letter.
- Real text lives in a visually-hidden sibling span for screen readers; the
  animated version is `aria-hidden`.
- **Known gap**: no `<noscript>` fallback — if JS is disabled, the hero text
  won't display. Flagged but not fixed, since it was judged unlikely to matter
  for this audience.

## Known placeholders / things Huey still needs to supply

- Projects CMS pipeline is live and confirmed working end-to-end (first real
  entry, "The Rock Scans", published 2026-08-14 via `/admin`). Studio/Products
  tile backgrounds are still gradient/pattern placeholders (not yet moved
  onto the CMS pipeline).
- CV page has placeholder venue names, "20XX" dates, and a placeholder
  Education entry — needs real exhibition history.
- Studio update tiles have placeholder titles/dates ("New Drawings — Aug
  2026" etc.) — needs real captions.
- Product prices and names are placeholders; "Add to Cart" buttons are
  decorative only (no real cart/checkout wired up).
- Contact form does not submit anywhere yet (no backend, no Netlify Forms /
  Formspree integration).

## Projects CMS (added 2026-08-14)

Huey needed a free, no-code way to publish multidisciplinary project entries
(images, video, sound, text). Chosen stack: **Decap CMS** (free, git-based
admin UI) + **Netlify** (free hosting + auth) + **Eleventy** (generates one
static page per project from CMS content — needed because a single project
can carry several images, a video, and audio, more than a hover tile can
show, and Huey wanted real shareable per-project URLs rather than an in-page
modal).

- Each project is one markdown file in `src/content/projects/`, with
  frontmatter: `title`, `date` (sort key), `status` (`current`/`past` —
  drives the two-section split on the Projects page), `caption` (free-text
  tile subtitle, e.g. "2026 — Ongoing"), `cover` (tile background image),
  and `media` (a list of `{type: image|video|audio, file, caption}` items
  shown in order on the detail page). The markdown body is the description.
- `src/admin/config.yml` defines this schema for Decap's form UI — if a field
  is added/renamed there, `src/projects.njk` and `src/projects/detail.njk`
  need matching updates since they read `project.data.<field>` directly.
- Auth is **Netlify Identity + Git Gateway**: Huey logs into `/admin` with
  email/password (no GitHub account needed on her end); Decap commits
  straight to the `main` branch on save, Netlify rebuilds automatically.
- Live at `https://funny-sundae-85fef0.netlify.app/admin/`. GitHub repo,
  Netlify site, and Identity/Git Gateway are all connected and working —
  publishing a new project is entirely form-filling at that URL, no code.
- **Watch for later**: project media lives in the git repo (same pattern as
  the hero videos). GitHub soft-caps files around 100MB and repos get
  unwieldy well before 1GB — if the body of work grows large/video-heavy,
  swap `media.file` for an external host (Cloudinary free tier, YouTube/
  SoundCloud embeds) rather than continuing to commit large binaries.

## Hosting

- **Netlify**, connected to a GitHub repo (see "Projects CMS" above) — not a
  drag-and-drop deploy anymore, since Decap CMS needs a real git remote to
  commit to. Free tier, free HTTPS.
- Huey already owns the domain (hueyb.com per the reference site) — connect it
  via Netlify's **Domain settings → Add custom domain**, then add the DNS
  records Netlify provides at the domain's registrar.
- Local git repo initialized 2026-08-14, commit identity `Henry McDonald
  <henrymcdonald03@gmail.com>` (set locally in this repo's `.git/config`,
  not globally).
