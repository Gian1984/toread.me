# toread.me Ebook Reader Strategy

## Goal

Build `toread.me` as a client-side ebook reader rather than a PodcastIndex-powered site. The first product surface should feel close to CodeHelper: practical, organized, privacy-minded, fast, and static-deploy friendly.

## Phase 1: Product Shell

- Replace the coming soon page with a real reader-oriented first screen.
- Add the toread.me logo as a WebP asset in `public/images`.
- Use Tailwind as the styling baseline.
- Introduce a CodeHelper-like structure: top navigation, sidebar/workspace layout, primary content area, compact cards, and clear controls.
- Add reader theme controls:
  - Day mode with adjustable white-to-beige background.
  - Night mode with black background and white text.

## Phase 2: Local Reading Experience

- Add upload/import flow for ebook files.
- Start with browser-friendly formats and metadata previews.
- Store reader preferences locally.
- Keep processing client-side wherever possible.

## Bundled Ebook

- Included reader book: `Pride and Prejudice` by Jane Austen.
- Source: Project Gutenberg, ebook #1342.
- Local file: `public/books/pride-and-prejudice.epub`.
- Format: EPUB, small enough for repeatable reader checks.
- Copyright status listed by Project Gutenberg: public domain in the USA.

## Phase 3: Library And Reader

- Add a local library view.
- Add reader typography controls: font size, line height, page width, and progress.
- Add bookmarks and last-position recovery.

## Phase 4: Content Formats

- Evaluate EPUB parsing for browser use.
- Add PDF only if the UX remains readable and maintainable.
- Keep API integrations optional and separate from the core reader.
