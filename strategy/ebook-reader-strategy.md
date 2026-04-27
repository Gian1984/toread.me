# toread.me Ebook Reader Strategy

## Product Direction

`toread.me` is now a client-side ebook reader with a CodeHelper-inspired dark workspace. The current direction is EPUB-first: a visitor can read a bundled public-domain book, search Project Gutenberg titles, open a Gutenberg EPUB, or drag and drop a local EPUB without uploading that file to a backend.

The product should stay practical, static-deploy friendly, and privacy-oriented. API usage should support discovery and metadata, while the actual reading experience should remain local/browser-first whenever possible.

## Current Status

- [x] Nuxt 4 project installed and configured.
- [x] Static generation works through `npm run generate`.
- [x] Tailwind CSS is configured through `@nuxtjs/tailwindcss`.
- [x] CodeHelper-inspired layout is in place:
  - [x] dark top navigation
  - [x] collapsible dark sidebar
  - [x] compact reader-first workspace
  - [x] CodeHelper-style footer
- [x] CodeHelper cookie consent component copied and adapted:
  - [x] localStorage consent state
  - [x] analytics/ads preference toggles
  - [x] dataLayer/gtag-compatible consent events
  - [x] no Tag Manager script is loaded yet
- [x] About and Privacy pages added:
  - [x] `/about/` adapted from CodeHelper and Unlistened.me project context
  - [x] `/privacy/` adapted from CodeHelper for ebook/local reading context
  - [x] Privacy Policy linked from the footer
  - [x] CodeHelper and Unlistened.me are mentioned as related free-culture projects
- [x] toread.me logo is available as WebP in `public/images/toread-logo.webp`.
- [x] Favicons were generated from the navbar logo:
  - [x] `public/favicon.ico`
  - [x] `public/favicon.png`
  - [x] `public/apple-touch-icon.png`
- [x] SEO foundation is in place:
  - [x] centralized page registry in `utils/pagesRegistry.ts`
  - [x] reusable `useSeo` composable for page meta, canonical links, Open Graph, Twitter cards, breadcrumbs, FAQ schema, and JSON-LD graph data
  - [x] home, library, about, and privacy pages registered with page-specific metadata
  - [x] Nuxt sitemap module installed and configured
  - [x] static sitemap generated during `npm run generate`
- [x] Social preview image generation is in place:
  - [x] PHP/GD script creates page-specific OG, Twitter, and square images
  - [x] generated images are stored in `public/images/social/`
  - [x] GitHub Action runs the generator before static generation
- [x] Old duplicate root file `app 2.vue` was removed because Nuxt uses `app.vue` as the app entrypoint and the duplicate contained an older obsolete implementation.
- [x] EPUB reader is implemented with `epubjs`.
- [x] Bundled public-domain EPUB is included:
  - [x] `Pride and Prejudice` by Jane Austen
  - [x] source: Project Gutenberg ebook #1342
  - [x] local file: `public/books/pride-and-prejudice.epub`
- [x] Project Gutenberg discovery is integrated through Gutendex:
  - [x] navbar search calls Gutendex
  - [x] popular books load from Gutendex
  - [x] `/library/` is a real page, not only a home section
  - [x] library page uses Gutendex `topic` queries for multiple categories
  - [x] each library category starts with six books and supports "Load more"
  - [x] library page includes a language filter for English, Italian, Spanish, French, German, Portuguese, and Greek
  - [x] book covers are shown when available
  - [x] selecting a Gutendex result updates the active book context
  - [x] selecting a library book routes back to the reader with the Gutenberg book id
  - [x] remote EPUB CORS failures are handled with a visible reader message instead of an endless loading state
- [x] Local EPUB opening is supported:
  - [x] file input
  - [x] global drag and drop overlay
  - [x] imported file is opened through a browser object URL
- [x] Reader settings are available in a reusable popover:
  - [x] day/night mode
  - [x] paper warmth
  - [x] font size
  - [x] line height
  - [x] typeface selector
  - [x] bold text toggle
- [x] Fullscreen reader mode is implemented:
  - [x] app chrome hides while fullscreen reader is active
  - [x] browser fullscreen is requested when available
  - [x] settings popover is available while fullscreen
