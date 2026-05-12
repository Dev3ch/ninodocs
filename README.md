# ninodocs

Beautiful, embeddable API documentation. Mintlify-style docs via **CDN** or **npm** — no Node required on the consumer side.

## Why

- 📦 **Plug & play**: drop a `<script>` and a `<div>` into any HTML, Django template, Rails view, Laravel blade, React app, etc.
- 🎨 **Mintlify-style UI** out of the box (dark mode by default, fully themeable).
- 🔁 **Interactive "Try it"** panel with auth (Bearer, API key, Basic).
- ✍️ **Markdown-first**: write docs as `.md` files or inline strings — OpenAPI is optional.
- 🚀 **Tiny**: Preact-based, ~XX KB gzipped.

## Install

### Via CDN (no build step)

```html
<div id="docs"></div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ninodocs/dist/ninodocs.css" />
<script type="module">
  import { mount } from 'https://cdn.jsdelivr.net/npm/ninodocs/+esm';

  mount({
    target: '#docs',
    config: {
      title: 'My API',
      baseUrl: 'https://api.example.com',
      auth: { type: 'bearer' },
      sidebar: [
        {
          group: 'Endpoints',
          pages: [
            { title: 'List users', method: 'GET', path: '/users', file: '/docs/users.md' },
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
```

```ts
import { mount } from 'ninodocs';
import 'ninodocs/style.css';

mount({ target: '#docs', config: { /* … */ } });
```

## Development

```bash
yarn install
yarn dev      # demo at http://localhost:5173/demo/
yarn build    # produces ./dist with ESM + UMD + types + CSS
```

## License

MIT © Enrique Chavez
