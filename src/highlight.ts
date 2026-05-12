import {
  createHighlighterCore,
  type HighlighterCore,
} from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

let highlighterPromise: Promise<HighlighterCore> | null = null;

const LANGS = ['bash', 'json', 'javascript', 'typescript', 'python', 'http'];

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import('shiki/themes/github-dark-default.mjs'),
        import('shiki/themes/github-light-default.mjs'),
      ],
      langs: LANGS.map((l) => import(`shiki/langs/${l}.mjs`)),
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