- [x] Pagination controls are implemented:
  - [x] previous page
  - [x] next page
  - [x] page counter
  - [x] keyboard left/right navigation
- [x] GitHub Action deploy workflow exists for FTP deploy on push to `main`.
- [x] PHP server proxies are bundled in `public/api/`:
  - [x] `public/api/gutendex.php` proxies the Gutendex JSON API
  - [x] `public/api/epub.php` streams EPUB downloads from `gutenberg.org`/`gutenberg.pglaf.org`
  - [x] EPUB proxy streams chunks with `flush()` and `X-Accel-Buffering: no` so nginx forwards bytes as they arrive instead of buffering the whole file (which previously caused intermittent 502s on slow Gutenberg downloads)
  - [x] EPUB proxy inspects upstream headers before sending body, so a 4xx upstream surfaces correctly instead of producing a hung connection or an empty `application/epub+zip` response

## Current Project Structure

```text
toread.me/
├── .github/
│   └── workflows/deploy.yml
├── README.md
├── app.vue
├── assets/
│   ├── css/tailwind.css
│   └── toread-logo-source.svg
├── components/
│   ├── AppFooter.vue
│   ├── CookieConsent.vue
│   ├── EbookReader.vue
│   └── ReaderSettingsPopover.vue
├── composables/
│   ├── useGutendex.ts
│   └── useSeo.ts
├── data/
│   └── sampleBooks.ts
├── public/
│   ├── api/epub.php
│   ├── api/gutendex.php
│   ├── books/pride-and-prejudice.epub
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.png
│   ├── images/partners/codehelper-logo.webp
│   ├── images/partners/unlistened-logo.png
│   ├── images/social/about-og.png
│   ├── images/social/about-square.png
│   ├── images/social/about-twitter.png
│   ├── images/social/library-og.png
│   ├── images/social/library-square.png
│   ├── images/social/library-twitter.png
│   ├── images/social/home-og.png
│   ├── images/social/home-square.png
│   ├── images/social/home-twitter.png
│   ├── images/social/privacy-og.png
│   ├── images/social/privacy-square.png
│   ├── images/social/privacy-twitter.png
│   └── images/toread-logo.webp
├── pages/
│   ├── about.vue
│   ├── index.vue
│   ├── library.vue
│   └── privacy.vue
├── scripts/
│   └── generate-social-images.php
├── strategy/
│   └── ebook-reader-strategy.md
├── utils/
│   └── pagesRegistry.ts
├── nuxt.config.ts
├── package.json
├── package-lock.json
└── tailwind.config.js
```

Generated/local folders that are not part of the product source:

```text
.nuxt/
.output/
node_modules/
dist -> .output/public
.idea/
.claude/
```

## File Responsibilities

- `app.vue` is the main application shell. It owns top navigation, sidebar state, search state, active book state, global drag/drop, fullscreen reader state, Gutendex loading, and page layout.
- `components/EbookReader.vue` owns EPUB rendering. It dynamically imports `epubjs`, renders the active book, applies reader theme styles, tracks page count, handles previous/next page, keyboard arrows, and reader resizing.
- `components/ReaderSettingsPopover.vue` owns the reader settings UI. It is reused in the normal navbar and in fullscreen mode.
- `components/AppFooter.vue` contains the footer adapted from CodeHelper.
- `components/CookieConsent.vue` contains the cookie preference banner adapted from CodeHelper. It prepares consent and dataLayer events but does not load Tag Manager by itself.
- `pages/about.vue` explains toread.me and links it with CodeHelper and Unlistened.me as part of a wider free-culture project.
- `pages/library.vue` is the browsable Project Gutenberg library page. It loads Gutendex categories by topic, displays six books per category, supports load more, and filters results by selected European language.
- `pages/privacy.vue` documents local EPUB handling, browser storage, Gutendex, Project Gutenberg, and future consent-based analytics.
- `pages/index.vue` exists so Nuxt can prerender `/`; the reader home is still currently rendered by `app.vue`.
- `composables/useGutendex.ts` contains the Gutendex API helpers: search, popular books, EPUB URL extraction, cover URL extraction, and author formatting.
  It also supports generic list queries with `topic`, `languages`, `sort`, and `page`, plus direct book loading by Gutenberg ID.
  Calls go through the local PHP proxy first (`/api/gutendex.php`) and fall back to a direct call to `gutendex.com` if the proxy fails.
