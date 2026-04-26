# toread.me Ebook Reader Strategy

## Product Direction

`toread.me` is being shaped as a client-side ebook reader, not as a PodcastIndex/API-driven site. The first version should stay close to the CodeHelper feel: dark workspace, compact navigation, practical controls, static deploy, and privacy-first local reading.

Core principle: the user should be able to open the site, read an included public-domain EPUB, tune the reading experience, and later drag and drop personal EPUB files without sending the file to a backend.

## Current Status

- [x] Nuxt project installed and configured for static generation.
- [x] Tailwind CSS added as the styling baseline.
- [x] CodeHelper-inspired shell implemented:
  - [x] dark top navigation
  - [x] collapsible sidebar
  - [x] search input in the navbar
  - [x] dark cards and compact workspace layout
  - [x] CodeHelper-style footer
- [x] toread.me logo converted and added as WebP.
- [x] Reader page replaced the original coming soon page.
- [x] EPUB rendering added with `epubjs`.
- [x] Bundled book added for development and product testing:
  - [x] `Pride and Prejudice` by Jane Austen
  - [x] source: Project Gutenberg ebook #1342
  - [x] local file: `public/books/pride-and-prejudice.epub`
  - [x] public-domain status: listed by Project Gutenberg as public domain in the USA
- [x] Local EPUB drag and drop added.
- [x] Reader controls added:
  - [x] day mode
  - [x] night mode
  - [x] paper tone slider for day mode
  - [x] font size slider
  - [x] typeface selector
  - [x] bold text toggle
- [x] Reader navigation controls added:
  - [x] previous page
  - [x] next page
  - [x] page counter
  - [x] fullscreen/compact toggle
- [x] GitHub Action deploy workflow added for FTP upload on push to `main`.
- [x] Production static generation verified with `npm run generate`.

## Project Structure

```text
toread.me/
├── .github/workflows/deploy.yml
├── app.vue
├── assets/
│   ├── css/tailwind.css
│   └── toread-logo-source.svg
├── components/
│   ├── AppFooter.vue
│   └── EbookReader.vue
├── data/
│   └── sampleBooks.ts
├── public/
│   ├── books/pride-and-prejudice.epub
│   └── images/toread-logo.webp
├── strategy/
│   └── ebook-reader-strategy.md
├── nuxt.config.ts
├── package.json
├── package-lock.json
└── tailwind.config.js
```

## Structure Notes

- `app.vue` contains the current single-page product shell: navbar, sidebar, hero/status card, reader area, settings panel, library cards, and page-level state.
- `components/EbookReader.vue` owns EPUB rendering and reader navigation. It loads `epubjs` on the client, renders the current book, exposes previous/next controls, page count, and fullscreen toggle.
- `components/AppFooter.vue` contains the footer adapted from CodeHelper.
- `data/sampleBooks.ts` stores the bundled book metadata used by the current reader state.
- `public/books/pride-and-prejudice.epub` is the bundled EPUB available to the static site.
- `public/images/toread-logo.webp` is the runtime logo asset.
- `assets/toread-logo-source.svg` is the editable source used to generate the WebP logo.
- `assets/css/tailwind.css` loads the Tailwind layers.
- `tailwind.config.js` defines the Tailwind content paths.
- `.github/workflows/deploy.yml` builds the static output and deploys `.output/public` by FTP.

## Next Work

- [ ] Split `app.vue` into smaller components once the product shape stabilizes:
  - [ ] app shell/header
  - [ ] sidebar
  - [ ] reader settings panel
  - [ ] library/import panel
  - [ ] dashboard cards
- [ ] Rename `data/sampleBooks.ts` to a product-oriented name such as `data/books.ts` or `data/libraryBooks.ts`.
- [ ] Persist reader preferences in `localStorage`:
  - [ ] theme mode
  - [ ] paper tone
  - [ ] font size
  - [ ] selected typeface
  - [ ] bold text setting
- [ ] Persist last reading location per book.
- [ ] Improve EPUB import metadata:
  - [ ] read title from EPUB metadata
  - [ ] read author from EPUB metadata
  - [ ] show cover image when available
  - [ ] keep imported books in an in-browser library list
- [ ] Add real library management:
  - [ ] recent books
  - [ ] remove imported book
  - [ ] reopen last book
  - [ ] empty library state
- [ ] Add bookmarks and notes:
  - [ ] bookmark current page/location
  - [ ] list bookmarks
  - [ ] jump to bookmark
  - [ ] optional local notes
- [ ] Improve reader layout:
  - [ ] page width control
  - [ ] line-height control
  - [ ] margin control
  - [ ] mobile-specific reader controls
- [ ] Add better loading and error states:
  - [ ] unsupported file type
  - [ ] corrupted EPUB
  - [ ] missing bundled EPUB
  - [ ] reader initialization failure
- [ ] Review dependency risk from `epubjs` transitive packages and decide whether to keep, patch, or replace it.
- [ ] Add basic automated checks:
  - [ ] lint command
  - [ ] type check command
  - [ ] build check in CI before FTP deploy
- [ ] Add visual QA pass:
  - [ ] desktop wide viewport
  - [ ] laptop viewport
  - [ ] tablet viewport
  - [ ] mobile viewport
  - [ ] sidebar open/closed states
  - [ ] day/night reader states

## Deployment Notes

- The current deployment path is static: `npm run generate` creates `.output/public`.
- GitHub Actions deploys the generated static files by FTP on push to `main`.
- Required GitHub secrets:
  - `FTP_SERVER`
  - `FTP_USERNAME`
  - `FTP_PASSWORD`
  - `FTP_SERVER_DIR`
- The server target should point to the FTP-visible web root for the HestiaCP site, not necessarily the absolute filesystem path visible over SSH.

## Open Product Questions

- Should imported EPUBs persist only locally in the browser, or should there eventually be an authenticated cloud library?
- Should the site remain EPUB-only for the first release, or should PDF support be explored later?
- Should the bundled public-domain book remain visible in production, or only act as a fallback when no user book is loaded?
- Should notes/bookmarks be stored strictly client-side, or exported/imported as a portable JSON file?
