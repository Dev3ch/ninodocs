# Changelog

All notable changes to **ninodocs** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
