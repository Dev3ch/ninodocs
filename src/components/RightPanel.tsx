import { useMemo, useState } from 'preact/hooks';
import type { NinodocsConfig, Page } from '../types';
import { isEndpoint } from '../types';
import { CodeBlock } from './CodeBlock';
import { curlSample, jsSample, pythonSample } from '../samples';
import { built } from '../requestStore';
import { IconCheck, IconCopy } from './icons';

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
  const [copied, setCopied] = useState(false);
  const themeMode = config.theme?.mode === 'light' ? 'light' : 'dark';

  if (!page || !isEndpoint(page)) return <aside class="nd-right" />;

  const req = built.value;
  const sample = useMemo(() => {
    if (!req) return '';
    if (lang === 'curl') return curlSample(req);
    if (lang === 'js') return jsSample(req);
    return pythonSample(req);
  }, [req, lang]);

  const langMeta = LANGS.find((l) => l.id === lang)!;

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
    <aside class="nd-right" aria-label="Code samples">
      <div class="nd-code-card nd-right-sticky">
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
    </aside>
  );
}