- `public/api/gutendex.php` proxies Gutendex JSON queries through the same origin so the static frontend avoids cross-origin caching pitfalls. Timeouts are kept comfortably below typical nginx upstream limits and 502 responses always return JSON with the upstream status.
- `public/api/epub.php` proxies EPUB downloads from allowed Gutenberg hosts and streams the response chunk by chunk. Anti-buffering headers and explicit `flush()` calls keep nginx and PHP-FPM forwarding bytes as they arrive, which prevents 502 errors on slow Gutenberg downloads. The frontend reaches it via `getReaderEpubUrl()` so `epubjs` consumes a same-origin URL and avoids browser CORS rejections on remote EPUBs.
- `composables/useSeo.ts` reads from the page registry and applies SEO metadata, canonical and alternate links, Open Graph, Twitter metadata, and JSON-LD structured data.
- `data/sampleBooks.ts` contains the bundled default book metadata. This name is still technical and should be renamed later.
- `public/books/pride-and-prejudice.epub` is the bundled EPUB shipped with the static site.
- `public/images/toread-logo.webp` is the logo used at runtime.
- `public/favicon.ico`, `public/favicon.png`, and `public/apple-touch-icon.png` are generated from the toread.me logo and linked in `nuxt.config.ts`.
- `public/images/social/` contains generated OG, Twitter, and square social preview images for the registered pages.
- `assets/toread-logo-source.svg` is the editable source used to generate the WebP logo.
- `assets/css/tailwind.css` loads Tailwind base/components/utilities.
- `tailwind.config.js` defines Tailwind content scanning and local design tokens.
- `utils/pagesRegistry.ts` is the single registry for public page metadata, sitemap data, FAQ data, breadcrumbs, structured data, and social image paths.
- `scripts/generate-social-images.php` generates social preview images from the blue brand background, centered logo, site name, and page subtitle.
- `.github/workflows/deploy.yml` runs install, PHP GD setup, social image generation, static generation, and FTP deploy.

## Cleanup Already Done

- [x] Removed `app 2.vue`.

Reason: Nuxt expects `app.vue` as the root app component. A second root file named `app 2.vue` is not part of Nuxt routing or app bootstrapping. It contained an older, smaller page implementation and would only create confusion.

- [x] Added `.claude` to `.gitignore` and removed any tracked content under that folder.

Reason: `.claude` is local tooling state and must not be part of the repository or the deployed static site.

## Next Work

- [ ] Split `app.vue` into focused components:
  - [ ] `AppHeader`
  - [ ] `AppSidebar`
  - [ ] `ReaderShell`
  - [ ] `LibraryGrid`
  - [ ] `SearchResults`
  - [ ] `DragDropOverlay`
- [ ] Rename `data/sampleBooks.ts` to a product-oriented name:
  - [ ] `data/books.ts`
  - [ ] or `data/defaultBooks.ts`
- [ ] Persist reader preferences in `localStorage`:
  - [ ] theme mode
  - [ ] paper warmth
  - [ ] font size
  - [ ] line height
  - [ ] selected typeface
  - [ ] bold text
- [ ] Persist reading position:
  - [ ] bundled book CFI
  - [ ] Gutendex book CFI
  - [ ] local object URL/session book CFI
- [ ] Improve Gutendex integration:
  - [ ] decide whether remote Gutenberg EPUBs should be mirrored or proxied through a backend endpoint
  - [x] handle CORS or remote EPUB loading failures cleanly
  - [x] create a real `/library/` page instead of treating Library as only a home section
  - [x] add topic-based library categories
  - [x] add language filtering for common European languages
  - [x] add per-category "Load more"
  - [ ] add loading state for selecting a remote EPUB if proxy/mirroring is introduced
  - [ ] show when a Gutendex result has no EPUB format
  - [x] add paging or "load more" for library results
  - [ ] avoid repeated API calls when search query is unchanged
