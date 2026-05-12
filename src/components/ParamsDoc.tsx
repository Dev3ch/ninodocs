import type { ComponentChildren } from 'preact';
import type { BodySpec, EndpointPage, NinodocsConfig, ParamSpec } from '../types';
import { methodHasBody } from '../request';
import { CodeBlock } from './CodeBlock';

interface Props {
  config: NinodocsConfig;
  endpoint: EndpointPage;
}

export function ParamsDoc({ config, endpoint }: Props) {
  const auth = config.auth;
  const visibleHeaders = (endpoint.headers || []).filter((h) => !h.hidden);
  const showBody = methodHasBody(endpoint.method) && !!endpoint.body;

  return (
    <div class="nd-doc">
      {auth && auth.type !== 'none' && (
        <Section title="Authorizations" rightLabel={auth.type === 'apiKey' ? 'ApiKeyAuth' : auth.type}>
          <ParamDoc
            spec={{
              name: auth.headerName || (auth.type === 'apiKey' ? 'X-API-Key' : 'Authorization'),
              type: 'string',
              required: true,
              description:
                auth.label
                  ? `${auth.label}. ${authHelp(auth.type)}`
                  : authHelp(auth.type),
            }}
            location={auth.type === 'apiKey' ? 'header' : 'header'}
          />
        </Section>
      )}

      {endpoint.params && endpoint.params.length > 0 && (
        <Section title="Path Parameters">
          {endpoint.params.map((p) => (
            <ParamDoc key={p.name} spec={p} />
          ))}
        </Section>
      )}

      {endpoint.query && endpoint.query.length > 0 && (
        <Section title="Query Parameters">
          {endpoint.query.map((p) => (
            <ParamDoc key={p.name} spec={p} />
          ))}
        </Section>
      )}

      {visibleHeaders.length > 0 && (
        <Section title="Headers">
          {visibleHeaders.map((p) => (
            <ParamDoc key={p.name} spec={p} location="header" />
          ))}
        </Section>
      )}

      {showBody && <BodyDoc body={endpoint.body!} />}
    </div>
  );
}

function authHelp(type: string): string {
  if (type === 'bearer') return 'Send your token in the `Authorization` header as `Bearer <token>`.';
  if (type === 'apiKey') return 'Send your API key in the configured header.';
  if (type === 'basic') return 'Use HTTP Basic auth: `Authorization: Basic base64(user:pass)`.';
  return '';
}

function Section({
  title,
  rightLabel,
  children,
}: {
  title: string;
  rightLabel?: string;
  children: ComponentChildren;
}) {
  return (
    <section class="nd-doc-section">
      <header class="nd-doc-section-header">
        <h2 class="nd-doc-section-title">{title}</h2>
        {rightLabel && <span class="nd-doc-section-right">{rightLabel}</span>}
      </header>
      <div class="nd-doc-section-body">{children}</div>
    </section>
  );
}

function ParamDoc({ spec, location }: { spec: ParamSpec; location?: string }) {
  return (
    <div class="nd-doc-param">
      <div class="nd-doc-param-head">
        <code class="nd-doc-param-name">{spec.name}</code>
        {spec.type && <span class="nd-field-type">{spec.type}</span>}
        {location && <span class="nd-doc-param-loc">{location}</span>}
        {spec.required && <span class="nd-field-required">required</span>}
      </div>
      {spec.description && <p class="nd-doc-param-desc">{spec.description}</p>}
      {spec.enum && (
        <p class="nd-doc-param-meta">
          <span class="nd-doc-param-meta-label">Available options:</span>{' '}
          {spec.enum.map((opt, i) => (
            <>
              {i > 0 && <span class="nd-doc-param-meta-sep">,</span>}
              <code class="nd-doc-inline-chip">{String(opt)}</code>
            </>
          ))}
        </p>
      )}
      {spec.example != null && (
        <p class="nd-doc-param-meta">
          <span class="nd-doc-param-meta-label">Example:</span>{' '}
          <code class="nd-doc-inline-chip">{JSON.stringify(spec.example)}</code>
        </p>
      )}
    </div>
  );
}

function BodyDoc({ body }: { body: BodySpec }) {
  const example =
    body.example === undefined
      ? ''
      : typeof body.example === 'string'
        ? body.example
        : JSON.stringify(body.example, null, 2);
  const isJson =
    typeof body.example !== 'string' && (!body.contentType || body.contentType.includes('json'));
  return (
    <Section title="Body" rightLabel={body.contentType || 'application/json'}>
      {body.description && <p class="nd-doc-param-desc">{body.description}</p>}
      {example && (
        <div class="nd-doc-body-example-wrap">
          <CodeBlock code={example} lang={isJson ? 'json' : 'text'} />
        </div>
      )}
    </Section>
  );
}
