import { mount } from '../src';

mount({
  target: '#docs',
  config: {
    title: 'Ninodocs Demo',
    description: 'A live preview of the ninodocs library.',
    baseUrl: 'https://jsonplaceholder.typicode.com',
    theme: { mode: 'dark', primary: '#22c55e' },
    auth: { type: 'bearer', label: 'Bearer token' },
    sidebar: [
      {
        group: 'Introducción',
        pages: [
          {
            title: 'Bienvenida',
            content: `# Bienvenido a ninodocs

Esta es una librería para crear documentación interactiva de APIs, estilo Mintlify, **sin dependencias en el lado consumidor**.

## Features

- Markdown nativo (o cargado desde archivos).
- Panel "Try it" interactivo con autenticación.
- Generación automática de samples cURL, JS y Python.
- Distribuible por **CDN** o **npm**.
- Tema dark/light, totalmente personalizable.

> Selecciona un endpoint del sidebar para probarlo en vivo.
`,
          },
          {
            title: 'Autenticación',
            content: `# Autenticación

Esta API usa **Bearer tokens**. Pasa tu token en el header \`Authorization\`:

\`\`\`bash
curl --header 'Authorization: Bearer YOUR_TOKEN' ...
\`\`\`

| Tipo     | Header           |
|----------|------------------|
| Bearer   | Authorization    |
| API Key  | X-API-Key        |
| Basic    | Authorization    |
`,
          },
        ],
      },
      {
        group: 'Endpoints',
        pages: [
          {
            title: 'List posts',
            method: 'GET',
            path: '/posts',
            content: `Obtiene la lista de **todos los posts** disponibles.

Devuelve un array de objetos \`Post\`.
`,
          },
          {
            title: 'Get post',
            method: 'GET',
            path: '/posts/1',
            content: `Obtiene un post específico por su \`id\`.`,
          },
          {
            title: 'Create post',
            method: 'POST',
            path: '/posts',
            content: `Crea un nuevo post.`,
          },
          {
            title: 'Delete post',
            method: 'DELETE',
            path: '/posts/1',
            content: `Elimina un post.`,
          },
        ],
      },
    ],
  },
});
