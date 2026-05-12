import { useEffect, useState } from 'preact/hooks';
import type { NinodocsConfig, Page } from '../types';
import { isEndpoint } from '../types';
import { loadMarkdown, renderMarkdown } from '../markdown';

interface Props {
  config: NinodocsConfig;
  page: Page | null;
}

export function Content({ config, page }: Props) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (!page) {
      setHtml('');
      return;
    }
    let cancelled = false;
    const apply = (src: string) => {
      if (!cancelled) setHtml(renderMarkdown(src));
    };
    if (page.content) {
      apply(page.content);
    } else if (page.file) {
      loadMarkdown(page.file)
        .then(apply)
        .catch((err) => !cancelled && setHtml(`<p>Error: ${err.message}</p>`));
    } else {
      setHtml('');
    }
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (!page) {
    return (
      <main class="nd-main">
        <h1>{config.title}</h1>
        <p>{config.description || 'Select a page from the sidebar.'}</p>
      </main>
    );
  }

  return (
    <main class="nd-main">
      <div class="nd-page-header">
        <h1 class="nd-prose">{page.title}</h1>
        {isEndpoint(page) && (
          <div class="nd-endpoint-bar">
            <span class={`nd-method ${page.method}`}>{page.method}</span>
            <span>{page.path}</span>
          </div>
        )}
      </div>
      <article class="nd-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
