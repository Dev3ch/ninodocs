import { useMemo, useState } from 'preact/hooks';
import type { NinodocsConfig, Page } from '../types';
import { isEndpoint } from '../types';
import { CodeBlock } from './CodeBlock';
import { curlSample, jsSample, pythonSample } from '../samples';
import { IconCheck, IconCopy, IconPlay } from './icons';

interface Props {
  config: NinodocsConfig;
  page: Page | null;
}

type Lang = 'curl' | 'js' | 'python';

const LANGS: { id: Lang; label: string; shiki: string }[] = [
  { id: 'curl', label: 'cURL', shiki: 'bash' },
  { id: 'js', label: 'JavaScript', shiki: 'javascript' },
  { id: 'python', label: 'Python', shiki: 'python' },
];

export function RightPanel({ config, page }: Props) {
  const [lang, setLang] = useState<Lang>('curl');
  const [token, setToken] = useState('');
  const [response, setResponse] = useState<{ status: number; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const themeMode = config.theme?.mode === 'light' ? 'light' : 'dark';

  if (!page || !isEndpoint(page)) {
    return <aside class="nd-right" />;
  }

  const baseUrl = page.baseUrl || config.baseUrl || '';

  const sample = useMemo(() => {
    const input = { endpoint: page, baseUrl, auth: config.auth, token };
    if (lang === 'curl') return curlSample(input);
    if (lang === 'js') return jsSample(input);
    return pythonSample(input);
  }, [page, baseUrl, config.auth, token, lang]);

  const langMeta = LANGS.find((l) => l.id === lang)!;

  const execute = async () => {
    setLoading(true);
    setResponse(null);
    const headers: Record<string, string> = {};
    if (config.auth && token) {
      if (config.auth.type === 'bearer') headers['Authorization'] = `Bearer ${token}`;
      else if (config.auth.type === 'apiKey')
        headers[config.auth.headerName || 'X-API-Key'] = token;
      else if (config.auth.type === 'basic') headers['Authorization'] = `Basic ${token}`;
    }
    try {
      const r = await fetch(`${baseUrl}${page.path}`, {
        method: page.method,
        headers,
      });
      const txt = await r.text();
      let body = txt;
      try {
        body = JSON.stringify(JSON.parse(txt), null, 2);
      } catch {
        /* not JSON, keep raw */
      }
      setResponse({ status: r.status, body });
    } catch (err) {
      setResponse({ status: 0, body: `Error: ${(err as Error).message}` });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(sample);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };

  return (
    <aside class="nd-right" aria-label="Request panel">
      <div class="nd-code-card">
        <div class="nd-code-header">
          <div class="nd-tabs" role="tablist">
            {LANGS.map((l) => (
              <button
                key={l.id}
                role="tab"
                aria-selected={lang === l.id}
                class={`nd-tab ${lang === l.id ? 'active' : ''}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            class={`nd-icon-btn ${copied ? 'copied' : ''}`}
            onClick={copy}
            aria-label="Copy code"
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? <IconCheck /> : <IconCopy />}
          </button>
        </div>
        <CodeBlock code={sample} lang={langMeta.shiki} mode={themeMode} />
      </div>

      <div class="nd-try">
        <div class="nd-try-title">Try it</div>

        {config.auth && config.auth.type !== 'none' && (
          <>
            <label class="nd-label" for="nd-token">
              {config.auth.label || 'Token'}
            </label>
            <input
              id="nd-token"
              class="nd-input"
              type="password"
              autocomplete="off"
              value={token}
              placeholder="Paste your token…"
              onInput={(e) => setToken((e.target as HTMLInputElement).value)}
            />
          </>
        )}

        <button class="nd-btn" onClick={execute} disabled={loading}>
          {loading ? (
            <>Sending…</>
          ) : (
            <>
              <IconPlay /> Send {page.method}
            </>
          )}
        </button>
      </div>

      {response && (
        <div class="nd-response-card">
          <div class="nd-code-header">
            <span class="nd-try-title" style={{ margin: 0 }}>
              Response
            </span>
            <span
              class={`nd-status-pill ${response.status >= 200 && response.status < 400 ? 'ok' : 'err'}`}
            >
              {response.status || 'ERR'}
            </span>
          </div>
          <pre>{response.body}</pre>
        </div>
      )}
    </aside>
  );
}
