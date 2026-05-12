import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import('@shikijs/themes/github-dark-default'),
        import('@shikijs/themes/github-light-default'),
      ],
      langs: [
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/python'),
        import('@shikijs/langs/http'),
      ],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    });
  }
  return highlighterPromise;
}

export async function highlight(
  code: string,
  lang: string,
  mode: 'dark' | 'light',
): Promise<string> {
  const hl = await getHighlighter();
  const theme = mode === 'dark' ? 'github-dark-default' : 'github-light-default';
  try {
    return hl.codeToHtml(code, { lang, theme });
  } catch {
    return hl.codeToHtml(code, { lang: 'bash', theme });
  }
}
