import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { EndpointPage, NinodocsConfig, ParamSpec } from '../types';
import { methodHasBody, substitutePath } from '../request';
import {
  built,
  execute,
  loading,
  result,
  setBody,
  setParam,
  token,
  values,
} from '../requestStore';
import { CodeBlock } from './CodeBlock';
import { JsonEditor } from './JsonEditor';
import { curlSample, jsSample, pythonSample } from '../samples';
import { IconCheck, IconCopy, IconPlay, IconX } from './icons';

interface Props {
  config: NinodocsConfig;
  endpoint: EndpointPage;
  open: boolean;
  onClose: () => void;
}

type Lang = 'curl' | 'js' | 'python';
const LANGS: { id: Lang; label: string; shiki: string }[] = [
  { id: 'curl', label: 'cURL', shiki: 'bash' },
  { id: 'js', label: 'JavaScript', shiki: 'javascript' },
  { id: 'python', label: 'Python', shiki: 'python' },
];

export function TryItDrawer({ config, endpoint, open, onClose }: Props) {
  const [lang, setLang] = useState<Lang>('curl');
  const [copied, setCopied] = useState(false);
  const themeMode = config.theme?.mode === 'light' ? 'light' : 'dark';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.documentElement.style.overflow;
    const prevPaddingRight = document.documentElement.style.paddingRight;
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
      document.documentElement.style.paddingRight = prevPaddingRight;
    };
  }, [open, onClose]);

  const v = values.value;
  const req = built.value;
  const res = result.value;

  const sample = useMemo(() => {
    if (!req) return '';
    if (lang === 'curl') return curlSample(req);
    if (lang === 'js') return jsSample(req);
    return pythonSample(req);
  }, [req, lang]);

  const langMeta = LANGS.find((l) => l.id === lang)!;
  const baseUrl = endpoint.baseUrl || config.baseUrl || '';
  const previewPath = substitutePath(endpoint.path, v.params);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(sample);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };

  const auth = config.auth;
  const visibleHeaders = (endpoint.headers || []).filter((h) => !h.hidden);
  const showBody = methodHasBody(endpoint.method) && !!endpoint.body;

  return (
    <>
      <div
        class={`nd-drawer-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        class={`nd-drawer ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Try it"
      >
        <header class="nd-drawer-header">
          <div class="nd-drawer-title">
            <span class={`nd-method ${endpoint.method}`}>{endpoint.method}</span>
            <span class="nd-drawer-path" title={`${baseUrl}${previewPath}`}>
              {previewPath}
            </span>
          </div>
          <button class="nd-icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </header>

        <div class="nd-drawer-body">
          {auth && auth.type !== 'none' && (
            <DrawerGroup title="Authorization">
              <InputRow
                label={auth.headerName || (auth.type === 'apiKey' ? 'X-API-Key' : 'Authorization')}
                hint={auth.label || `Paste your ${auth.type} token`}
                required
              >
                <input
                  class="nd-input"
                  type="password"
                  autocomplete="off"
                  value={token.value}
                  placeholder="paste your token…"
                  onInput={(e) => (token.value = (e.target as HTMLInputElement).value)}
                />
              </InputRow>
            </DrawerGroup>
          )}

          {endpoint.params && endpoint.params.length > 0 && (
            <DrawerGroup title="Path">
              {endpoint.params.map((p) => (
                <DrawerField
                  key={p.name}
                  spec={p}
                  value={v.params[p.name] ?? ''}
                  onInput={(val) => setParam('params', p.name, val)}
                />
              ))}
            </DrawerGroup>
          )}

          {endpoint.query && endpoint.query.length > 0 && (
            <DrawerGroup title="Query">
              {endpoint.query.map((p) => (
                <DrawerField
                  key={p.name}
                  spec={p}
                  value={v.query[p.name] ?? ''}
                  onInput={(val) => setParam('query', p.name, val)}
                />
              ))}
            </DrawerGroup>
          )}

          {visibleHeaders.length > 0 && (
            <DrawerGroup title="Headers">
              {visibleHeaders.map((p) => (
                <DrawerField
                  key={p.name}
                  spec={p}
                  value={v.headers[p.name] ?? ''}
                  onInput={(val) => setParam('headers', p.name, val)}
                />
              ))}
            </DrawerGroup>
          )}

          {showBody && (
            <DrawerGroup
              title="Body"
              right={endpoint.body!.contentType || 'application/json'}
            >
              <JsonEditor value={v.body} onInput={setBody} mode={themeMode} minRows={8} />
            </DrawerGroup>
          )}

          <DrawerGroup title="Request preview">
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
          </DrawerGroup>

          {res && (
            <DrawerGroup
              title="Response"
              right={`${res.ms} ms`}
              status={res.status}
            >
              <div class="nd-drawer-response-wrap">
                <CodeBlock code={res.body} lang="json" mode={themeMode} />
              </div>
            </DrawerGroup>
          )}
        </div>

        <footer class="nd-drawer-footer">
          <button
            class="nd-send-btn nd-send-btn-block"
            onClick={execute}
            disabled={loading.value}
          >
            {loading.value ? (
              <span class="nd-send-spinner" aria-hidden="true" />
            ) : (
              <IconPlay />
            )}
            <span>{loading.value ? 'Sending…' : `Send ${endpoint.method}`}</span>
          </button>
        </footer>
      </aside>
    </>
  );
}

function DrawerGroup({
  title,
  right,
  status,
  children,
}: {
  title: string;
  right?: string;
  status?: number;
  children: ComponentChildren;
}) {
  const statusCls =
    status == null
      ? ''
      : status >= 200 && status < 300
        ? 'ok'
        : status >= 300 && status < 400
          ? 'redir'
          : status >= 400 && status < 500
            ? 'cli'
            : status >= 500
              ? 'srv'
              : 'err';
  return (
    <div class="nd-drawer-group">
      <div class="nd-drawer-group-head">
        <span class="nd-drawer-group-title">{title}</span>
        {status != null && (
          <span class={`nd-status-pill ${statusCls}`}>{status || 'ERR'}</span>
        )}
        {right && <span class="nd-drawer-group-right">{right}</span>}
      </div>
      <div class="nd-drawer-group-body">{children}</div>
    </div>
  );
}

function InputRow({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ComponentChildren;
}) {
  return (
    <label class="nd-drawer-row">
      <span class="nd-drawer-row-label">
        <code class="nd-field-name">{label}</code>
        {required && <span class="nd-field-required">required</span>}
      </span>
      {children}
      {hint && <span class="nd-drawer-row-hint">{hint}</span>}
    </label>
  );
}

function DrawerField({
  spec,
  value,
  onInput,
}: {
  spec: ParamSpec;
  value: string;
  onInput: (v: string) => void;
}) {
  return (
    <InputRow
      label={spec.name}
      required={spec.required}
      hint={shortHint(spec)}
    >
      {spec.enum ? (
        <select
          class="nd-input"
          value={value}
          onChange={(e) => onInput((e.target as HTMLSelectElement).value)}
        >
          {!spec.required && <option value="">—</option>}
          {spec.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      ) : (
        <input
          class="nd-input"
          type={spec.type === 'integer' || spec.type === 'number' ? 'number' : 'text'}
          value={value}
          placeholder={spec.example != null ? String(spec.example) : spec.name}
          onInput={(e) => onInput((e.target as HTMLInputElement).value)}
        />
      )}
    </InputRow>
  );
}

function shortHint(spec: ParamSpec): string {
  if (spec.type === 'integer' || spec.type === 'number') return spec.type;
  if (spec.enum) return spec.enum.map(String).join(' · ');
  return spec.type || '';
}