- [ ] Improve local EPUB import:
  - [ ] read EPUB metadata for title and author
  - [ ] read cover image when present
  - [ ] show unsupported/corrupt file errors
  - [ ] support reopening recent local files when browser APIs allow it
- [ ] Build real library state:
  - [ ] current book
  - [ ] recent Gutenberg books
  - [ ] recent local EPUB names
  - [ ] remove from library
  - [ ] empty states
- [ ] Add bookmarks and notes:
  - [ ] bookmark current reader location
  - [ ] list bookmarks
  - [ ] jump to bookmark
  - [ ] optional note per bookmark
  - [ ] export/import notes as JSON
- [ ] Improve reader controls:
  - [ ] page width control
  - [ ] margin control
  - [ ] mobile bottom toolbar
  - [ ] visible chapter/title metadata
  - [ ] table of contents support
- [ ] Improve accessibility:
  - [ ] focus trapping inside fullscreen reader/settings
  - [ ] stronger keyboard support for settings
  - [ ] test screen reader labels
  - [ ] reduced-motion checks
- [ ] Add engineering checks:
  - [ ] lint command
  - [ ] typecheck command
  - [ ] CI build check before FTP deploy
  - [ ] dependency audit decision for `epubjs` transitive warnings
- [x] SEO foundation:
  - [x] page registry
  - [x] `useSeo` composable
  - [x] sitemap module
  - [x] deploy-time social image generation
  - [ ] validate generated rich results with Google Rich Results Test
  - [ ] submit sitemap in Google Search Console
  - [ ] decide final trailing-slash policy for public routes and sitemap URLs
  - [ ] add robots.txt review after production URL structure is final
  - [ ] add per-book SEO only if public book detail pages are introduced
- [ ] Dependency cleanup:
  - [ ] verify whether `@tanstack/vue-virtual` is needed
  - [ ] remove unused packages after the library UI stabilizes
- [x] Privacy/legal pages:
  - [x] add `/privacy/` route for the CookieConsent privacy link
  - [x] document local EPUB handling and localStorage usage
  - [ ] add Tag Manager only after final consent strategy is approved
- [ ] Visual QA:
  - [ ] desktop wide viewport
  - [ ] laptop viewport
  - [ ] tablet viewport
  - [ ] mobile viewport
  - [ ] sidebar open/closed
  - [ ] fullscreen reader
  - [ ] day/night reader
  - [ ] settings popover in normal and fullscreen modes

## Deployment Notes

- Build command: `npm run generate`.
- Static output: `.output/public`.
- `dist` is a local symlink to `.output/public`.
- Deploy flow: push to `main` triggers GitHub Actions FTP deploy.
- The deploy workflow installs PHP GD, runs `php scripts/generate-social-images.php`, then runs `npx nuxi generate`.
- Sitemap output is generated by `@nuxtjs/sitemap` during static generation.
- Social preview source images are generated before Nuxt builds so registry metadata can point at real files.
- `public/api/*.php` files are copied verbatim into the static output, so the hosting environment must expose PHP at the same origin (PHP-FPM behind nginx is the assumed setup). The EPUB proxy expects `proxy_buffering` to be effectively off for that response, which is what `X-Accel-Buffering: no` enables on standard nginx configurations.
- Required GitHub secrets:
  - `FTP_SERVER`
  - `FTP_USERNAME`
  - `FTP_PASSWORD`
  - `FTP_SERVER_DIR`
- For HestiaCP/custom FTP users, `FTP_SERVER_DIR` must be the path visible to the FTP user, not necessarily the absolute SSH filesystem path.

## Open Product Questions

- Should Gutendex search remain the main discovery source, or should it only be a secondary "find public-domain books" feature?
- Should the bundled `Pride and Prejudice` stay visible in production, or only act as a fallback when no book has been selected?
- Should local library persistence stay client-only, or eventually support login/cloud sync?
- Should notes and bookmarks be private browser storage only, or exportable/importable as portable JSON?
- Should PDF support be deliberately excluded from v1 to keep the reader focused on EPUB?
