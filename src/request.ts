import type { AuthConfig, EndpointPage } from './types';

export interface RequestValues {
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
}

export interface BuiltRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

const HAS_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function methodHasBody(method: string): boolean {
  return HAS_BODY.has(method.toUpperCase());
}

export function substitutePath(path: string, params: Record<string, string>): string {
  return path.replace(/\{([^}]+)\}/g, (_, name) => {
    const v = params[name];
    return v != null && v !== '' ? encodeURIComponent(v) : `{${name}}`;
  });
}

export function buildQueryString(query: Record<string, string>): string {
  const entries = Object.entries(query).filter(([, v]) => v !== '' && v != null);
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

export function authHeader(
  auth: AuthConfig | undefined,
  token: string | undefined,
): [string, string] | null {
  if (!auth || auth.type === 'none' || !token) return null;
  if (auth.type === 'bearer') return ['Authorization', `Bearer ${token}`];
  if (auth.type === 'apiKey') return [auth.headerName || 'X-API-Key', token];
  if (auth.type === 'basic') return ['Authorization', `Basic ${token}`];
  return null;
}

export function buildRequest(opts: {
  endpoint: EndpointPage;
  baseUrl: string;
  auth?: AuthConfig;
  token?: string;
  values: RequestValues;
}): BuiltRequest {
  const { endpoint, baseUrl, auth, token, values } = opts;
  const resolvedPath = substitutePath(endpoint.path, values.params);
  const qs = buildQueryString(values.query);
  const url = `${baseUrl}${resolvedPath}${qs}`;

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(values.headers)) {
    if (v !== '' && v != null) headers[k] = v;
  }

  const auth$ = authHeader(auth, token);
  if (auth$) headers[auth$[0]] = auth$[1];

  let body: string | null = null;
  if (methodHasBody(endpoint.method) && endpoint.body && values.body.trim() !== '') {
    body = values.body;
    headers['Content-Type'] = endpoint.body.contentType || 'application/json';
  }

  return { url, method: endpoint.method, headers, body };
}

export function defaultValues(endpoint: EndpointPage): RequestValues {
  const params: Record<string, string> = {};
  for (const p of endpoint.params || []) params[p.name] = p.example != null ? String(p.example) : '';

  const query: Record<string, string> = {};
  for (const q of endpoint.query || []) query[q.name] = q.example != null ? String(q.example) : '';

  const headers: Record<string, string> = {};
  for (const h of endpoint.headers || []) {
    if (h.hidden) continue;
    headers[h.name] = h.example != null ? String(h.example) : '';
  }

  let body = '';
  if (endpoint.body?.example !== undefined) {
    body =
      typeof endpoint.body.example === 'string'
        ? endpoint.body.example
        : JSON.stringify(endpoint.body.example, null, 2);
  }
  return { params, query, headers, body };
}
