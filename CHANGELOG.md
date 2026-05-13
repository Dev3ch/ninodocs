# Changelog

All notable changes to **ninodocs** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] — 2026-05-13

### Fixed

- **Republish of the 1.0.3 backdrop fix** — `1.0.3` was tagged with the CSS source fix but the published `dist/ninodocs.css` on npm/jsdelivr still contained the pre-fix build, so consumers loading the CDN bundle kept seeing the half-width backdrop. This release ships a freshly built `dist/` so `.nd-main > :not(.nd-drawer-backdrop):not(.nd-drawer)` actually reaches the published artifact. No source changes vs. 1.0.3.

## [1.0.3] — 2026-05-12

### Fixed

- **Try-it drawer backdrop** — The dark backdrop now covers the entire viewport instead of only the area to the right of the sidebar. Root cause was `.nd-main > *` applying `max-width: 760px` to all direct children of `<main>`, including the fixed-positioned `.nd-drawer-backdrop`, which capped its width and left a visible gap. The selector now excludes the drawer and its backdrop.

## [1.0.2] — 2026-05-12

### Changed

- **Scroll layout** — Sidebar is now fully fixed to the viewport with its own independent scroll. The center column (documentation) and the right column (code samples) share a single scroll area that moves both together, with the cURL / JS / Python card staying `position: sticky` so it remains visible while reading. The body no longer has a global scroll. On mobile (≤860px) the layout falls back to a single auto-height column for native page scrolling.

## [1.0.1] — 2026-05-12

### Added

- **Per-endpoint auth override** — `EndpointPage` now accepts an `auth` field. Set `auth: { type: 'none' }` to opt out of the global Bearer/API-key config on public endpoints like `/auth/login` or `/health`. The Authorization field disappears from the drawer and the `Authorization` header is no longer injected into cURL / JS / Python samples. Helper `resolveAuth(endpoint, globalAuth)` is exported for advanced usage.
- **Documentation versions** — `config.versions: DocsVersion[]` lets you ship multiple API versions side-by-side. Each version has its own `sidebar`, `baseUrl`, `auth`, etc., merged on top of the root config. The sidebar renders a **Version** selector at the top; the active version is remembered in `localStorage` (`ninodocs:version`) and reflected in the URL hash (`#/v=v1/posts/listar-posts`), so users can link to a specific version. The selected version persists between reloads.
- New exported types: `DocsVersion`.

### Fixed

- Prose markdown spacing — headings (`h2`, `h3`, `h4`), code blocks, blockquotes and lists now have proper top/bottom margins so paragraphs no longer feel glued together.

### Notes

- Both changes are **fully backward compatible**: existing configs without `auth` per endpoint or without `versions` keep working exactly as before.

## [1.0.0] — 2026-05-12

First stable release.

### Added

- **Drop-in mount API** — `mount({ target, config })` renders a full docs site into any `<div>`, with no build step required on the consumer side.
- **Sidebar navigation** with grouped pages, hash-based routing, mobile drawer, and `⌘K` search affordance.
- **Markdown content** — pages can use inline `content` strings or remote `.md` files (`file`). Rendered with `markdown-it`.
- **Endpoint documentation** in read-mode:
  - `EndpointBar` with method + path and a `Try it` button.
  - `ParamsDoc` sections for `Authorizations`, `Path Parameters`, `Query Parameters`, `Headers` and `Body` — each with name, type, required flag, full description, enum options and example.
  - `Responses` section with tabs per status code (2xx / 3xx / 4xx / 5xx color-coded).
- **Interactive Try-it drawer** (slide-in panel) with:
  - Editable path params, query, headers and JSON body.
  - Live cURL / JavaScript / Python sample preview (Shiki-highlighted).
  - Real request execution with response viewer (status pill, latency, JSON pretty-print).
- **Authentication** support: `bearer`, `apiKey` (custom header name), `basic`, `none`.
- **Token persistence** in `localStorage` (`ninodocs:token`) so users don't re-paste credentials between reloads.
- **Theme system** via CSS variables (`--nd-primary`, etc.), dark mode by default, light mode via `theme.mode: 'light'`, and runtime override of `primary` color through `config.theme`.
- **Polished scrollbars** matched across sidebar, right panel, drawer and body (`scrollbar-gutter: stable` prevents layout shift when the drawer opens).
- **TypeScript-first** — all public types exported (`NinodocsConfig`, `EndpointPage`, `ParamSpec`, `HeaderSpec`, `BodySpec`, `ResponseSpec`, etc.).
- **Dual distribution** — ESM (`dist/ninodocs.js`), UMD (`dist/ninodocs.umd.cjs`), and `.d.ts` types. `style.css` exposed as a subpath export.

### Notes

- Built on Preact + `@preact/signals` for a tiny runtime footprint.
- Embeddable in any host (Django, Rails, Laravel, Next.js, plain HTML) — class prefix `.ninodocs` keeps styles scoped.
