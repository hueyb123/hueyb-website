# Huey B — Website Project Notes

Context handoff for continuing work on this site. This is a static HTML/CSS/JS
site (no build step, no framework) for Huey B, a multidisciplinary artist.

## Files

```
index.html       Home — full-bleed video hero, glitch/scramble text intro
studio.html      Studio updates (drawings, paintings, in-progress work)
projects.html    Current & past projects, split into two sections
products.html    Items for sale (decorative cart, not wired to checkout)
cv.html          Exhibition history — Solo, Group, Education (text list format)
contact.html     Contact form (name + email, not wired to a backend)
styles.css       All site styling
script.js        Nav dropdown, scroll reveals, hero video picker, glitch text, accent color randomizer
index_videos/    Background videos for the homepage hero (currently 2 .mp4 files)
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

- All tile backgrounds (Projects, Products, Studio, hero video aside) are
  gradient/pattern placeholders — no real photography or artwork images yet.
- CV page has placeholder venue names, "20XX" dates, and a placeholder
  Education entry — needs real exhibition history.
- Studio update tiles have placeholder titles/dates ("New Drawings — Aug
  2026" etc.) — needs real captions.
- Product prices and names are placeholders; "Add to Cart" buttons are
  decorative only (no real cart/checkout wired up).
- Contact form does not submit anywhere yet (no backend, no Netlify Forms /
  Formspree integration).

## Hosting (discussed earlier, not yet done)

- Recommended **Netlify**: drag-and-drop the project folder at
  app.netlify.com for instant deploy, free HTTPS.
- Huey already owns the domain (hueyb.com per the reference site) — connect it
  via Netlify's **Domain settings → Add custom domain**, then add the DNS
  records Netlify provides at the domain's registrar.
- No git/version control set up for this project by request — kept as plain
  local files, redeploy by re-uploading the folder.
