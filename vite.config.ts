import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      preact(),
      tailwindcss(),
      isBuild &&
        dts({
          include: ['src'],
          insertTypesEntry: true,
          rollupTypes: true,
        }),
    ].filter(Boolean),

    build: isBuild
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Ninodocs',
            fileName: (format) =>
              format === 'es' ? 'ninodocs.js' : `ninodocs.${format}.cjs`,
            formats: ['es', 'umd'],
          },
          sourcemap: true,
          cssCodeSplit: false,
          rollupOptions: {
            output: {
              assetFileNames: (asset) =>
                asset.names?.[0] === 'style.css' || asset.name === 'style.css'
                  ? 'ninodocs.css'
                  : (asset.name ?? 'asset'),
            },
          },
        }
      : undefined,

    server: {
      port: 5173,
      open: '/demo/',
    },

    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
  };
});
