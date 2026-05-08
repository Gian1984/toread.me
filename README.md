# toread.me

A privacy-minded, browser-first EPUB reader for public-domain books and local files. Built with Nuxt 4 + Tailwind, deployed as a static site, with a couple of small PHP endpoints used as CORS-safe proxies for Project Gutenberg / Gutendex.

Live site: <https://toread.me>

## What the site does

- **Reader (`/`)** — Opens a bundled public-domain EPUB (Pride and Prejudice) on first visit. You can:
  - Drag & drop or pick a local `.epub` file (the file is parsed in-browser via [`epubjs`](https://github.com/futurepress/epub.js); it is **not** uploaded).
  - Open any Project Gutenberg book by ID/URL through the EPUB proxy.
  - Toggle day / night theme, adjust warmth, font size, line height, weight and typeface (Serif / System / Readable Sans / Mono) via the reader settings popover.
  - Expand the reader to a focused full-screen mode.
- **Library (`/library/`)** — Browses Project Gutenberg via the [Gutendex](https://gutendex.com) API, with category and language filters (English, Italian, Spanish, French, German, Portuguese, Greek). Covers and metadata are fetched through a small PHP proxy to dodge intermittent 502s and CORS issues.
- **About (`/about/`)** — Project context and links to the related free-culture projects (CodeHelper, Unlistened.me).
- **Privacy (`/privacy/`)** — How local files, browser storage, Gutendex usage and the cookie-consent component are handled.

The site is **statically generated** (`nitro.preset = 'static'`), so the only runtime backend pieces are the two PHP files in `public/api/`.

## Tech stack

- **Nuxt 4** (Vue 3, Vite 6) — `@nuxt/vite-builder`, static `nitro` preset
- **Tailwind CSS** via `@nuxtjs/tailwindcss` + `@tailwindcss/typography`
- **Headless UI Vue** + **Heroicons** for UI primitives
- **`@nuxtjs/sitemap`** for the generated sitemap
- **`epubjs`** for in-browser EPUB rendering
- **`@tanstack/vue-virtual`** for virtualized library lists
- **PHP** scripts for the EPUB / Gutendex proxies and for static social-image generation (uses `sharp` on the Node side for asset prep)

## File structure

```
toread.me/
├── app.vue                       # Root layout: top nav, sidebar, search, reader controls, cookie consent
├── nuxt.config.ts                # Nuxt config: static preset, Tailwind, sitemap, prerendered routes
├── tailwind.config.js            # Tailwind theme + content paths
├── package.json                  # Scripts: dev / build / generate / preview / postinstall
│
├── pages/                        # File-based routes (all statically prerendered)
│   ├── index.vue                 # Home — reader entry point (most logic lives in app.vue)
│   ├── library.vue               # Library — Gutendex browse + filters
│   ├── about.vue                 # About page
│   └── privacy.vue               # Privacy policy
│
├── components/
│   ├── EbookReader.vue           # epub.js wrapper: rendition, theming, paging, blocked-source fallback
│   ├── ReaderSettingsPopover.vue # Day/night, warmth, font size, line height, typeface controls
│   ├── AppFooter.vue             # Footer with nav + social links (LinkedIn, Instagram, ...)
│   └── CookieConsent.vue         # Local-storage consent (analytics/ads) + dataLayer/gtag events
│
├── composables/
│   ├── useGutendex.ts            # Gutendex client: list/search/book/cover/EPUB URL helpers,
│   │                             #   PHP proxy fallback, abortable fetches
│   └── useSeo.ts                 # Wires page registry → useSeoMeta + JSON-LD (canonical, OG,
│                                 #   Twitter, FAQ, breadcrumbs, structured data)
│
├── utils/
│   └── pagesRegistry.ts          # Single source of truth for routes: labels, paths, summaries,
│                                 #   per-page SEO metadata, social images, sitemap priority,
│                                 #   structured data + FAQ. Drives both `useSeo` and the sitemap.
│
├── data/
│   └── sampleBooks.ts            # The bundled public-domain book (Pride and Prejudice)
│
├── assets/
│   ├── css/                      # Tailwind entry (loaded from nuxt.config.ts)
│   └── toread-logo-source.svg    # Source logo
│
├── public/                       # Served as-is at site root
│   ├── api/
│   │   ├── epub.php              # CORS-safe streaming proxy for Project Gutenberg EPUBs
│   │   │                         #   (allow-list of hosts, HTTPS-only, supports directory mode)
│   │   └── gutendex.php          # JSON proxy for gutendex.com (list + by-id, with caching headers)
│   ├── books/
│   │   └── pride-and-prejudice.epub
│   ├── images/
│   │   ├── toread-logo.webp
│   │   ├── partners/             # Logos for related projects
│   │   └── social/               # Generated OG / Twitter / square previews per page
│   ├── favicon.ico / favicon.png / apple-touch-icon.png
│
├── scripts/
│   └── generate-social-images.php  # Generates per-page social previews from the logo
│
├── strategy/                     # Product/strategy notes (not shipped)
│   └── ebook-reader-strategy.md
│
├── .output/                      # Build output (Nitro). `dist` is a symlink to `.output/public`.
└── .nuxt/                        # Nuxt build cache
```

## Scripts

```bash
npm run dev        # NODE_OPTIONS='--experimental-sqlite' nuxt dev
npm run build      # nuxt build
npm run generate   # nuxt generate (static site → .output/public)
npm run preview    # nuxt preview
```

The `dev` script enables Node's experimental SQLite flag because Nuxt 4 / Nitro use it for dev-time storage.

## Deployment

The site is built with `npm run generate` and the contents of `.output/public/` (aliased as `dist/`) are deployed to a static host. The two PHP files in `public/api/` are deployed alongside the static output so they end up at `/api/epub.php` and `/api/gutendex.php` on the live host.

## Privacy notes

- Local EPUB files opened by drag-and-drop or file picker are **not uploaded** — they are read by the browser via Object URLs and parsed by `epubjs` in-page.
- Reader preferences and consent choices are stored in `localStorage`.
- Analytics / ads tags are gated behind the consent component; no Tag Manager is loaded by default.
- Project Gutenberg / Gutendex requests are made client-side, optionally through the PHP proxy on the same origin to avoid CORS and 502 flakiness.
