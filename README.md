# ninodocs

Beautiful, embeddable API documentation. Drop-in interactive docs via **CDN** or **npm** — no Node required on the consumer side.

<p align="left">
  <a href="https://www.npmjs.com/package/ninodocs"><img alt="npm" src="https://img.shields.io/npm/v/ninodocs.svg"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-green.svg"></a>
  <img alt="Tiny" src="https://img.shields.io/badge/gzip-~110kB-blue">
</p>

## Why

- 📦 **Plug & play** — drop a `<script>` and a `<div>` into any HTML page, Django template, Rails view, Laravel blade or React app.
- 🎨 **Polished UI** out of the box (dark mode by default, fully themeable via CSS variables).
- 🔁 **Interactive Try-it drawer** with auth (Bearer, API key, Basic), editable body, path params, query and headers.
- ⚡ **Live samples** in cURL, JavaScript and Python — they update as the user edits the request.
- ✍️ **Markdown-first** — write your docs as `.md` files or inline strings.
- 📂 **Token persistence** — credentials are saved in `localStorage` so users don't re-paste tokens between reloads.
- 🚀 **Tiny** — Preact-based, ~110 KB gzipped (including syntax highlighter).
- 🧩 **TypeScript-first** — full types exported for the config schema.

## Quick start

### Via CDN (no build step)

You don't host anything. As soon as the package is published to npm, jsDelivr and unpkg serve it automatically at predictable URLs:

```html
<div id="docs"></div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ninodocs@1/dist/ninodocs.css" />
<script type="module">
  import { mount } from 'https://cdn.jsdelivr.net/npm/ninodocs@1/+esm';

  mount({
    target: '#docs',
    config: {
      title: 'My API',
      baseUrl: 'https://api.example.com',
      auth: { type: 'bearer', label: 'Bearer token' },
      sidebar: [
        {
          group: 'Posts',
          pages: [
            { title: 'List posts', method: 'GET', path: '/posts' },
            {
              title: 'Get post',
              method: 'GET',
              path: '/posts/{id}',
              params: [{ name: 'id', type: 'integer', required: true, example: 1 }],
            },
          ],
        },
      ],
    },
  });
</script>
```

**CDN URL patterns:**

| Pin to…              | Example                                                           | When to use                                       |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| Major version (`@1`) | `https://cdn.jsdelivr.net/npm/ninodocs@1/+esm`                    | Recommended. Auto-updates within v1.x.            |
| Minor (`@1.0`)       | `https://cdn.jsdelivr.net/npm/ninodocs@1.0/+esm`                  | Auto-updates only patches (e.g. 1.0.1 → 1.0.2).   |
| Exact (`@1.0.1`)     | `https://cdn.jsdelivr.net/npm/ninodocs@1.0.1/+esm`                | Reproducible — never changes.                     |
| Latest               | `https://cdn.jsdelivr.net/npm/ninodocs/+esm`                      | Always the newest. Not recommended for prod.      |

unpkg works the same way: `https://unpkg.com/ninodocs@1/dist/ninodocs.js`.

### Via npm

```bash
yarn add ninodocs
# or
npm install ninodocs
```

```ts
import { mount } from 'ninodocs';
import 'ninodocs/style.css';

mount({ target: '#docs', config: { /* … */ } });
```

## Configuration

The full schema is exported as `NinodocsConfig`. Key fields:

| Field         | Type                                  | Description                                              |
| ------------- | ------------------------------------- | -------------------------------------------------------- |
| `title`       | `string`                              | Brand title shown in the sidebar.                        |
| `description` | `string`                              | Subtitle on the landing page.                            |
| `baseUrl`     | `string`                              | Base URL used by every endpoint (can be overridden).     |
| `theme`       | `{ mode, primary, primaryForeground }`| Dark/light mode and brand color.                         |
| `auth`        | `{ type, headerName?, label? }`       | `bearer` / `apiKey` / `basic` / `none`.                  |
| `sidebar`     | `SidebarGroup[]`                      | Grouped list of pages.                                   |
| `footer`      | `{ label, href }[]`                   | Optional footer links.                                   |

### Endpoint pages

```ts
{
  title: 'Create post',
  method: 'POST',
  path: '/posts',
  params: [/* path params: matched against {placeholders} */],
  query:  [/* query string parameters */],
  headers:[/* custom headers (besides auth + content-type) */],
  body: {
    contentType: 'application/json',
    example: { title: 'My post', userId: 1 },
  },
  responses: [
    { status: 201, description: 'Created', example: { id: 101, /* … */ } },
    { status: 400, description: 'Validation error', example: { error: '…' } },
  ],
  content: 'Markdown description…',
}
```

### Public endpoints (opt out of global auth)

By default every endpoint inherits the global `config.auth`. For public endpoints like `/auth/login` or `/health`, declare `auth: { type: 'none' }` on the page itself:

```ts
{
  title: 'Login',
  method: 'POST',
  path: '/auth/login',
  auth: { type: 'none' },          // ← removes the Authorization input + header
  body: {
    contentType: 'application/json',
    example: { email: 'user@example.com', password: '••••••••' },
  },
}
```

The Authorization field disappears from the Try-it drawer and the `Authorization` header is no longer injected into the cURL / JS / Python samples.

You can also override the auth scheme per-endpoint (e.g. an endpoint that uses Basic auth while the rest of the API uses Bearer) — just pass any `AuthConfig` shape.

### Documentation versions

Ship multiple API versions side-by-side with `config.versions`. Each version is a partial override of the root config:

```ts
mount({
  target: '#docs',
  config: {
    title: 'My API',
    baseUrl: 'https://api.example.com',
    sidebar: [/* v1 sidebar (default) */],
    versions: [
      {
        id: 'v1',
        label: 'v1.0',
        badge: 'current',
        current: true,
        config: { baseUrl: 'https://api.example.com/v1' },
      },
      {
        id: 'v0',
        label: 'v0.9',
        badge: 'legacy',
        config: {
          baseUrl: 'https://api.example.com/v0',
          sidebar: [/* legacy sidebar */],
        },
      },
    ],
  },
});
```

What you get:

- A **Version** selector at the top of the sidebar.
- The active version is **persisted in `localStorage`** (`ninodocs:version`).
- The URL hash includes the version (`#/v=v1/posts/list-posts`), so links are shareable and reproducible.
- Each version can override `sidebar`, `baseUrl`, `auth`, `title` — anything except `versions` itself.

### Theming

Everything is driven by CSS variables (`--nd-primary`, `--nd-bg`, `--nd-text`, …). Override them anywhere after the stylesheet loads:

```css
.ninodocs {
  --nd-primary: #6366f1;
  --nd-primary-foreground: #ffffff;
}
```

## Development

```bash
yarn install
yarn dev        # demo at http://localhost:5173/demo/
yarn build      # produces ./dist with ESM + UMD + types + CSS
yarn typecheck
yarn lint
```

## Versioning & releases

- This project follows [Semantic Versioning](https://semver.org).
- See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## License

[MIT](./LICENSE) © Enrique Chavez
