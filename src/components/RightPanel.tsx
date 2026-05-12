import { useMemo, useState } from 'preact/hooks';
import type { NinodocsConfig, Page } from '../types';
import { isEndpoint } from '../types';
import { CodeBlock } from './CodeBlock';
import { curlSample, jsSample, pythonSample } from '../samples';

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
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      else if (config.auth.type === 'basic')
        headers['Authorization'] = `Basic ${token}`;
    }
    try {
      const r = await fetch(`${baseUrl}${page.path}`, {
        method: page.method,
        headers,
      });
      const txt = await r.text();
      try {
        setResponse(JSON.stringify(JSON.parse(txt), null, 2));
      } catch {
        setResponse(txt);
      }
    } catch (err) {
      setResponse(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => navigator.clipboard?.writeText(sample);

  return (
    <aside class="nd-right">
      <div class="nd-code-card">
        <div class="nd-code-header">
          <div class="nd-tabs">
            {LANGS.map((l) => (
              <button
                key={l.id}
                class={`nd-tab ${lang === l.id ? 'active' : ''}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button class="nd-copy-btn" onClick={copy}>
            Copy
          </button>
        </div>
        <CodeBlock code={sample} lang={langMeta.shiki} />
      </div>

      {config.auth && config.auth.type !== 'none' && (
        <div class="nd-try">
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--nd-muted, var(--color-nd-muted))',
              marginBottom: 6,
            }}
          >
            {config.auth.label || 'Token'}
          </label>
          <input
            class="nd-input"
            type="password"
            value={token}
            placeholder="paste token…"
            onInput={(e) => setToken((e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      <button class="nd-btn" onClick={execute} disabled={loading}>
        {loading ? 'Sending…' : `Send ${page.method}`}
      </button>

      {response !== null && <pre class="nd-response">{response}</pre>}
    </aside>
  );
}
