import { useEffect, useMemo, useState } from 'preact/hooks';
import type { NinodocsConfig, Page, ResponseSpec } from '../types';
import { isEndpoint } from '../types';
import { loadMarkdown, renderMarkdown } from '../markdown';
import { flattenPages, navigate } from '../state';
import { IconArrowLeft, IconArrowRight } from './icons';
import { EndpointBar } from './EndpointBar';
import { ParamsDoc } from './ParamsDoc';
import { TryItDrawer } from './TryItDrawer';
import { CodeBlock } from './CodeBlock';

interface Props {
  config: NinodocsConfig;
  page: Page | null;
  slug: string;
}

export function Content({ config, page, slug }: Props) {
  const [html, setHtml] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const endpoint = page && isEndpoint(page) ? page : null;

  useEffect(() => {
    setDrawerOpen(false);
  }, [endpoint]);

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
      </header>

      {endpoint && (
        <EndpointBar config={config} endpoint={endpoint} onOpen={() => setDrawerOpen(true)} />
      )}

      <article class="nd-prose" dangerouslySetInnerHTML={{ __html: html }} />

      {endpoint && <ParamsDoc config={config} endpoint={endpoint} />}

      {endpoint && endpoint.responses && endpoint.responses.length > 0 && (
        <ResponsesSection responses={endpoint.responses} />
      )}

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

      {endpoint && (
        <TryItDrawer
          config={config}
          endpoint={endpoint}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </main>
  );
}

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'ok';
  if (status >= 300 && status < 400) return 'redir';
  if (status >= 400 && status < 500) return 'cli';
  if (status >= 500) return 'srv';
  return 'meta';
}

function formatExample(r: ResponseSpec): string {
  if (r.example === undefined) return '';
  if (typeof r.example === 'string') return r.example;
  try {
    return JSON.stringify(r.example, null, 2);
  } catch {
    return String(r.example);
  }
}

function ResponsesSection({ responses }: { responses: ResponseSpec[] }) {
  const sorted = useMemo(() => [...responses].sort((a, b) => a.status - b.status), [responses]);
  const [active, setActive] = useState<number>(sorted[0]?.status ?? 0);
  const current = sorted.find((r) => r.status === active) ?? sorted[0];
  if (!current) return null;
  const example = formatExample(current);

  return (
    <section class="nd-responses" aria-label="Responses">
      <h2 class="nd-responses-title">Responses</h2>
      <div class="nd-responses-tabs" role="tablist">
        {sorted.map((r) => (
          <button
            key={r.status}
            role="tab"
            aria-selected={r.status === active}
            class={`nd-responses-tab ${r.status === active ? 'active' : ''}`}
            onClick={() => setActive(r.status)}
          >
            <span class={`nd-status-pill ${statusClass(r.status)}`}>{r.status}</span>
            {r.description && <span class="nd-responses-desc">{r.description}</span>}
          </button>
        ))}
      </div>
      {example ? (
        <div class="nd-responses-body-wrap">
          <CodeBlock code={example} lang="json" />
        </div>
      ) : (
        <p class="nd-responses-empty">Sin payload de ejemplo.</p>
      )}
    </section>
  );
}
