import type { BuiltRequest } from './request';

function shellEscape(s: string): string {
  return s.replace(/'/g, `'\\''`);
}

export function curlSample(req: BuiltRequest): string {
  const lines = [`curl --request ${req.method} \\`, `  --url '${shellEscape(req.url)}'`];
  for (const [k, v] of Object.entries(req.headers)) {
    lines.push(`  --header '${shellEscape(`${k}: ${v}`)}'`);
  }
  if (req.body != null) {
    lines.push(`  --data '${shellEscape(req.body)}'`);
  }
  return lines.join(' \\\n').replace(/ \\\n$/, '');
}

export function jsSample(req: BuiltRequest): string {
  const init: Record<string, unknown> = {
    method: req.method,
    headers: req.headers,
  };
  if (req.body != null) init.body = req.body;
  return `const res = await fetch(${JSON.stringify(req.url)}, ${JSON.stringify(init, null, 2)});
const data = await res.json();`;
}

export function pythonSample(req: BuiltRequest): string {
  const headers = JSON.stringify(req.headers, null, 4).replace(/\n/g, '\n    ');
  const fn = req.method.toLowerCase();
  const lines = [`import requests`, ``, `response = requests.${fn}(`, `    "${req.url}",`];
  if (Object.keys(req.headers).length) lines.push(`    headers=${headers},`);
  if (req.body != null) {
    let dataLine: string;
    try {
      const parsed = JSON.parse(req.body);
      const json = JSON.stringify(parsed, null, 4).replace(/\n/g, '\n    ');
      dataLine = `    json=${json},`;
    } catch {
      dataLine = `    data=${JSON.stringify(req.body)},`;
    }
    lines.push(dataLine);
  }
  lines.push(`)`, `print(response.json())`);
  return lines.join('\n');
}
