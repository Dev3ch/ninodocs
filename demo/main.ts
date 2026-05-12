import { mount } from '../src';

mount({
  target: '#docs',
  config: {
    title: 'ninodocs',
    description:
      'Documentación de API embebible al estilo Mintlify — sin Node, sin SaaS, sin build step en el consumidor.',
    baseUrl: 'https://jsonplaceholder.typicode.com',
    theme: { mode: 'dark', primary: '#22c55e' },
    auth: { type: 'bearer', label: 'Bearer token' },
    sidebar: [
      {
        group: 'Empezar',
        pages: [
          {
            title: 'Introducción',
            content: `Bienvenido a **ninodocs**, una librería liviana para construir documentación de APIs interactiva y bonita, embebible en cualquier proyecto: Django, Rails, Laravel, React, Next, o HTML plano.

## Por qué

- **Plug & play** — un \`<script>\` y un \`<div>\` bastan.
- **Markdown nativo** — escribe tus docs como \`.md\` o como string inline.
- **Try it interactivo** — autenticación, llamada real, respuesta visualizada.
- **Samples auto-generados** en cURL, JavaScript y Python.
- **Tema dark/light**, totalmente personalizable vía CSS variables.

> Selecciona un endpoint en el sidebar para probarlo en vivo.

## Instalación

\`\`\`html
<div id="docs"></div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ninodocs/dist/ninodocs.css" />
<script type="module">
  import { mount } from 'https://cdn.jsdelivr.net/npm/ninodocs/+esm';
  mount({ target: '#docs', config: { /* … */ } });
</script>
\`\`\`
`,
          },
          {
            title: 'Autenticación',
            content: `Esta API usa **Bearer tokens**. Pasa tu token en el header \`Authorization\`:

\`\`\`bash
curl --header 'Authorization: Bearer YOUR_TOKEN' https://api.example.com/me
\`\`\`

### Tipos soportados

| Tipo     | Header           | Notas                              |
|----------|------------------|------------------------------------|
| Bearer   | Authorization    | \`Bearer <token>\`                 |
| API Key  | X-API-Key        | Header configurable                |
| Basic    | Authorization    | \`Basic base64(user:pass)\`        |

> Pega tu token en el panel derecho y ejecuta cualquier endpoint para probarlo.
`,
          },
        ],
      },
      {
        group: 'Posts',
        pages: [
          {
            title: 'Listar posts',
            method: 'GET',
            path: '/posts',
            content: `Obtiene la lista completa de posts disponibles.

Devuelve un array de objetos \`Post\`.

### Respuesta de ejemplo

\`\`\`json
[
  { "id": 1, "userId": 1, "title": "…", "body": "…" }
]
\`\`\`
`,
          },
          {
            title: 'Obtener post',
            method: 'GET',
            path: '/posts/1',
            content: `Recupera un post específico por su \`id\`.

### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| \`id\`    | integer | Identificador único  |
`,
          },
          {
            title: 'Crear post',
            method: 'POST',
            path: '/posts',
            content: `Crea un nuevo post.

### Body

\`\`\`json
{
  "title": "Mi post",
  "body": "Contenido…",
  "userId": 1
}
\`\`\`
`,
          },
          {
            title: 'Eliminar post',
            method: 'DELETE',
            path: '/posts/1',
            content: `Elimina un post existente.

> Esta acción es **irreversible**.
`,
          },
        ],
      },
    ],
  },
});
