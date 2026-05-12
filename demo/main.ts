import { mount } from '../src';

mount({
  target: '#docs',
  config: {
    title: 'ninodocs',
    description:
      'Documentación de API embebible e interactiva — sin Node, sin SaaS, sin build step en el consumidor. v1.0.0',
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
- **Try it interactivo** — edita path params, query, headers y body; ejecuta y mira la respuesta.
- **Samples auto-generados** en cURL, JavaScript y Python, que se actualizan en vivo.
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
            query: [
              { name: 'userId', type: 'integer', description: 'Filtra posts por autor', example: 1 },
              { name: '_limit', type: 'integer', description: 'Máximo de resultados', example: 10 },
            ],
            content: `Obtiene la lista completa de posts disponibles.

Devuelve un array de objetos \`Post\`. Usa los parámetros de query en el panel derecho para filtrar y limitar resultados.
`,
            responses: [
              {
                status: 200,
                description: 'OK',
                example: [
                  { id: 1, userId: 1, title: 'sunt aut facere…', body: 'quia et suscipit…' },
                  { id: 2, userId: 1, title: 'qui est esse', body: 'est rerum tempore…' },
                ],
              },
              {
                status: 401,
                description: 'Unauthorized',
                example: { error: 'invalid_token', message: 'El bearer token es inválido.' },
              },
            ],
          },
          {
            title: 'Obtener post',
            method: 'GET',
            path: '/posts/{id}',
            params: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'Identificador único del post',
                example: 1,
              },
            ],
            content: `Recupera un post específico por su \`id\`.

Cambia el valor de \`id\` en el panel derecho para probar con otros posts (prueba con 2, 3, 42…).
`,
            responses: [
              {
                status: 200,
                description: 'OK',
                example: { id: 1, userId: 1, title: 'sunt aut facere…', body: 'quia et suscipit…' },
              },
              {
                status: 404,
                description: 'Not found',
                example: { error: 'not_found', message: 'No existe un post con ese id.' },
              },
            ],
          },
          {
            title: 'Crear post',
            method: 'POST',
            path: '/posts',
            body: {
              contentType: 'application/json',
              example: {
                title: 'Mi post',
                body: 'Contenido del post…',
                userId: 1,
              },
            },
            content: `Crea un nuevo post.

Edita el body en el panel derecho y dale a **Send POST** para crear uno. La API de prueba responde \`201\` con el recurso creado.
`,
            responses: [
              {
                status: 201,
                description: 'Created',
                example: { id: 101, title: 'Mi post', body: 'Contenido del post…', userId: 1 },
              },
              {
                status: 400,
                description: 'Bad request',
                example: {
                  error: 'validation_error',
                  fields: { title: 'es requerido', userId: 'debe ser un entero' },
                },
              },
              {
                status: 401,
                description: 'Unauthorized',
                example: { error: 'invalid_token' },
              },
            ],
          },
          {
            title: 'Actualizar post',
            method: 'PUT',
            path: '/posts/{id}',
            params: [
              { name: 'id', type: 'integer', required: true, example: 1 },
            ],
            body: {
              contentType: 'application/json',
              example: {
                id: 1,
                title: 'Título actualizado',
                body: 'Nuevo contenido',
                userId: 1,
              },
            },
            content: `Actualiza un post existente reemplazando todos sus campos.
`,
            responses: [
              {
                status: 200,
                description: 'OK',
                example: { id: 1, title: 'Título actualizado', body: 'Nuevo contenido', userId: 1 },
              },
              { status: 404, description: 'Not found', example: { error: 'not_found' } },
            ],
          },
          {
            title: 'Eliminar post',
            method: 'DELETE',
            path: '/posts/{id}',
            params: [
              { name: 'id', type: 'integer', required: true, example: 1 },
            ],
            content: `Elimina un post existente.

> Esta acción es **irreversible**.
`,
            responses: [
              { status: 200, description: 'OK', example: {} },
              { status: 404, description: 'Not found', example: { error: 'not_found' } },
              { status: 403, description: 'Forbidden', example: { error: 'forbidden' } },
            ],
          },
        ],
      },
    ],
  },
});
