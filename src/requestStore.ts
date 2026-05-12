import { signal, computed } from '@preact/signals';
import type { AuthConfig, EndpointPage, NinodocsConfig } from './types';
import { isEndpoint, resolveAuth } from './types';
import { buildRequest, defaultValues, type BuiltRequest, type RequestValues } from './request';

export interface ExecutionResult {
  status: number;
  body: string;
  ms: number;
  headers: Record<string, string>;
}

const emptyValues: RequestValues = { params: {}, query: {}, headers: {}, body: '' };

const TOKEN_STORAGE_KEY = 'ninodocs:token';

function loadToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export const token = signal<string>(loadToken());
export const values = signal<RequestValues>(emptyValues);
export const loading = signal<boolean>(false);
export const result = signal<ExecutionResult | null>(null);
export const currentEndpoint = signal<EndpointPage | null>(null);
export const currentConfig = signal<NinodocsConfig | null>(null);

token.subscribe((v) => {
  try {
    if (v) localStorage.setItem(TOKEN_STORAGE_KEY, v);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage blocked */
  }
});

export function clearToken() {
  token.value = '';
}

export function syncEndpoint(config: NinodocsConfig, endpoint: EndpointPage | null) {
  currentConfig.value = config;
  currentEndpoint.value = endpoint;
  values.value = endpoint ? defaultValues(endpoint) : emptyValues;
  result.value = null;
}

export function setParam(kind: 'params' | 'query' | 'headers', name: string, v: string) {
  values.value = {
    ...values.value,
    [kind]: { ...values.value[kind], [name]: v },
  };
}

export function setBody(v: string) {
  values.value = { ...values.value, body: v };
}

function endpointBaseUrl(): string {
  const ep = currentEndpoint.value;
  const cfg = currentConfig.value;
  if (!ep || !cfg) return '';
  return ep.baseUrl || cfg.baseUrl || '';
}

function endpointAuth(): AuthConfig | undefined {
  return resolveAuth(currentEndpoint.value, currentConfig.value?.auth);
}

export const built = computed<BuiltRequest | null>(() => {
  const ep = currentEndpoint.value;
  if (!ep) return null;
  return buildRequest({
    endpoint: ep,
    baseUrl: endpointBaseUrl(),
    auth: endpointAuth(),
    token: token.value,
    values: values.value,
  });
});

export async function execute() {
  const req = built.value;
  if (!req) return;
  loading.value = true;
  result.value = null;
  const t0 = performance.now();
  try {
    const r = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body ?? undefined,
    });
    const txt = await r.text();
    let body = txt;
    try {
      body = JSON.stringify(JSON.parse(txt), null, 2);
    } catch {
      /* not JSON */
    }
    const headers: Record<string, string> = {};
    r.headers.forEach((v, k) => (headers[k] = v));
    result.value = { status: r.status, body, ms: Math.round(performance.now() - t0), headers };
  } catch (err) {
    result.value = {
      status: 0,
      body: `Error: ${(err as Error).message}`,
      ms: Math.round(performance.now() - t0),
      headers: {},
    };
  } finally {
    loading.value = false;
  }
}

export function currentEndpointIsEndpoint(): EndpointPage | null {
  const ep = currentEndpoint.value;
  return ep && isEndpoint(ep) ? ep : null;
}
