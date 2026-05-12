import type { AuthConfig, EndpointPage } from './types';

interface SampleInput {
  endpoint: EndpointPage;
  baseUrl: string;
  auth?: AuthConfig;
  token?: string;
}

function authHeaderTuple(auth: AuthConfig | undefined, token: string | undefined): [string, string] | null {
  if (!auth || auth.type === 'none' || !token) return null;
  if (auth.type === 'bearer') return ['Authorization', `Bearer ${token}`];
  if (auth.type === 'apiKey') return [auth.headerName || 'X-API-Key', token];
  if (auth.type === 'basic') return ['Authorization', `Basic ${token}`];
  return null;
}

export function curlSample({ endpoint, baseUrl, auth, token }: SampleInput): string {
  const url = `${baseUrl}${endpoint.path}`;
  const lines = [`curl --request ${endpoint.method} \\`, `  --url ${url}`];
  const h = authHeaderTuple(auth, token);
  if (h) lines.push(`  --header '${h[0]}: ${h[1]}'`);
  if (endpoint.method !== 'GET' && endpoint.method !== 'HEAD') {
    lines.push(`  --header 'Content-Type: application/json'`);
  }
  return lines.join(' \\\n').replace(/ \\\n$/, '');
}

export function jsSample({ endpoint, baseUrl, auth, token }: SampleInput): string {
  const url = `${baseUrl}${endpoint.path}`;
  const headers: Record<string, string> = {};
  const h = authHeaderTuple(auth, token);
  if (h) headers[h[0]] = h[1];
  if (endpoint.method !== 'GET' && endpoint.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }
  return `const res = await fetch('${url}', {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(headers, null, 2)},
});
const data = await res.json();`;
}

export function pythonSample({ endpoint, baseUrl, auth, token }: SampleInput): string {
  const url = `${baseUrl}${endpoint.path}`;
  const h = authHeaderTuple(auth, token);
  const headers: Record<string, string> = {};
  if (h) headers[h[0]] = h[1];
  return `import requests

response = requests.${endpoint.method.toLowerCase()}(
    "${url}",
    headers=${JSON.stringify(headers)},
)
print(response.json())`;
}
