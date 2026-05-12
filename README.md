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
