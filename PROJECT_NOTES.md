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
  index.njk           Home — full-bleed video hero, glitch/scramble text intro. Title/description
                       text and the hero video pool are all CMS-driven now (see "Home CMS" below).
  studio.njk          Studio updates — data-driven from src/content/studio/*.md
  studio/detail.njk   Per-post detail page template, one HTML page per post at /studio/<slug>/
  projects.njk        Projects tile grid — data-driven from src/content/projects/*.md (see below)
  projects/detail.njk Per-project detail page template — one HTML page generated per
                       project markdown file, at /projects/<slug>/
  prints.njk            Fine art prints for sale (decorative cart, not wired to checkout) —
                       data-driven from src/content/prints/*.md. Renamed from "Products" 2026-08-15.
  cv.njk               Exhibition history — Solo, Group, Education — data-driven from
                       src/_data/cv.json
  contact.njk          Contact form (name + email, not wired to a backend) — still placeholder
  content/projects/    One markdown file per project (frontmatter + description) — edited via /admin
  content/studio/      One markdown file per studio post — edited via /admin
  content/prints/      One markdown file per print — edited via /admin
  _data/cv.json         Single file, one JSON list of exhibition entries — edited via /admin
                       (a Decap "file collection", not a folder — see "Prints/CV/Home CMS" below)
  _data/home.json       Hero title, description, and the pool of background videos — edited via /admin
  admin/               Decap CMS: index.html (CMS shell) + config.yml (content schema for every
                       collection: projects, studio, prints, cv, home)
  assets/uploads/      Where Decap CMS uploads media for every collection (images/video/audio)
  styles.css           All site styling
  script.js            Nav dropdown, scroll reveals, hero video picker, glitch text, accent randomizer
  index_videos/        The two original hero videos, still seeded into home.json's video pool
                       (new videos added via /admin upload into assets/uploads/ instead)
.eleventy.js           Eleventy config: passthrough copies, collections for projects/studio/prints,
                       plus the `dump`/`firstImage`/`readableDate` template filters
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
- **Tiles** (Projects/Prints/Studio grids): full-bleed placeholder boxes,
  title/price revealed on hover via a dark gradient overlay — no real artwork
  images wired in yet, just gradient/pattern placeholders.

## Navigation

Structure (same on every page): `Studio → Projects → Prints → About ▾`
where **About** is a dropdown containing **CV** and **Contact**. No separate
"Home" nav item — the logo (top-left, links to `/`) is the home link, so a
dedicated nav entry was redundant and was removed.

- Portfolio and Gallery pages were removed entirely per explicit request —
  only pages in the layout above should exist.
- Dropdown opens on hover (desktop) or click/tap (touch), closes on outside
  click or Escape. Aligned to open below the left edge of the "About" button.
- Active-state styling shows on both the top-level item and, if relevant, the
  "About" toggle + the matching item inside the dropdown.

## Homepage hero

- Full-bleed `<video>` background: muted, looped, no controls, `object-fit:
  cover`. On each load, `script.js` picks **one random video** from
  `window.HERO_VIDEOS`, an array Eleventy prints into `index.njk` from
  `src/_data/home.json`'s `videos` list.
  - **To add more videos**: upload through `/admin` (Home collection) — no
    code edit or redeploy-by-hand needed anymore. The random pick itself is
    still client-side JS (has to be, so each visitor/page-load gets a
    different video), only the *source list* moved to the CMS.
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

- Every content page (Projects, Studio, Prints, CV, Home) is now CMS-driven
  end-to-end via `/admin` — no more hard-coded placeholder markup anywhere.
  What's still placeholder is the *content itself*, not the pipeline:
  - CV is seeded with the original placeholder venue names, "20XX" dates,
    and a placeholder Education entry — needs real exhibition history
    (editable as one list under the CV collection in `/admin`).
  - Prints currently has zero real entries (test placeholders were
    published and then deleted to prove the pipeline) — needs real items.
  - "Add to Cart" buttons remain decorative only — see the "Prints /
    e-commerce" section below for the real checkout plan.
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

## Prints / CV / Home CMS (added 2026-08-15; page renamed Products → Prints same day)

Extended the same `/admin` pipeline to the rest of the site. Two different
Decap collection shapes are used depending on the content:

- **Prints** (originally built as "Products", renamed once Huey clarified
  this page is specifically for selling art prints) — a folder collection,
  same shape as Projects/Studio: one markdown file per item in
  `src/content/prints/`, frontmatter `name`, `description` (optional),
  `image`, `edition_type` (`open`/`limited`), and `variants` — a list of
  `{label, price, quantity, sold_out}`, one entry per size (a single-size
  print just has one variant). Now has its own detail page
  (`src/prints/detail.njk`), since a variant picker + checkout needs more
  room than a hover tile — see "Prints e-commerce" below for the real
  checkout wiring.
- **CV** and **Home** — **file collections**, not folders. Both are a single
  JSON file (`src/_data/cv.json`, `src/_data/home.json`) exposed to every
  template automatically via Eleventy's `_data` directory convention (no
  custom collection code needed, unlike Prints/Projects/Studio). CV holds
  one `entries` list (category/year/title/venue per exhibition) editable as
  one screen in `/admin` with native drag-to-reorder — deliberately not
  folder-per-entry, since CV lines have no media/detail page and would
  otherwise scatter dozens of tiny files for what's really one small table.
  Home holds `title`, `description` (the hero text), and `videos` (the
  background-video pool, replacing the old hard-coded `videoFiles` array in
  `script.js` — see "Homepage hero" above).
- `src/cv.njk` filters/sorts `cv.entries` in the template itself (plain
  `{% for %}` + `{% if %}` per category, Nunjucks' built-in `sort` filter
  for newest-first) rather than a custom Eleventy collection, since Nunjucks
  has no `selectattr`-style filter (a trap already hit once building
  Projects — don't reach for it again).
- Same schema-lives-in-two-places caveat as Projects: if a field changes in
  `src/admin/config.yml`, the corresponding `.njk` template needs a matching
  update since templates read `data.<field>` directly.

## Prints e-commerce (Phase 1 added 2026-08-15)

Huey sells prints directly — no Etsy/Shopify — prints and ships everything
herself, and wanted to connect straight to her own PayPal account. Full
context/reasoning lives in the plan history; summary of what's built:

- **Phase 1 (live)**: client-side PayPal Smart Buttons on
  `src/prints/detail.njk`. Each print's `variants` are rendered as
  size-picker buttons (`.variant-option`); selecting one re-renders a
  `paypal.Buttons()` instance for that variant's exact price (logic in
  `src/script.js`, guarded by `.print-variants` existing on the page — a
  no-op everywhere else). Checkout is configured to collect a shipping
  address, which lands in the transaction details in Huey's own PayPal
  account/email — no separate order-notification system was built, since
  PayPal's own notifications cover it for now.
- **Live PayPal Client ID is hardcoded** directly in the `<script src=
  "https://www.paypal.com/sdk/js?client-id=...">` tag in
  `src/prints/detail.njk` — this is intentional and safe, Client IDs are
  meant to be public (unlike the Secret, which Phase 2 will need and which
  must go in a Netlify environment variable, never the repo).
- Confirmed working end-to-end 2026-08-15: a real $1 test purchase on a
  throwaway print completed successfully and appeared in Huey's PayPal
  account with a shipping address attached, then the test print was deleted.
- **Known limitation (by design, for now)**: entirely client-side. No
  server-side price validation (a tampered client could submit a lower
  price) and no real stock enforcement for `limited` edition_type variants
  (two buyers could both complete checkout on the last copy). Acceptable
  for a small shop starting out; both are closed by **Phase 2**, not yet
  built: a Netlify Function creates the PayPal order server-side (reading
  the true price from the print's own content file) and checks/decrements
  remaining stock in Netlify Blobs for `limited` variants before allowing
  checkout, capturing after payment (not on checkout start, to avoid
  falsely reserving stock on abandoned carts). Phase 2 needs the PayPal
  **Secret** (from the same Developer Dashboard app as the Client ID) added
  as a Netlify environment variable.
- **Gotcha hit while setting this up**: testing checkout while logged into
  the PayPal Business account in the same browser causes the checkout popup
  to silently reuse that session and try to log in as the merchant (PayPal
  won't let you pay yourself). Test as a buyer in a private/incognito
  window instead. Also, brand-new PayPal Business accounts sometimes don't
  show the guest "Debit or Credit Card" option until PayPal finishes their
  own account verification/review — not something fixable from the code.

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
