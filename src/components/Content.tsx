import { useEffect, useState } from 'preact/hooks';
import type { NinodocsConfig, Page } from '../types';
import { isEndpoint } from '../types';
import { loadMarkdown, renderMarkdown } from '../markdown';
import { flattenPages, navigate } from '../state';
import { IconArrowLeft, IconArrowRight } from './icons';

interface Props {
  config: NinodocsConfig;
  page: Page | null;
  slug: string;
}

export function Content({ config, page, slug }: Props) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (!page) {
      setHtml('');
      return;
    }
    let cancelled = false;
    const apply = (src: string) => !cancelled && setHtml(renderMarkdown(src));
    if (page.content) apply(page.content);
    else if (page.file) {
      loadMarkdown(page.file)
        .then(apply)
        .catch((err) => !cancelled && setHtml(`<p>Error: ${err.message}</p>`));
    } else setHtml('');
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (!page) {
    return (
      <main class="nd-main">
        <header class="nd-page-header">
          <h1 class="nd-page-title">{config.title}</h1>
          {config.description && <p class="nd-page-description">{config.description}</p>}
        </header>
      </main>
    );
  }

  const flat = flattenPages(config);
  const idx = flat.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const groupName = flat[idx]?.group;

  return (
    <main class="nd-main">
      <header class="nd-page-header">
        {groupName && <div class="nd-page-eyebrow">{groupName}</div>}
        <h1 class="nd-page-title">{page.title}</h1>
        {isEndpoint(page) && (
          <div class="nd-endpoint-bar" role="group" aria-label="HTTP endpoint">
            <span class={`nd-method ${page.method}`}>{page.method}</span>
            <span class="nd-endpoint-path">{page.path}</span>
          </div>
        )}
      </header>

      <article class="nd-prose" dangerouslySetInnerHTML={{ __html: html }} />

      {(prev || next) && (
        <nav class="nd-page-nav" aria-label="Page navigation">
          {prev ? (
            <a
              class="nd-page-nav-link prev"
              href={`#/${prev.slug}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(prev.slug);
              }}
            >
              <span class="nd-page-nav-label">
                <IconArrowLeft /> Previous
              </span>
              <span class="nd-page-nav-title">{prev.page.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a
              class="nd-page-nav-link next"
              href={`#/${next.slug}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(next.slug);
              }}
            >
              <span class="nd-page-nav-label">
                Next <IconArrowRight />
              </span>
              <span class="nd-page-nav-title">{next.page.title}</span>
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
